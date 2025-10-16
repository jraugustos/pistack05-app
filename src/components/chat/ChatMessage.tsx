import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { TypewriterText } from './TypewriterText';

export interface ChatMessageProps {
  message: string;
  sender: 'bot' | 'user';
  timestamp?: Date;
  useTypewriter?: boolean;
  onTypewriterComplete?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message, sender, timestamp, useTypewriter = false, onTypewriterComplete, className, children }, ref) => {
    const isBot = sender === 'bot';
    const [showContent, setShowContent] = React.useState(!useTypewriter);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn('flex w-full gap-3 mb-6', className)}
      >
        <div className="flex-1 flex flex-col gap-3">
          {/* Message Bubble */}
          <div className={cn(
            'flex gap-3',
            isBot ? 'justify-start' : 'justify-end'
          )}>
            {/* Avatar Bot */}
            {isBot && (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            )}

            {/* Message Content */}
            <div
              className={cn(
                'max-w-[80%] md:max-w-[70%] rounded-xl px-4 py-3 shadow-lg',
                isBot
                  ? 'bg-bg-elev border border-stroke text-text rounded-tl-none'
                  : 'button-primary text-[var(--button-text-primary)] rounded-tr-none'
              )}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {useTypewriter && isBot ? (
                  <TypewriterText 
                    text={message} 
                    speed={30}
                    onComplete={() => {
                      setShowContent(true);
                      onTypewriterComplete?.();
                    }}
                  />
                ) : (
                  message
                )}
              </div>
              {timestamp && (
                <p className={cn(
                  'text-xs mt-1 opacity-70',
                  isBot ? 'text-text-dim' : ''
                )}>
                  {timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>

            {/* Spacer reduzido ao mínimo solicitado */}
            {!isBot && <div className="flex-shrink-0 w-2" />}
          </div>

          {/* Additional Content (options, cards, etc) */}
          {showContent && children && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full"
            >
              {children}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }
);

ChatMessage.displayName = 'ChatMessage';

export { ChatMessage };

