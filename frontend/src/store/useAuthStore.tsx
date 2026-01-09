import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

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
  //   checkAuth: () => Promise<void>;
  signup: (data: signupData) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
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
    } catch (error) {
      console.log('Error in authCheck', error);
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
}));
