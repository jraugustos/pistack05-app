'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers';
import { Tooltip } from './Tooltip';

export interface ThemeToggleProps {
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * ThemeToggle
 *
 * Componente para alternar entre temas light e dark.
 *
 * Features:
 * - Alterna entre light/dark com animação suave
 * - Ícones animados (Sun/Moon)
 * - Tooltip informativo
 * - Variantes: icon (apenas ícone) ou button (com label)
 * - Tamanhos responsivos
 *
 * @example
 * ```tsx
 * <ThemeToggle variant="icon" size="md" />
 * <ThemeToggle variant="button" size="lg" showLabel />
 * ```
 */
export function ThemeToggle({
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonContent = (
    <>
      {/* Ícone animado */}
      <div className="relative">
        {/* Sun (light mode) */}
        <Sun
          className={cn(
            iconSizes[size],
            'absolute transition-all duration-300',
            isDark
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          )}
        />
        {/* Moon (dark mode) */}
        <Moon
          className={cn(
            iconSizes[size],
            'transition-all duration-300',
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>

      {/* Label (opcional) */}
      {showLabel && variant === 'button' && (
        <span className="ml-2 font-medium">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </>
  );

  if (variant === 'icon') {
    return (
      <Tooltip content={isDark ? 'Tema Light' : 'Tema Dark'}>
        <button
          onClick={toggleTheme}
          className={cn(
            'inline-flex items-center justify-center rounded-lg',
            'bg-transparent text-text hover:bg-bg-elev',
            'border border-stroke hover:border-primary/30',
            'transition-all duration-200',
            'focus-visible:outline focus-visible:outline-2',
            'focus-visible:outline-offset-2 focus-visible:outline-primary',
            sizeClasses[size],
            className
          )}
          aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
        >
          {buttonContent}
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4',
        'bg-bg-elev text-text hover:bg-bg',
        'border border-stroke hover:border-primary/30',
        'transition-all duration-200',
        'focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-offset-2 focus-visible:outline-primary',
        sizeClasses[size],
        'w-auto',
        className
      )}
      aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
    >
      {buttonContent}
    </button>
  );
}

ThemeToggle.displayName = 'ThemeToggle';
