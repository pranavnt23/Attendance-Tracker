import { create } from 'zustand';

export const useThemeStore = create((set, get) => ({
  theme: 'light',

  initTheme: () => {
    const savedTheme = localStorage.getItem('attendance_theme');
    let activeTheme = 'light';

    if (savedTheme) {
      activeTheme = savedTheme;
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      activeTheme = prefersDark ? 'dark' : 'light';
    }

    set({ theme: activeTheme });
    get().applyTheme(activeTheme);
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('attendance_theme', nextTheme);
    set({ theme: nextTheme });
    get().applyTheme(nextTheme);
  },

  applyTheme: (theme) => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }
}));
