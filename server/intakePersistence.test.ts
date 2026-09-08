import { afterEach, describe, expect, it, vi } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { sendEmail, isEmailConfigured } from './email';
import type { TrpcContext } from './_core/context';
vi.mock('./db', () => ({ getDb: vi.fn() }));
vi.mock('./email', () => ({ sendEmail: vi.fn(), isEmailConfigured: vi.fn() }));
vi.mock('./_core/notification', () => ({ notifyOwner: vi.fn().mockResolvedValue(false) }));
const caller = appRouter.createCaller({ user: null, req: { headers: {} }, res: {} } as TrpcContext);
const detail = { sections: [{ title: 'Members', groups: [{ title: 'Member 2', fields: [{ label: 'Ownership', value: '40%' }] }] }] };
const llc = { clientFirst: 'Launch', clientLast: 'Test', clientEmail: 'test@example.com', clientPhone: '', clientAddress: '', llcName: 'Test LLC', llcType: 'LLC', llcState: 'VA', llcAddress: '', memberCount: '2', managerName: 'Test', formDataJson: JSON.stringify(detail) };
afterEach(() => vi.clearAllMocks());
describe('intake persistence', () => {
  it('stores the complete LLC form and attaches its PDF before acknowledging', async () => {
    const values = vi.fn().mockResolvedValue({});
    vi.mocked(getDb).mockResolvedValue({ insert: () => ({ values }) } as any);
    vi.mocked(isEmailConfigured).mockReturnValue(true);
    vi.mocked(sendEmail).mockResolvedValue(true);
    const result = await caller.llcIntake.submit(llc);
    const saved = values.mock.calls[0][0];
    expect(saved.formType).toBe('llc');
    expect(JSON.parse(saved.formDataJson).sections).toEqual(detail.sections);
    expect(Buffer.from(result.pdfBase64!, 'base64').subarray(0, 4).toString()).toBe('%PDF');
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('Ownership: 40%'), attachments: [expect.objectContaining({ filename: 'LLC_Intake.pdf' })] }));
  });
  it('rejects a trust form if database insertion fails instead of silently losing it', async () => {
    vi.mocked(getDb).mockResolvedValue({ insert: () => ({ values: async () => { throw new Error('Storage failure'); } }) } as any);
    await expect(caller.intake.submit({ clientName: 'Test', clientEmail: 'test@example.com', clientPhone: '', formDataJson: JSON.stringify(detail) })).rejects.toThrow('Storage failure');
    expect(sendEmail).not.toHaveBeenCalled();
  });
  it('rejects an LLC form when storage is unavailable', async () => {
    vi.mocked(getDb).mockResolvedValue(null);
    await expect(caller.llcIntake.submit(llc)).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
