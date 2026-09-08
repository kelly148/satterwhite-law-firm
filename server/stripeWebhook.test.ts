import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import Stripe from "stripe";
import { registerStripeWebhook } from "./stripeWebhook";
import { getDb } from "./db";
vi.mock("./db", () => ({ getDb: vi.fn() }));
const servers: Server[] = [];
afterEach(async () => {
  vi.unstubAllEnvs(); vi.clearAllMocks();
  await Promise.all(servers.splice(0).map(s => new Promise<void>((resolve,reject) => {
    s.close(e => e ? reject(e) : resolve()); s.closeAllConnections();
  })));
});
const secret = 'whsec_synthetic_local_test_only';
async function deliver(signed = true) {
  vi.stubEnv('STRIPE_SECRET_KEY','sk_test_synthetic_local_test_only');
  vi.stubEnv('STRIPE_WEBHOOK_SECRET',secret);
  const app=express(); registerStripeWebhook(app);
  const server=await new Promise<Server>(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  servers.push(server); const address=server.address();
  if(!address || typeof address==='string') throw new Error('Missing test port');
  const payload=JSON.stringify({id:'evt_local_verification',type:'checkout.session.completed',data:{object:{id:'cs_local',payment_intent:'pi_local',amount_total:100,currency:'usd'}}});
  const signature=Stripe.webhooks.generateTestHeaderString({payload,secret});
  return fetch('http://127.0.0.1:'+address.port+'/api/stripe/webhook',{method:'POST',headers:{'Content-Type':'application/json',...(signed?{'stripe-signature':signature}:{})},body:payload});
}
describe('real Stripe webhook delivery',()=>{
  it('returns 500 for a verified payment when storage is unavailable, permitting retry',async()=>{
    vi.mocked(getDb).mockResolvedValue(null);
    expect((await deliver()).status).toBe(500);
  });
  it('acknowledges an already stored payment without inserting a duplicate',async()=>{
    const insert=vi.fn();
    vi.mocked(getDb).mockResolvedValue({select:()=>({from:()=>({where:()=>({limit:async()=>[{id:1}]})})}),insert} as any);
    expect((await deliver()).status).toBe(200); expect(insert).not.toHaveBeenCalled();
  });
  it('rejects unsigned requests before touching storage',async()=>{
    expect((await deliver(false)).status).toBe(400); expect(getDb).not.toHaveBeenCalled();
  });
});
