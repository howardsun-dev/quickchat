import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { handleError } from '../lib/handleError';
import { useAuthStore } from './useAuthStore';
import { formatDistanceToNow } from 'date-fns';

export interface BaseUser {
  _id: string;
  fullName: string;
  email: string;
  profilePic: string;
  lastSeen: Date | null;
}

export type User = BaseUser;
export type ChatPartner = BaseUser;
export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  isOptimistic?: boolean;
}

interface SentMessagePayload {
  text?: string;
  image?: string | File | null;
}

interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  page: number;
  total: number;
}

interface ChatState {
  allContacts: ChatPartner[];
  chats: ChatPartner[];
  messages: Message[];
  activeTab: 'chats' | 'contacts';
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSendingMessage: boolean;
  hasMoreMessages: boolean;
  currentPage: number;
  lastSeenDate: null | string;
  isSoundEnabled: boolean;
  typingUsers: Record<string, boolean>;
}

interface ChatActions {
  toggleSound: () => void;
  setActiveTab: (tab: 'chats' | 'contacts') => void;
  setSelectedUser: (user: User | null) => Promise<void>;
  getAllContacts: () => Promise<void>;
  getMyChatPartners: () => Promise<void>;
  getMessages: (userId: string, options?: { page?: number }) => Promise<void>;
  sendMessage: (messageData: SentMessagePayload) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  sendTyping: () => void;
  stopTyping: () => void;
  subscribeToTyping: () => void;
  unsubscribeFromTyping: () => void;
  getUserStatus: () => string | null;
  setIsTyping: (receiverId: string, isTyping: boolean) => void;
}

type ChatStoreState = ChatState & ChatActions;

export const useChatStore = create<ChatStoreState>((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: 'chats',
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  hasMoreMessages: false,
  currentPage: 1,
  lastSeenDate: null,
  isSoundEnabled: (() => {
    const stored = localStorage.getItem('isSoundEnabled');
    return stored !== null ? JSON.parse(stored) : false;
  })(),
  typingUsers: {},

  toggleSound: () => {
    const next = !get().isSoundEnabled;
    localStorage.setItem('isSoundEnabled', String(next));
    set({ isSoundEnabled: next });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: async (user: User | null) => {
    set({ selectedUser: user, lastSeenDate: null, messages: [], currentPage: 1, hasMoreMessages: false });

    if (user?._id) {
      const targetUserId = user._id;
      try {
        const res = await axiosInstance.get(`/user/status/${user._id}`);
        if (get().selectedUser?._id !== targetUserId) return;

        const { lastSeen } = res.data;
        const statusText = lastSeen
          ? `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
          : null;

        set({ lastSeenDate: statusText });
      } catch (error) {
        handleError(error, 'Unable to get status');
        set({ lastSeenDate: null });
      }
    }
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/contacts');
      set({ allContacts: res.data });
    } catch (error: unknown) {
      handleError(error, 'Failed to fetch contacts');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/chats');
      set({ chats: res.data });
    } catch (error: unknown) {
      handleError(error, 'Failed to fetch chat partners');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId, options = {}) => {
    const page = options.page ?? 1;
    const isInitial = page === 1;

    set(isInitial
      ? { isMessagesLoading: true, messages: [], currentPage: 1 }
      : { isMessagesLoading: true }
    );

    try {
      const res = await axiosInstance.get<GetMessagesResponse>(`/messages/${userId}`, {
        params: { page },
      });

      set({
        messages: isInitial
          ? res.data.messages
          : [...get().messages, ...res.data.messages],
        hasMoreMessages: res.data.hasMore,
        currentPage: page,
      });
    } catch (error) {
      handleError(error, 'Failed to fetch messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: SentMessagePayload) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedUser || !authUser) {
      handleError(null, 'No chat or user selected');
      return;
    }

    set({ isSendingMessage: true });

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text ?? '',
      image: (messageData.image ?? undefined) as string | undefined,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    set({ messages: [...messages, optimisticMessage] });

    if (!selectedUser?._id) {
      set({ messages: get().messages.filter((m) => m._id !== tempId) });
      handleError(null, 'No chat selected');
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      // Remove optimistic message and add real one
      set({
        messages: [
          ...get().messages.filter((m) => m._id !== tempId),
          res.data,
        ],
      });
    } catch (error: unknown) {
      // Remove optimistic message on failure
      set({ messages: get().messages.filter((m) => m._id !== tempId) });
      handleError(error, 'Failed to send message');
    } finally {
      set({ isSendingMessage: false });
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off('newMessage');
    socket.on('newMessage', (newMessage: Message) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === get().selectedUser?._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      // Don't add if we already have this message (avoid dupes from optimistic)
      if (currentMessages.some((m) => m._id === newMessage._id)) return;

      set({ messages: [...currentMessages, newMessage] });

      if (get().isSoundEnabled) {
        const notificationSound = new Audio('/sounds/notification.mp3');
        notificationSound.currentTime = 0;
        notificationSound
          .play()
          .catch((e) => console.log('Notification sound play error:', e));
      }
    });

    socket.on('userTyping', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [userId]: isTyping },
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off('newMessage');
    socket.off('userTyping');
  },

  sendTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser?._id || !socket?.connected) return;

    socket.emit('typing:start', { receiverId: selectedUser._id });
  },

  stopTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser?._id || !socket?.connected) return;

    socket.emit('typing:stop', { receiverId: selectedUser._id });
  },

  subscribeToTyping: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off('typing:start');
    socket?.off('typing:stop');
    socket?.on('typing:start', ({ senderId }: { senderId: string }) => {
      if (senderId !== get().selectedUser?._id) return;
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: true },
      }));
    });
    socket?.on('typing:stop', ({ senderId }: { senderId: string }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: false },
      }));
    });
  },

  unsubscribeFromTyping: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off('typing:start');
    socket?.off('typing:stop');
  },

  getUserStatus: () => {
    return get().lastSeenDate;
  },

  setIsTyping: (receiverId: string, isTyping: boolean) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.emit('typing', { receiverId, isTyping });
  },
}));
