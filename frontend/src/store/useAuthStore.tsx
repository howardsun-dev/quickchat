import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

interface signupData {
  fullName: string;
  email: string;
  password: string;
}
interface AuthState {
  authUser: unknown | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  socket: unknown | null;
  onlineUsers: string[];
}
interface AuthActions {
  checkAuth: () => Promise<void>;
  signup: (data: signupData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

type StoreState = AuthState & AuthActions;

interface LoginData {
  email: string;
  password: string;
}

export const useAuthStore = create<StoreState>((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data });
      // get().connectSocket();
    } catch (error) {
      console.log('Error in authCheck:', error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', data);

      set({ authUser: res.data });

      toast.success('Account created successfully');
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response
      ) {
        const axiosError = error as { response: { data: { message: string } } };
        toast.error(axiosError.response.data.message);
      } else {
        toast.error('Signup failed');
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: LoginData) => {
    set({ isLoggingIn: true });

    try {
      const res = await axiosInstance.post('/auth/login', data);
      set({ authUser: res.data });

      toast.success('Logged in successfully');
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response
      ) {
        const axiosError = error as { response: { data: { message: string } } };
        toast.error(axiosError.response.data.message);
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });

      toast.success('Logged off successfully');
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const msg = error.response?.data?.message ?? 'Logged out';
        toast.error(msg);
        return;
      }

      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  },
}));
