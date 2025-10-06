import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      className,
      size = 'md',
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
      if (isOpen) {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
        const timer = setTimeout(() => setIsVisible(false), 200);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    React.useEffect(() => {
      if (!closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    };

    if (!isVisible) return null;

    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-7xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          isOpen ? 'animate-in fade-in-0' : 'animate-out fade-out-0',
          className
        )}
        {...props}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleOverlayClick}
        />

        {/* Modal Content */}
        <div
          className={cn(
            'relative w-full bg-bg-elev border border-stroke rounded-lg shadow-lg',
            'animate-in zoom-in-95 slide-in-from-bottom-2 duration-200',
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-stroke">
              <h2 className="text-xl font-semibold text-text">{title}</h2>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export { Modal };
