import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  authUser: { name: 'John', _id: 123, age: 25 },
  isLoading: false,

  login: () => {
    console.log('we just logged in');
  },
}));
