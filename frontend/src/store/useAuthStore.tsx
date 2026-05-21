import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { handleError } from '../lib/handleError';
import { io } from 'socket.io-client';
import { Socket as SocketIOClientSocket } from 'socket.io-client';

const BASE_URL =
  import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '/';

interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic: string;
  lastSeen: string;
}
interface AuthState {
  authUser: User | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUploading: boolean;
  isChangingPassword: boolean;
  changePasswordError: string | null;
  changePasswordSuccess: boolean;
  isResettingPassword: boolean;
  resetPasswordError: string;
  resetPasswordSuccess: boolean;
  isSendingResetEmail: boolean;
  resetEmailError: string | null;
  resetEmailSuccess: boolean;
  socket: SocketIOClientSocket | null;
  onlineUsers: string[];
}
interface AuthActions {
  checkAuth: () => Promise<void>;
  signup: (data: signupData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { profilePic: string }) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  resetPassword: (data: resetPasswordData) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  forgotPassword: (email: forgotPasswordData) => Promise<void>;
}

type StoreState = AuthState & AuthActions;
interface signupData {
  fullName: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface forgotPasswordData {
  email: string;
}
interface resetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const useAuthStore = create<StoreState>((set, get) => ({
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

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error: unknown) {
      console.error('Auth check failed:', error);
      handleError(error, 'Authentication check failed');
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: signupData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', data);

      set({ authUser: res.data });

      toast.success('Account created successfully');
      get().connectSocket();
    } catch (error: unknown) {
      handleError(error, 'Signup failed');
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
      get().connectSocket();
    } catch (error: unknown) {
      handleError(error, 'Login failed');
    } finally {
      set({ isLoggingIn: false, changePasswordSuccess: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged off successfully');
      get().disconnectSocket();
    } catch (error: unknown) {
      handleError(error, 'Logout failed');

      console.error('Logout error:', error);
      toast.error('Logout failed');
      set({ authUser: null });
    }
  },

  updateProfile: async (data) => {
    set({ isUploading: true });

    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      set({ authUser: res.data });
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      handleError(error, 'Profile update failed');
    } finally {
      set({ isUploading: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true, // Ensures cookies are sent with the connection
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    set({ socket });

    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;

    if (socket?.connected) {
      socket.off('getOnlineUsers');
      socket.off('connect');
      socket.disconnect();
    }
  },

  changePassword: async (data: ChangePasswordData) => {
    set({
      isChangingPassword: true,
      changePasswordError: '',
      changePasswordSuccess: false,
    });
    console.log(data);

    try {
      await axiosInstance.post('/auth/change-password', data);
      set({ changePasswordSuccess: true, changePasswordError: '' });
      toast.success('Password changed successfully');
    } catch (error: unknown) {
      const errMessage = handleError(error, 'Password change failed');
      set({
        changePasswordError: errMessage,
        changePasswordSuccess: false,
      });
    } finally {
      set({ isChangingPassword: false });
    }
  },

  resetPassword: async ({
    token,
    newPassword,
    confirmPassword,
  }: resetPasswordData) => {
    set({
      isResettingPassword: true,
      resetPasswordError: '',
      resetPasswordSuccess: false,
    });

    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, {
        newPassword,
        confirmPassword,
      });
      set({ resetPasswordSuccess: true });
      toast.success('Password reset successfully');
    } catch (error: unknown) {
      const errMessage = handleError(error, 'Password reset failed');
      set({ resetPasswordError: errMessage, resetPasswordSuccess: false });
    } finally {
      set({ isResettingPassword: false });
    }
  },

  forgotPassword: async (data: forgotPasswordData) => {
    set({
      isSendingResetEmail: true,
      resetEmailError: '',
      resetEmailSuccess: false,
    });

    try {
      await axiosInstance.post('/auth/forgot-password', data);
      set({ resetEmailSuccess: true });
      toast.success('Reset link sent to your email!');
    } catch (error: unknown) {
      const errMessage = handleError(error, 'Failed to send reset email');
      set({ resetEmailError: errMessage, resetEmailSuccess: false });
    } finally {
      set({ isSendingResetEmail: false });
    }
  },
}));
