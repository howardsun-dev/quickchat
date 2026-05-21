import { beforeEach, describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();
const findById = vi.fn();
const genSalt = vi.fn();
const hash = vi.fn();
const compare = vi.fn();

vi.mock('../src/models/User.ts', () => ({
  default: { findOne, findById },
}));

vi.mock('bcryptjs', () => ({
  default: { genSalt, hash, compare },
}));

vi.mock('../src/lib/utils.ts', () => ({
  generateToken: vi.fn(),
}));

vi.mock('../src/emails/emailHandlers.ts', () => ({
  sendForgotPasswordEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
}));

vi.mock('../src/lib/cloudinary.ts', () => ({
  default: { uploader: { upload: vi.fn() } },
}));

const makeRes = () => {
  const res = { status: vi.fn(), json: vi.fn(), cookie: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
};

describe('auth controller password flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    genSalt.mockResolvedValue('salt');
    hash.mockResolvedValue('hashed-password');
  });

  it('rejects reset requests missing new password fields without throwing', async () => {
    const { resetPassword } = await import('../src/controllers/auth.controller.ts');
    const res = makeRes();

    await resetPassword({ params: {}, body: {}, user: { id: 'user-1' } } as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'New password and confirmation are required',
    });
    expect(findById).not.toHaveBeenCalled();
  });

  it('rejects mismatched password confirmation', async () => {
    const { resetPassword } = await import('../src/controllers/auth.controller.ts');
    const res = makeRes();

    await resetPassword(
      {
        params: {},
        body: { newPassword: 'new-password', confirmPassword: 'different' },
        user: { id: 'user-1' },
      } as any,
      res as any
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Passwords do not match' });
  });

  it('requires currentPassword for logged-in password changes', async () => {
    const { resetPassword } = await import('../src/controllers/auth.controller.ts');
    const res = makeRes();
    findById.mockResolvedValue({ password: 'old-hash', save: vi.fn() });

    await resetPassword(
      {
        params: {},
        body: { newPassword: 'new-password', confirmPassword: 'new-password' },
        user: { id: 'user-1' },
      } as any,
      res as any
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Current password is required' });
  });

  it('updates password when a valid reset token is provided', async () => {
    const { resetPassword } = await import('../src/controllers/auth.controller.ts');
    const res = makeRes();
    const user = {
      resetPasswordToken: 'stored-token',
      resetPasswordExpire: new Date(Date.now() + 1000),
      password: 'old-hash',
      save: vi.fn().mockResolvedValue(undefined),
    };
    findOne.mockResolvedValue(user);

    await resetPassword(
      {
        params: { resetPasswordToken: 'plain-token' },
        body: { newPassword: 'new-password', confirmPassword: 'new-password' },
      } as any,
      res as any
    );

    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({ resetPasswordExpire: expect.any(Object) })
    );
    expect(user.resetPasswordToken).toBeNull();
    expect(user.resetPasswordExpire).toBeNull();
    expect(user.password).toBe('hashed-password');
    expect(user.save).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledWith({ message: 'Password updated successfully' });
  });
});
