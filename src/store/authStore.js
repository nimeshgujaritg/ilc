import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // Accept the full user object (name, role, title, initials)
  login: (userData) => set({
    user: userData,
    isAuthenticated: true,
  }),

  logout: () => set({
    user: null,
    isAuthenticated: false,
  }),
}));