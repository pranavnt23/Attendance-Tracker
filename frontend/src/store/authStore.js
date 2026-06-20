import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('attendance_token') || null,
  me: null,
  isAuthenticated: !!localStorage.getItem('attendance_token'),
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  login: (token, me) => {
    localStorage.setItem('attendance_token', token);
    set({
      token,
      me,
      isAuthenticated: true,
      error: null,
    });
  },

  setMe: (me) => {
    set({ me, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('attendance_token');
    set({
      token: null,
      me: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
