import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeStore {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isDark: false,

      setTheme: (theme: Theme) => {
        set({ theme });
        get().initializeTheme();
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      initializeTheme: () => {
        const { theme } = get();
        let isDark = false;

        if (theme === 'auto') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
          isDark = theme === 'dark';
        }

        set({ isDark });

        // Apply theme to document
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'theme-storage',
      onRehydrate: (state) => {
        // Initialize theme after rehydration
        if (state) {
          state.initializeTheme();
        }
      },
    }
  )
);

// Listen for system theme changes when auto mode is enabled
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const store = useThemeStore.getState();
    if (store.theme === 'auto') {
      store.initializeTheme();
    }
  });
}