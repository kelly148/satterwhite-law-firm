/**
 * adminAuth.ts — self-hosted owner login.
 *
 * Replaces the Manus OAuth flow. The session mechanism itself is unchanged: we
 * still mint the same HS256 JWT into the same cookie, so `protectedProcedure`,
 * `adminProcedure` and `sdk.verifySession` all keep working untouched. The only
 * thing that changed is how that session gets issued.
 *
 * The owner's password is never stored. `ADMIN_PASSWORD_HASH` holds a scrypt
 * digest in the form `scrypt:<saltHex>:<keyHex>`; generate one with:
 *
 *   node scripts/hash-password.mjs 'your-password'
 *
 * Comparison is constant-time. Failed attempts are rate limited per IP to blunt
 * online guessing, since a single shared password is the whole gate here.
 */

import { COOKIE_NAME } from "@shared/const";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import type { Express, Request, Response } from "express";
import { promisify } from "util";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SESSION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

// Rate limiting: 10 failures per IP per 15 minutes.
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

/** Build an `ADMIN_PASSWORD_HASH` value for a plaintext password. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

/** Constant-time verification of a password against a stored scrypt digest. */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    console.error(
      "[AdminAuth] ADMIN_PASSWORD_HASH is malformed — expected scrypt:<saltHex>:<keyHex>"
    );
    return false;
  }

  const [, saltHex, keyHex] = parts;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltHex, "hex");
    expected = Buffer.from(keyHex, "hex");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length !== KEY_LENGTH) return false;

  const actual = await scrypt(password, salt, KEY_LENGTH);
  return timingSafeEqual(actual, expected);
}

export function registerAdminAuthRoutes(app: Express) {
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const ip = req.ip ?? "unknown";

    if (tooManyAttempts(ip)) {
      res
        .status(429)
        .json({ error: "Too many failed attempts. Try again in 15 minutes." });
      return;
    }

    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!password) {
      res.status(400).json({ error: "Password is required." });
      return;
    }

    if (!ENV.adminPasswordHash) {
      console.error(
        "[AdminAuth] ADMIN_PASSWORD_HASH is not set — admin login is disabled."
      );
      res.status(500).json({ error: "Admin login is not configured." });
      return;
    }

    const ok = await verifyPassword(password, ENV.adminPasswordHash);
    if (!ok) {
      recordFailure(ip);
      // Deliberately vague: never reveal whether the account or the password
      // was the problem.
      res.status(401).json({ error: "Incorrect password." });
      return;
    }

    clearAttempts(ip);

    try {
      // Keep the owner row in sync so `authenticateRequest` can resolve the
      // session to a real user with the admin role.
      await db.upsertUser({
        openId: ENV.ownerOpenId,
        name: ENV.ownerName,
        email: ENV.ownerEmail || null,
        loginMethod: "password",
        role: "admin",
        lastSignedIn: new Date(),
      });

      // A cookie is only useful if the session can actually resolve to a user
      // row. Without a database that never happens, so fail loudly here rather
      // than handing back a session that silently fails on every admin page.
      const owner = await db.getUserByOpenId(ENV.ownerOpenId);
      if (!owner) {
        console.error(
          "[AdminAuth] Owner record unavailable after upsert — is DATABASE_URL set?"
        );
        res.status(503).json({
          error:
            "The database is unavailable, so the session could not be created. Check DATABASE_URL.",
        });
        return;
      }

      const token = await sdk.signSession(
        { openId: ENV.ownerOpenId, appId: ENV.appId, name: ENV.ownerName },
        { expiresInMs: SESSION_MS }
      );

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: SESSION_MS });
      res.json({ success: true });
    } catch (error) {
      console.error("[AdminAuth] Login failed", error);
      res.status(500).json({ error: "Login failed. Please try again." });
    }
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}

export const ADMIN_SESSION_MS = SESSION_MS;
