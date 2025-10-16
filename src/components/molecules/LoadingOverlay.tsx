import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingOverlayProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isOpen,
  title = 'Criando card',
  description = 'Aguarde um instante...',
  className,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-black/60 backdrop-blur-sm',
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative flex flex-col items-center gap-6 px-8 py-10 bg-bg-elev rounded-2xl border border-stroke/50 shadow-2xl"
          >
            {/* Animated Icon */}
            <div className="relative">
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-20 h-20 rounded-full border-2 border-primary/20 border-t-primary"
              />

              {/* Inner pulsing glow */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-2 bg-primary/20 rounded-full blur-xl"
              />

              {/* Center icon */}
              <div className="relative w-20 h-20 flex items-center justify-center bg-primary/10 rounded-full">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-lg font-semibold text-text">{title}</h3>
              <p className="text-sm text-text-dim">{description}</p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 bg-primary rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-primary rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-primary rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
