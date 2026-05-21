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
    connected: boolean;
    emit: ReturnType<typeof vi.fn>;
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
  typingUserId: null,
};

const resetStore = async () => {
  const { useChatStore } = await import('./useChatStore');
  useChatStore.setState(initialState);
  authState.authUser = { _id: 'me', fullName: 'Me', email: 'me@example.com', profilePic: '', lastSeen: '' };
  authState.socket = null;
  return useChatStore;
};

describe('useChatStore typing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('emits typing events for the selected chat and stops typing explicitly', async () => {
    const useChatStore = await resetStore();
    const emit = vi.fn();
    authState.socket = { connected: true, emit, off: vi.fn(), on: vi.fn() };
    useChatStore.setState({ selectedUser: user });

    useChatStore.getState().sendTyping();
    useChatStore.getState().stopTyping();

    expect(emit).toHaveBeenCalledWith('typing:start', { receiverId: 'them' });
    expect(emit).toHaveBeenCalledWith('typing:stop', { receiverId: 'them' });
  });

  it('tracks selected-user typing events and ignores typing from other users', async () => {
    const useChatStore = await resetStore();
    type TypingPayload = { senderId: string };
    const handlers = new Map<string, (payload: TypingPayload) => void>();
    authState.socket = {
      connected: true,
      emit: vi.fn(),
      off: vi.fn(),
      on: vi.fn((event: string, handler: (payload: TypingPayload) => void) => handlers.set(event, handler)),
    };
    useChatStore.setState({ selectedUser: user });

    useChatStore.getState().subscribeToTyping();
    handlers.get('typing:start')?.({ senderId: 'other-user' });
    expect(useChatStore.getState().typingUserId).toBeNull();

    handlers.get('typing:start')?.({ senderId: 'them' });
    expect(useChatStore.getState().typingUserId).toBe('them');

    handlers.get('typing:stop')?.({ senderId: 'them' });
    expect(useChatStore.getState().typingUserId).toBeNull();
    expect(authState.socket.off).toHaveBeenCalledWith('typing:start');
    expect(authState.socket.off).toHaveBeenCalledWith('typing:stop');
  });
});
