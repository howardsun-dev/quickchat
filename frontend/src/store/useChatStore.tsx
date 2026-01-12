import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { handleError } from '../lib/handleError';
import { useAuthStore } from './useAuthStore';

export interface BaseUser {
  _id: string;
  fullName: string;
  email: string;
  profilePic: string;
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
interface ChatState {
  allContacts: ChatPartner[];
  chats: ChatPartner[];
  messages: Message[];
  activeTab: 'chats' | 'contacts';
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;
}

interface ChatActions {
  toggleSound: () => void;
  setActiveTab: (tab: 'chats' | 'contacts') => void;
  setSelectedUser: (user: User | null) => void;
  getAllContacts: () => Promise<void>;
  getMyChatPartners: () => Promise<void>;
  getMessagesByUserId: (userId: string) => Promise<void>;
  sendMessage: (messageData: SentMessagePayload) => Promise<void>;
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
  isSoundEnabled: (() => {
    const stored = localStorage.getItem('isSoundEnabled');
    return stored !== null ? JSON.parse(stored) : false;
  })(),

  toggleSound: () => {
    localStorage.setItem('isSoundEnabled', String(!get().isSoundEnabled));
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

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

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
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
    set({ messages: [...messages, optimisticMessage] }); // Optimistic UI update

    if (!selectedUser?._id) {
      handleError(null, 'No chat selected');
      return;
    }
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: messages.concat(res.data) });
    } catch (error: unknown) {
      // Remove optimistic message on failure
      set({ messages: messages });
      handleError(error, 'Failed to send messages');
    }
  },
}));
