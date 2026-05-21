import { beforeEach, describe, expect, it, vi } from 'vitest';

const socketOn = vi.fn();
const socketOff = vi.fn();
const socketDisconnect = vi.fn();
const socketRemoveAllListeners = vi.fn();
const io = vi.fn(() => ({
  connected: false,
  on: socketOn,
  off: socketOff,
  disconnect: socketDisconnect,
  removeAllListeners: socketRemoveAllListeners,
}));

vi.mock('socket.io-client', () => ({ io }));

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();

vi.mock('../lib/axios', () => ({
  axiosInstance: { get, post, put },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../lib/handleError', () => ({
  handleError: vi.fn((_error, fallback) => fallback),
}));

const initialState = {
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUploading: false,
  isChangingPassword: false,
  changePasswordError: '',
  changePasswordSuccess: false,
  isResettingPassword: false,
  resetPasswordError: '',
  resetPasswordSuccess: false,
  isSendingResetEmail: false,
  resetEmailError: '',
  resetEmailSuccess: false,
  socket: null,
  onlineUsers: [],
};

const resetStore = async () => {
  const { useAuthStore } = await import('./useAuthStore');
  useAuthStore.setState(initialState);
  return useAuthStore;
};

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in, stores the auth user, and creates a socket', async () => {
    const useAuthStore = await resetStore();
    const user = { _id: 'user-1', fullName: 'Howard', email: 'h@example.com', profilePic: '', lastSeen: '' };
    post.mockResolvedValueOnce({ data: user });

    await useAuthStore.getState().login({ email: 'h@example.com', password: 'password' });

    expect(post).toHaveBeenCalledWith('/auth/login', { email: 'h@example.com', password: 'password' });
    expect(useAuthStore.getState().authUser).toEqual(user);
    expect(io).toHaveBeenCalledWith('/', { withCredentials: true, autoConnect: true });
    expect(socketOn).toHaveBeenCalledWith('getOnlineUsers', expect.any(Function));
  });

  it('does not create a socket when no auth user exists', async () => {
    const useAuthStore = await resetStore();

    useAuthStore.getState().connectSocket();

    expect(io).not.toHaveBeenCalled();
  });

  it('replaces a stale disconnected socket when connecting', async () => {
    const useAuthStore = await resetStore();
    const staleSocket = {
      connected: false,
      removeAllListeners: vi.fn(),
      disconnect: vi.fn(),
    };
    useAuthStore.setState({ authUser: { _id: 'user-1', fullName: 'Howard', email: 'h@example.com', profilePic: '', lastSeen: '' }, socket: staleSocket as never });

    useAuthStore.getState().connectSocket();

    expect(staleSocket.removeAllListeners).toHaveBeenCalledOnce();
    expect(staleSocket.disconnect).toHaveBeenCalledOnce();
    expect(io).toHaveBeenCalledOnce();
  });

  it('clears auth, online users, and socket on logout even when the API fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const useAuthStore = await resetStore();
    const socket = { off: vi.fn(), disconnect: vi.fn() };
    useAuthStore.setState({ authUser: { _id: 'user-1', fullName: 'Howard', email: 'h@example.com', profilePic: '', lastSeen: '' }, socket: socket as never, onlineUsers: ['user-1'] });
    post.mockRejectedValueOnce(new Error('network'));

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().authUser).toBeNull();
    expect(useAuthStore.getState().socket).toBeNull();
    expect(useAuthStore.getState().onlineUsers).toEqual([]);
    expect(socket.disconnect).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
