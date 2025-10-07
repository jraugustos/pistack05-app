import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      prefix,
      suffix,
      error,
      helperText,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        <div
          className={cn(
            'flex items-center gap-2 rounded-md border bg-bg-elev px-4 py-3',
            'transition-all duration-150',
            error
              ? 'border-danger focus-within:border-danger focus-within:ring-1 focus-within:ring-danger'
              : 'border-stroke focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
            disabled && 'opacity-50 cursor-not-allowed bg-bg',
            className
          )}
        >
          {prefix && (
            <div className="flex-shrink-0 text-text-dim">{prefix}</div>
          )}
          <input
            type={type}
            className={cn(
              'flex-1 bg-transparent text-text text-sm placeholder:text-text-dim',
              'outline-none disabled:cursor-not-allowed'
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          {suffix && (
            <div className="flex-shrink-0 text-text-dim">{suffix}</div>
          )}
        </div>
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
Input.displayName = 'Input';

export { Input };

