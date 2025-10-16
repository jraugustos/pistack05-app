'use client';

import * as React from 'react';
import { useThemeStore } from '@/lib/stores/useThemeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider
 *
 * Provider que gerencia o tema da aplicação, aplicando o atributo data-theme
 * no elemento HTML e prevenindo FOUC (Flash of Unstyled Content).
 *
 * Features:
 * - Sincronização com localStorage via Zustand
 * - Detecção de preferência do sistema (prefers-color-scheme)
 * - Prevenção de flash de tema incorreto
 * - Script inline para aplicação imediata do tema
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const [mounted, setMounted] = React.useState(false);

  // Inicializar tema e adicionar listeners
  React.useEffect(() => {
    initializeTheme();
    setMounted(true);
  }, [initializeTheme]);

  // Evitar flash de conteúdo durante SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

/**
 * Script para prevenir FOUC
 *
 * Deve ser adicionado no <head> do documento antes de qualquer conteúdo.
 * Este script será executado antes da renderização, aplicando o tema
 * armazenado no localStorage imediatamente.
 *
 * Uso:
 * ```tsx
 * <head>
 *   <ThemeScript />
 * </head>
 * ```
 */
export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const stored = localStorage.getItem('pistack-theme');
        if (stored) {
          const { state } = JSON.parse(stored);
          const theme = state?.theme || 'dark';

          let resolvedTheme = theme;
          if (theme === 'system') {
            resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }

          document.documentElement.setAttribute('data-theme', resolvedTheme);
          if (resolvedTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else {
          // Tema padrão: dark
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        // Fallback para dark em caso de erro
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}

/**
 * Hook useTheme
 *
 * Hook para acessar e controlar o tema em qualquer componente.
 *
 * @returns {Object} Objeto com theme, resolvedTheme, setTheme e toggleTheme
 *
 * @example
 * ```tsx
 * const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
 *
 * return (
 *   <button onClick={toggleTheme}>
 *     Current: {resolvedTheme}
 *   </button>
 * );
 * ```
 */
export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
