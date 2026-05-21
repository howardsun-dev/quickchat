import { describe, expect, it, vi } from 'vitest';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { handleError } from './handleError';

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, isAxiosError: vi.fn() };
});

describe('handleError', () => {
  it('suppresses 401 errors so auth checks can fail silently', () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.mocked(isAxiosError).mockReturnValue(true);

    const result = handleError({ response: { status: 401 } }, 'fallback');

    expect(result).toBeUndefined();
    expect(toast.error).not.toHaveBeenCalled();
    consoleLog.mockRestore();
  });

  it('uses server error messages for axios errors', () => {
    vi.mocked(isAxiosError).mockReturnValue(true);

    handleError({ response: { data: { message: 'Server says no' } } }, 'fallback');

    expect(toast.error).toHaveBeenCalledWith('Server says no');
  });

  it('returns and displays fallback for non-axios errors', () => {
    vi.mocked(isAxiosError).mockReturnValue(false);

    const result = handleError(new Error('boom'), 'fallback');

    expect(result).toBe('fallback');
    expect(toast.error).toHaveBeenCalledWith('fallback');
  });
});
