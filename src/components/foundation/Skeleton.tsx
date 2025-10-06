import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'circular';
  className?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses = 'animate-pulse bg-bg-elev rounded';
    
    const variantClasses = {
      default: 'h-4 w-full',
      card: 'h-48 w-full',
      text: 'h-4 w-3/4',
      circular: 'h-10 w-10 rounded-full',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
