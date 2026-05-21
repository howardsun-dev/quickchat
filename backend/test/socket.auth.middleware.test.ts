import { beforeEach, describe, expect, it, vi } from 'vitest';

const findById = vi.fn();
const jwtVerify = vi.fn();

vi.mock('../src/models/User.ts', () => ({
  default: { findById },
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: jwtVerify },
}));

const makeSocket = (cookie?: string) => ({
  handshake: { headers: { cookie } },
});

describe('socketAuthMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects socket connections without a jwt cookie', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { socketAuthMiddleware } = await import('../src/middleware/socket.auth.middleware.ts');
    const next = vi.fn();

    await socketAuthMiddleware(makeSocket() as any, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Unauthorized - No Token Provided' }));
    consoleLog.mockRestore();
  });

  it('authenticates valid socket cookies and attaches user fields', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { socketAuthMiddleware } = await import('../src/middleware/socket.auth.middleware.ts');
    const socket = makeSocket('theme=dark; jwt=valid-token') as any;
    const next = vi.fn();
    jwtVerify.mockReturnValue({ userId: '507f1f77bcf86cd799439011' });
    const user = { _id: { toString: () => '507f1f77bcf86cd799439011' }, fullName: 'Howard' };
    findById.mockReturnValue({ select: vi.fn().mockResolvedValue(user) });

    await socketAuthMiddleware(socket, next);

    expect(jwtVerify).toHaveBeenCalledWith('valid-token', 'test-jwt-secret');
    expect(socket.user).toBe(user);
    expect(socket.userId).toBe('507f1f77bcf86cd799439011');
    expect(next).toHaveBeenCalledWith();
    consoleLog.mockRestore();
  });
});
