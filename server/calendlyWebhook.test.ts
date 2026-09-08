import { afterEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import { createHmac } from 'node:crypto';
import type { Server } from 'node:http';
import { registerCalendlyWebhook } from './calendlyWebhook';
import { getDb } from './db';
vi.mock('./db', () => ({ getDb: vi.fn() }));
vi.mock('./_core/notification', () => ({ notifyOwner: vi.fn().mockResolvedValue(true) }));
const servers: Server[] = [];
afterEach(async () => {
  vi.unstubAllEnvs(); vi.clearAllMocks();
  await Promise.all(servers.splice(0).map(s => new Promise<void>(resolve => { s.close(() => resolve()); s.closeAllConnections(); })));
});
async function deliver(timestamp = Math.floor(Date.now()/1000)) {
  const secret = 'synthetic-local-calendly-signing-key';
  vi.stubEnv('CALENDLY_WEBHOOK_SECRET', secret);
  const app = express(); registerCalendlyWebhook(app);
  const server = await new Promise<Server>(resolve => { const s = app.listen(0,'127.0.0.1',()=>resolve(s)); });
  servers.push(server); const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing port');
  const body = JSON.stringify({event:'invitee.created',payload:{uri:'https://api.calendly.com/scheduled_events/event1/invitees/invitee2',email:'test@example.com',name:'Synthetic Invitee',scheduled_event:{name:'Consultation',start_time:'2026-09-10T15:00:00Z',end_time:'2026-09-10T15:30:00Z'}}});
  const signature = createHmac('sha256',secret).update(`${timestamp}.${body}`).digest('hex');
  return fetch(`http://127.0.0.1:${address.port}/api/calendly/webhook`,{method:'POST',headers:{'Content-Type':'application/json','Calendly-Webhook-Signature':`t=${timestamp},v1=${signature}`},body});
}
describe('Calendly delivery', () => {
  it('persists the current invitee payload with its scheduled time and invitee identity', async () => {
    const values = vi.fn().mockResolvedValue({});
    vi.mocked(getDb).mockResolvedValue({select:()=>({from:()=>({where:()=>({limit:async()=>[]})})}),insert:()=>({values})} as any);
    expect((await deliver()).status).toBe(200);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({calendlyEventId:'invitee2',inviteeName:'Synthetic Invitee',startTime:new Date('2026-09-10T15:00:00Z')}));
  });
  it('returns a retriable error when storage is unavailable', async () => {
    vi.mocked(getDb).mockResolvedValue(null);
    expect((await deliver()).status).toBe(500);
  });
  it('rejects a valid but expired signature before using storage', async () => {
    expect((await deliver(Math.floor(Date.now()/1000)-600)).status).toBe(400);
    expect(getDb).not.toHaveBeenCalled();
  });
});
