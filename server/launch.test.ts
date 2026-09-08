import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { registerCalendlyWebhook } from "./calendlyWebhook";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { notifyOwner } from "./_core/notification";

vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn() }));
const servers: Server[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  })));
});

describe("launch failure handling", () => {
  const caller = appRouter.createCaller({ user: null, req: { headers: {} }, res: {} } as TrpcContext);
  const message = { name: "Launch Test", email: "test@example.com", message: "A synthetic launch check." };

  it("does not acknowledge an undelivered contact message", async () => {
    vi.mocked(notifyOwner).mockResolvedValue(false);
    await expect(caller.contact.submit(message)).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });

  it("acknowledges a contact message accepted by SMTP", async () => {
    vi.mocked(notifyOwner).mockResolvedValue(true);
    await expect(caller.contact.submit(message)).resolves.toMatchObject({ success: true });
  });

  it("rejects Calendly events when signing is unconfigured", async () => {
    vi.stubEnv("CALENDLY_WEBHOOK_SECRET", "");
    const app = express();
    registerCalendlyWebhook(app);
    const server = await new Promise<Server>(resolve => {
      const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    });
    servers.push(server);
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Missing test port");
    const response = await fetch(`http://127.0.0.1:${address.port}/api/calendly/webhook`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "invitee.created", payload: {} }),
    });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ received: false });
    expect(notifyOwner).not.toHaveBeenCalled();
  });
});
