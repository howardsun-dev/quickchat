import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { generateToken } from '../src/lib/utils.ts';

const makeResponse = () => ({
  cookie: vi.fn(),
});

describe('generateToken', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'unit-test-secret';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('signs a jwt and stores it in an httpOnly strict cookie', () => {
    process.env.NODE_ENV = 'test';
    const res = makeResponse();

    const token = generateToken('user-123', res as any);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
    expect(res.cookie).toHaveBeenCalledWith(
      'jwt',
      token,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
    );
  });

  it('does not mark the cookie secure in development', () => {
    process.env.NODE_ENV = 'development';
    const res = makeResponse();

    generateToken('user-123', res as any);

    expect(res.cookie).toHaveBeenCalledWith(
      'jwt',
      expect.any(String),
      expect.objectContaining({ secure: false })
    );
  });

  it('throws when JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;
    const res = makeResponse();

    expect(() => generateToken('user-123', res as any)).toThrow(
      'JWT_SECRET is not set'
    );
  });
});
