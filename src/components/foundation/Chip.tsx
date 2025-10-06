import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MoSCoWPriority } from '@/types';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
  variant?: 'default' | MoSCoWPriority;
  selected?: boolean;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      className,
      children,
      onRemove,
      variant = 'default',
      selected = false,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'border-stroke text-text-dim',
      must: 'border-primary text-primary bg-primary/10',
      should: 'border-info text-info bg-info/10',
      could: 'border-text-dim text-text-dim bg-transparent',
      wont: 'border-danger text-danger bg-danger/5',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-sm border px-3 py-1',
          'text-xs font-medium transition-all duration-150',
          'hover:bg-opacity-20 cursor-default',
          selected && 'ring-1 ring-current',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 hover:opacity-70 focus:outline-none"
            aria-label="Remover"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);
Chip.displayName = 'Chip';

export { Chip };

