import type { CookieOptions, Request } from "express";

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    // "lax" sends the cookie on top-level navigations (including the OAuth
    // redirect back to the app) but NOT on cross-site background requests,
    // which mitigates CSRF. Use "none" only if the app must run embedded in a
    // cross-origin iframe.
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}
