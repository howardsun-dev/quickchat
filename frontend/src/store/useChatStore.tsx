import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic: string;
}

interface ChatState {
  allContacts: [];
  chats: [];
  messages: [];
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
      const res = await axiosInstance.get('messages/contacts');
      set({ allContacts: res.data });
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? 'Error occurred');
        return;
      }
      toast.error('Unexpected Error');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('messages/chats');
      set({ chats: res.data });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? 'Error occurred');
        return;
      }
      toast.error('Unexpected Error');
    } finally {
      set({ isUsersLoading: false });
    }
  },
}));
