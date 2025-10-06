import * as React from 'react';
import { ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/foundation';
import { cn } from '@/lib/utils';

export interface Stage {
  key: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
  progress: number; // 0-100
  description?: string;
}

export interface ProgressDrawerProps {
  stages: Stage[];
  currentStage: string;
  onStageClick?: (stageKey: string) => void;
  className?: string;
}

const ProgressDrawer = React.forwardRef<HTMLDivElement, ProgressDrawerProps>(
  ({ stages, currentStage, onStageClick, className }, ref) => {
    const getStageIcon = (status: Stage['status']) => {
      switch (status) {
        case 'completed':
          return <CheckCircle2 className="h-5 w-5 text-success" />;
        case 'current':
          return <Clock className="h-5 w-5 text-primary" />;
        case 'pending':
          return <Circle className="h-5 w-5 text-text-dim" />;
        default:
          return <Circle className="h-5 w-5 text-text-dim" />;
      }
    };

    const getStageColor = (status: Stage['status']) => {
      switch (status) {
        case 'completed':
          return 'text-success';
        case 'current':
          return 'text-primary';
        case 'pending':
          return 'text-text-dim';
        default:
          return 'text-text-dim';
      }
    };

    const getStageAccent = (stageKey: string) => {
      const accents = {
        'ideia-base': 'border-l-primary',
        'entendimento': 'border-l-info',
        'escopo': 'border-l-success',
        'design': 'border-l-warning',
        'tecnologia': 'border-l-cyan',
        'planejamento': 'border-l-rose',
      };
      return accents[stageKey as keyof typeof accents] || 'border-l-stroke';
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-80 bg-bg-elev border-r border-stroke h-full flex flex-col',
          'shadow-1',
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-stroke">
          <h3 className="font-semibold text-text mb-1">Progresso do Projeto</h3>
          <p className="text-sm text-text-dim">
            {stages.filter(s => s.status === 'completed').length} de {stages.length} etapas concluídas
          </p>
        </div>

        {/* Stages List */}
        <div className="flex-1 overflow-y-auto">
          {stages.map((stage, index) => (
            <div key={stage.key} className="relative">
              {/* Stage Item */}
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start p-4 h-auto rounded-none border-l-2',
                  getStageAccent(stage.key),
                  stage.status === 'current' && 'bg-primary/5',
                  'hover:bg-bg-elev/50'
                )}
                onClick={() => onStageClick?.(stage.key)}
              >
                <div className="flex items-start gap-3 w-full">
                  {/* Icon */}
                  <div className={cn('flex-shrink-0 mt-0.5', getStageColor(stage.status))}>
                    {getStageIcon(stage.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn(
                        'font-medium text-sm',
                        getStageColor(stage.status)
                      )}>
                        {stage.title}
                      </h4>
                      {stage.status === 'current' && (
                        <ChevronRight className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    
                    {stage.description && (
                      <p className="text-xs text-text-dim mb-2">
                        {stage.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    {stage.status === 'current' && stage.progress > 0 && (
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-text-dim mb-1">
                          <span>Progresso</span>
                          <span>{stage.progress}%</span>
                        </div>
                        <div className="w-full bg-stroke rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${stage.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Button>

              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-4 bg-stroke" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stroke">
          <div className="text-xs text-text-dim text-center">
            Clique em uma etapa para navegar
          </div>
        </div>
      </div>
    );
  }
);

ProgressDrawer.displayName = 'ProgressDrawer';

export { ProgressDrawer };


