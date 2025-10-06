import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-6 py-16 px-6 text-center',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-bg-elev text-text-dim">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          {description && (
            <p className="text-sm text-text-dim max-w-md">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick} variant="primary">
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };

