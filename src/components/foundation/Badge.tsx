import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { CardStatus } from '@/types';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        draft: 'border border-stroke text-text-dim bg-transparent',
        ready: 'border border-success text-success bg-transparent',
        primary: 'border border-primary text-primary bg-transparent',
        success: 'border border-success text-success bg-transparent',
        warning: 'border border-warning text-warning bg-transparent',
        danger: 'border border-danger text-danger bg-transparent',
        info: 'border border-info text-info bg-transparent',
        default: 'border border-stroke text-text-dim bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: CardStatus;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, status, children, ...props }, ref) => {
    // Map CardStatus to badge variant
    const statusVariant = status
      ? status === 'DRAFT'
        ? 'draft'
        : 'ready'
      : variant;

    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant: statusVariant }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };

