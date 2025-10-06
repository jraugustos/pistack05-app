import * as React from 'react';
import { cn } from '@/lib/utils';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variantClasses = {
      default:
        'bg-bg-elev border border-stroke text-text hover:border-[#2B3042] hover:bg-[#1A1F2D]',
      ghost: 'bg-transparent text-text hover:bg-bg-elev',
      danger: 'bg-transparent text-danger hover:bg-danger/10',
    };

    const sizeClasses = {
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-[var(--radius-md)] transition-all duration-150',
          'disabled:pointer-events-none disabled:opacity-50',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton };


