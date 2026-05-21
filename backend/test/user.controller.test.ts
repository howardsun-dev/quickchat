import { beforeEach, describe, expect, it, vi } from 'vitest';

const findById = vi.fn();

vi.mock('../src/models/User.ts', () => ({
  default: { findById },
}));

const makeRes = () => {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
};

describe('user controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid user ids', async () => {
    const { getUserStatus } = await import('../src/controllers/user.controller.ts');
    const res = makeRes();

    await getUserStatus({ params: { id: 'bad-id' } } as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user id' });
    expect(findById).not.toHaveBeenCalled();
  });

  it('returns public user status fields for valid ids', async () => {
    const { getUserStatus } = await import('../src/controllers/user.controller.ts');
    const res = makeRes();
    const user = { _id: '507f1f77bcf86cd799439011', fullName: 'Howard', profilePic: '', lastSeen: null };
    const select = vi.fn().mockResolvedValue(user);
    findById.mockReturnValue({ select });

    await getUserStatus({ params: { id: '507f1f77bcf86cd799439011' } } as any, res as any);

    expect(findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(select).toHaveBeenCalledWith('fullName profilePic lastSeen');
    expect(res.json).toHaveBeenCalledWith(user);
  });
});
