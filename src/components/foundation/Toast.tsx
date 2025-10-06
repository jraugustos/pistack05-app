import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning';
  title?: string;
  description?: string;
  onClose?: () => void;
}

export interface ToastCloseProps extends React.HTMLAttributes<HTMLButtonElement> {
  onClose?: () => void;
}

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ToastProviderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', title, description, onClose, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-bg-elev border-stroke text-text',
      success: 'bg-success/10 border-success/20 text-success',
      danger: 'bg-danger/10 border-danger/20 text-danger',
      warning: 'bg-warning/10 border-warning/20 text-warning',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-3 p-4 border rounded-lg shadow-lg',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-medium text-sm">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90 mt-1">{description}</div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, onClose, ...props }, ref) => (
    <button
      ref={ref}
      onClick={onClose}
      className={cn(
        'flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors',
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  )
);
ToastClose.displayName = 'ToastClose';

const ToastDescription = React.forwardRef<HTMLDivElement, ToastDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm opacity-90', className)}
      {...props}
    />
  )
);
ToastDescription.displayName = 'ToastDescription';

const ToastProvider = React.forwardRef<HTMLDivElement, ToastProviderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className)}
      {...props}
    />
  )
);
ToastProvider.displayName = 'ToastProvider';

const ToastTitle = React.forwardRef<HTMLDivElement, ToastTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('font-medium text-sm', className)}
      {...props}
    />
  )
);
ToastTitle.displayName = 'ToastTitle';

const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className)}
      {...props}
    />
  )
);
ToastViewport.displayName = 'ToastViewport';

export { 
  Toast, 
  ToastClose, 
  ToastDescription, 
  ToastProvider, 
  ToastTitle, 
  ToastViewport 
};
