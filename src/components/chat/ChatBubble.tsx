import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export interface ChatBubbleProps {
  message: string;
  sender: 'bot' | 'user';
  timestamp?: Date;
  className?: string;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ message, sender, timestamp, className }, ref) => {
    const isBot = sender === 'bot';

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          'flex w-full gap-3 mb-4',
          isBot ? 'justify-start' : 'justify-end',
          className
        )}
      >
        {/* Avatar Bot */}
        {isBot && (
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'max-w-[80%] md:max-w-[70%] rounded-xl px-4 py-3 shadow-lg',
            isBot
              ? 'bg-bg-elev border border-stroke text-text rounded-tl-none'
              : 'bg-gradient-to-br from-primary to-[#5A7CFF] text-white rounded-tr-none'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
          {timestamp && (
            <p className={cn(
              'text-xs mt-1',
              isBot ? 'text-text-dim' : 'text-white/70'
            )}>
              {timestamp.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          )}
        </div>

        {/* Avatar User - placeholder para alinhamento */}
        {!isBot && <div className="flex-shrink-0 w-8" />}
      </motion.div>
    );
  }
);

ChatBubble.displayName = 'ChatBubble';

export { ChatBubble };

