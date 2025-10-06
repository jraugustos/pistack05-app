import * as React from 'react';
import { Clock, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardFooterProps {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  author?: string;
  aiGenerated?: boolean;
  className?: string;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ createdAt, updatedAt, author, aiGenerated = false, className }, ref) => {
    const formatDate = (date: string | Date) => {
      const d = new Date(date);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Agora mesmo';
      } else if (diffInHours < 24) {
        return `${diffInHours}h atrás`;
      } else if (diffInHours < 48) {
        return 'Ontem';
      } else {
        return d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between px-4 py-3 border-t border-stroke bg-bg-elev/50',
          'text-xs text-text-dim',
          className
        )}
      >
        <div className="flex items-center gap-4">
          {/* Timestamps */}
          {updatedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Atualizado {formatDate(updatedAt)}</span>
            </div>
          )}
          
          {createdAt && !updatedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Criado {formatDate(createdAt)}</span>
            </div>
          )}

          {/* Author */}
          {author && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{author}</span>
            </div>
          )}
        </div>

        {/* AI Generated Indicator */}
        {aiGenerated && (
          <div className="flex items-center gap-1 text-primary">
            <Sparkles className="h-3 w-3" />
            <span>Gerado por IA</span>
          </div>
        )}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { CardFooter };


