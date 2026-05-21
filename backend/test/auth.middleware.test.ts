import { beforeEach, describe, expect, it, vi } from 'vitest';

const findById = vi.fn();
const jwtVerify = vi.fn();

vi.mock('../src/models/User.ts', () => ({
  default: { findById },
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: jwtVerify },
}));

const makeRes = () => {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
};

describe('protectRoute middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects requests without a jwt cookie', async () => {
    const { protectRoute } = await import('../src/middleware/auth.middleware.ts');
    const req = { cookies: {} } as any;
    const res = makeRes();
    const next = vi.fn();

    await protectRoute(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized - no Token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches the current user and calls next for a valid token', async () => {
    const { protectRoute } = await import('../src/middleware/auth.middleware.ts');
    const req = { cookies: { jwt: 'valid-token' } } as any;
    const res = makeRes();
    const next = vi.fn();
    jwtVerify.mockReturnValue({ userId: 'user-1' });
    const user = { _id: 'user-1', fullName: 'Howard' };
    findById.mockReturnValue({ select: vi.fn().mockResolvedValue(user) });

    await protectRoute(req, res as any, next);

    expect(jwtVerify).toHaveBeenCalledWith('valid-token', 'test-jwt-secret');
    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledOnce();
  });
});
