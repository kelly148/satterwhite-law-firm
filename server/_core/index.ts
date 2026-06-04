import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerStripeWebhook } from "../stripeWebhook";
import { registerCalendlyWebhook } from "../calendlyWebhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

/**
 * Validate that critical environment variables are present before the server
 * accepts traffic. In production we refuse to start with a missing/weak
 * JWT_SECRET, because falling back to an empty signing key would let anyone
 * forge an admin session.
 */
function validateEnv() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) return;

  const secret = process.env.JWT_SECRET ?? "";
  if (secret.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or too short (need at least 32 characters). " +
        "Generate one with `openssl rand -base64 32` and set it in Railway → Variables."
    );
  }

  if (!process.env.DATABASE_URL) {
    console.warn(
      "[Startup] DATABASE_URL is not set — database features (intake storage, payments, bookings) will not work."
    );
  }
}

async function startServer() {
  validateEnv();

  const app = express();
  const server = createServer(app);

  // ⚠️ Stripe webhook MUST be registered BEFORE express.json() so the raw body
  // is preserved for HMAC-SHA256 signature verification.
  registerStripeWebhook(app);

  // Calendly webhook — registered before express.json() for consistency
  registerCalendlyWebhook(app);

  // Body size limit. The largest legitimate payload is an intake form, which
  // validation caps at ~200 KB; 2 MB leaves generous headroom while avoiding a
  // needlessly large denial-of-service surface.
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ limit: "2mb", extended: true }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");

  // In production (e.g. Railway) the platform assigns PORT and routes traffic
  // to exactly that port — we must bind to it, never hop to a different one.
  // In development we fall back to finding a free port for convenience.
  let port = preferredPort;
  if (process.env.NODE_ENV !== "production") {
    port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
