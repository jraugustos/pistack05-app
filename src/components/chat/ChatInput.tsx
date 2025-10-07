import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/foundation';
import { Send } from 'lucide-react';

export interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  multiline?: boolean;
  className?: string;
}

const ChatInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, ChatInputProps>(
  ({ onSend, placeholder = 'Digite sua mensagem...', disabled = false, maxLength = 500, multiline = false, className }, ref) => {
    const [value, setValue] = React.useState('');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
      const trimmed = value.trim();
      if (trimmed && !disabled) {
        onSend(trimmed);
        setValue('');
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !multiline) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Enter' && !e.shiftKey && multiline && !disabled) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (!maxLength || newValue.length <= maxLength) {
        setValue(newValue);
        
        // Auto-resize textarea
        if (multiline && textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }
    };

    return (
      <div className={cn('chat-input w-full mt-4 md:mt-6 mb-4 md:mb-6', className)}>
        <div className="flex items-end gap-2 p-3 md:p-4 bg-bg-elev border border-stroke rounded-xl border-t-0">
          {multiline ? (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                'flex-1 bg-transparent text-text text-sm placeholder:text-text-dim',
                'outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent',
                'resize-none max-h-32',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              style={{ minHeight: '24px' }}
            />
          ) : (
            <input
              ref={ref as React.RefObject<HTMLInputElement>}
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'flex-1 bg-transparent text-text text-sm placeholder:text-text-dim',
                'outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          )}
          
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {maxLength && (
          <p className="text-xs text-text-dim mt-2 text-right">
            {value.length}/{maxLength} caracteres
          </p>
        )}
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export { ChatInput };

