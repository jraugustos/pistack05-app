import * as React from 'react';
import { MoreHorizontal, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/foundation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/foundation';
import { IconButton } from '@/components/foundation';
import { cn } from '@/lib/utils';

export interface CardHeaderProps {
  icon: React.ReactNode;
  title: string;
  status: 'DRAFT' | 'READY';
  stageKey: string;
  onMenuAction?: (action: 'duplicate' | 'delete' | 'link') => void;
  onTitleChange?: (title: string) => void;
  className?: string;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ icon, title, status, stageKey, onMenuAction, onTitleChange, className }, ref) => {
    const getStageColor = (stageKey: string) => {
      const colors = {
        'ideia-base': 'text-primary',
        'entendimento': 'text-info',
        'escopo': 'text-success',
        'design': 'text-warning',
        'tecnologia': 'text-cyan',
        'planejamento': 'text-rose',
      };
      return colors[stageKey as keyof typeof colors] || 'text-text';
    };

    const getStageGradient = (stageKey: string) => {
      const gradients = {
        'ideia-base': 'bg-gradient-to-r from-primary/20 to-primary/5',
        'entendimento': 'bg-gradient-to-r from-info/20 to-info/5',
        'escopo': 'bg-gradient-to-r from-success/20 to-success/5',
        'design': 'bg-gradient-to-r from-warning/20 to-warning/5',
        'tecnologia': 'bg-gradient-to-r from-cyan/20 to-cyan/5',
        'planejamento': 'bg-gradient-to-r from-rose/20 to-rose/5',
      };
      return gradients[stageKey as keyof typeof gradients] || 'bg-gradient-to-r from-stroke/20 to-stroke/5';
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between p-4 border-b border-stroke',
          getStageGradient(stageKey),
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Stage Icon */}
          <div className={cn('flex-shrink-0', getStageColor(stageKey))}>
            {icon}
          </div>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-text truncate">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={status === 'READY' ? 'READY' : 'DRAFT'}>
                {status === 'READY' ? 'Pronto' : 'Rascunho'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex items-center gap-2">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {status === 'READY' ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-text-dim" />
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onMenuAction?.('duplicate')}>
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMenuAction?.('link')}>
                Vincular
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onMenuAction?.('delete')}
                className="text-danger"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export { CardHeader };
