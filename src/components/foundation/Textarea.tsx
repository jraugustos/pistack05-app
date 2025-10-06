import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            'w-full rounded-md border bg-bg-elev px-4 py-3',
            'text-text text-sm placeholder:text-text-dim',
            'transition-all duration-150 resize-vertical',
            'outline-none',
            error
              ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
              : 'border-stroke focus:border-primary focus:ring-1 focus:ring-primary',
            disabled && 'opacity-50 cursor-not-allowed bg-bg',
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        {helperText && (
          <p
            className={cn(
              'mt-1 text-xs',
              error ? 'text-danger' : 'text-text-dim'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

