/**
 * sdk.ts — session signing and verification.
 *
 * This used to wrap the Manus OAuth service. Everything remote has been
 * removed; what remains is the local HS256 JWT session layer (jose + the
 * JWT_SECRET env var), which never depended on an external platform. Sessions
 * are now issued by server/_core/adminAuth.ts.
 */

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (!secret) {
      // Never sign or verify sessions with an empty key — that would make
      // session tokens trivially forgeable.
      throw new Error(
        "JWT_SECRET is not configured — cannot create or verify sessions."
      );
    }
    return new TextEncoder().encode(secret);
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name } = payload as Record<string, unknown>;

      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId) ||
        !isNonEmptyString(name)
      ) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return { openId, appId, name };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  /**
   * Resolve a request to its signed-in user.
   *
   * A valid signature is necessary but not sufficient: the session's openId
   * must also correspond to a row in `users`. There is no longer any remote
   * directory to fall back to, so an unknown openId is rejected outright
   * rather than being provisioned on the fly.
   */
  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const user = await db.getUserByOpenId(session.openId);
    if (!user) {
      throw ForbiddenError("User not found");
    }

    // Refresh lastSignedIn at most once per hour to avoid a database write on
    // every authenticated request (admin pages fire several per page load).
    const signedInAt = new Date();
    const lastSignedInMs = user.lastSignedIn
      ? new Date(user.lastSignedIn).getTime()
      : 0;
    const ONE_HOUR_MS = 60 * 60 * 1000;
    if (signedInAt.getTime() - lastSignedInMs > ONE_HOUR_MS) {
      await db.upsertUser({ openId: user.openId, lastSignedIn: signedInAt });
    }

    return user;
  }
}

export const sdk = new SDKServer();
