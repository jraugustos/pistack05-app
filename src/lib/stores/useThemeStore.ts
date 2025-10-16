'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

// Helper para detectar preferência do sistema
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Helper para resolver tema baseado na preferência
const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

// Helper para aplicar tema no DOM
const applyTheme = (resolvedTheme: ResolvedTheme) => {
  if (typeof window === 'undefined') return;

  const root = window.document.documentElement;
  root.setAttribute('data-theme', resolvedTheme);

  // Adicionar/remover classe dark (opcional, para compatibilidade)
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark', // Tema padrão
      resolvedTheme: 'dark',

      setTheme: (theme: Theme) => {
        const resolved = resolveTheme(theme);
        applyTheme(resolved);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const { resolvedTheme } = get();
        const newTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
        const resolved = resolveTheme(newTheme);
        applyTheme(resolved);
        set({ theme: newTheme, resolvedTheme: resolved });
      },

      initializeTheme: () => {
        const { theme } = get();
        const resolved = resolveTheme(theme);
        applyTheme(resolved);
        set({ resolvedTheme: resolved });

        // Listener para mudanças na preferência do sistema
        if (typeof window !== 'undefined' && theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = () => {
            const { theme: currentTheme } = get();
            if (currentTheme === 'system') {
              const newResolved = getSystemTheme();
              applyTheme(newResolved);
              set({ resolvedTheme: newResolved });
            }
          };

          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
      },
    }),
    {
      name: 'pistack-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
