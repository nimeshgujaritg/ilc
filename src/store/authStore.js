import { create } from 'zustand';
import client from '../api/client';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('ilc_user')) || null,
  token: localStorage.getItem('ilc_token') || null,
  isAuthenticated: !!localStorage.getItem('ilc_token'),
  isLoading: false,
  error: null,
  // Teaching: sessionExpired flag — set to true when 401 happens
  // Login page reads this and shows "Your session expired" message
  sessionExpired: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('ilc_token', token);
      localStorage.setItem('ilc_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false, error: null, sessionExpired: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: async (expired = false) => {
    try {
      await client.post('/auth/logout');
    } catch (_) {}
    localStorage.removeItem('ilc_token');
    localStorage.removeItem('ilc_user');
    set({
      user: null, token: null, isAuthenticated: false,
      error: null, sessionExpired: expired,
    });
    window.location.href = '/';
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.post('/auth/change-password', { currentPassword, newPassword });
      const { token } = res.data;
      const updatedUser = { ...JSON.parse(localStorage.getItem('ilc_user')), isFirstLogin: false };
      localStorage.setItem('ilc_token', token);
      localStorage.setItem('ilc_user', JSON.stringify(updatedUser));
      set({ token, user: updatedUser, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to change password';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  requestOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await client.post('/auth/request-otp', { email });
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to send OTP';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  verifyOtp: async (email, otp, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.post('/auth/verify-otp', { email, otp, newPassword });
      const { token, user } = res.data;
      localStorage.setItem('ilc_token', token);
      localStorage.setItem('ilc_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.error || 'Invalid or expired OTP';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  clearError: () => set({ error: null }),
  clearSessionExpired: () => set({ sessionExpired: false }),
}));