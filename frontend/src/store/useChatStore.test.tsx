import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();

vi.mock('../lib/axios', () => ({
  axiosInstance: { get, post },
}));

vi.mock('../lib/handleError', () => ({
  handleError: vi.fn((_error, fallback) => fallback),
}));

const authState = {
  authUser: { _id: 'me', fullName: 'Me', email: 'me@example.com', profilePic: '', lastSeen: '' },
  socket: null as null | {
    emit?: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
  },
};

vi.mock('./useAuthStore', () => ({
  useAuthStore: {
    getState: () => authState,
  },
}));

const user = { _id: 'them', fullName: 'Them', email: 'them@example.com', profilePic: '', lastSeen: null };

const initialState = {
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: 'chats' as const,
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  lastSeenDate: null,
  isSoundEnabled: false,
  typingUsers: {},
};

const resetStore = async () => {
  const { useChatStore } = await import('./useChatStore');
  useChatStore.setState(initialState);
  authState.authUser = { _id: 'me', fullName: 'Me', email: 'me@example.com', profilePic: '', lastSeen: '' };
  authState.socket = null;
  return useChatStore;
};

describe('useChatStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists and toggles the sound preference', async () => {
    const useChatStore = await resetStore();

    useChatStore.getState().toggleSound();

    expect(useChatStore.getState().isSoundEnabled).toBe(true);
    expect(localStorage.getItem('isSoundEnabled')).toBe('true');
  });

  it('ignores stale message fetch responses when selected chat changed', async () => {
    const useChatStore = await resetStore();
    useChatStore.setState({ selectedUser: user });
    get.mockResolvedValueOnce({ data: [{ _id: 'stale-message' }] });

    const promise = useChatStore.getState().getMessages('old-user');
    useChatStore.setState({ selectedUser: { ...user, _id: 'new-user' } });
    await promise;

    expect(useChatStore.getState().messages).toEqual([]);
    expect(useChatStore.getState().isMessagesLoading).toBe(false);
  });

  it('replaces optimistic messages with the saved server message', async () => {
    const useChatStore = await resetStore();
    useChatStore.setState({ selectedUser: user });
    post.mockResolvedValueOnce({
      data: { _id: 'server-message', senderId: 'me', receiverId: 'them', text: 'hello', createdAt: '2026-01-01T00:00:00.000Z' },
    });

    await useChatStore.getState().sendMessage({ text: 'hello' });

    expect(post).toHaveBeenCalledWith('/messages/send/them', { text: 'hello' });
    expect(useChatStore.getState().messages).toEqual([
      expect.objectContaining({ _id: 'server-message', text: 'hello' }),
    ]);
    expect(useChatStore.getState().messages.some((message) => message.isOptimistic)).toBe(false);
  });

  it('removes optimistic messages when send fails', async () => {
    const useChatStore = await resetStore();
    useChatStore.setState({ selectedUser: user });
    post.mockRejectedValueOnce(new Error('network'));

    await useChatStore.getState().sendMessage({ text: 'hello' });

    expect(useChatStore.getState().messages).toEqual([]);
  });

  it('deduplicates subscribed socket messages and ignores other chats', async () => {
    const useChatStore = await resetStore();
    type SocketMessage = { _id: string; senderId: string; receiverId: string; text: string; createdAt: string };
    const handlers = new Map<string, (message: SocketMessage) => void>();
    authState.socket = {
      off: vi.fn(),
      on: vi.fn((event: string, handler: (message: SocketMessage) => void) => handlers.set(event, handler)),
    };
    useChatStore.setState({ selectedUser: user });

    useChatStore.getState().subscribeToMessages();
    const newMessage = { _id: 'message-1', senderId: 'them', receiverId: 'me', text: 'hi', createdAt: '2026-01-01T00:00:00.000Z' };
    handlers.get('newMessage')?.(newMessage);
    handlers.get('newMessage')?.(newMessage);
    handlers.get('newMessage')?.({ ...newMessage, _id: 'message-2', senderId: 'someone-else' });

    expect(authState.socket.off).toHaveBeenCalledWith('newMessage');
    expect(useChatStore.getState().messages).toEqual([newMessage]);
  });
});
