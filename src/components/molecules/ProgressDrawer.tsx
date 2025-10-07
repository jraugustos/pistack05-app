import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, Badge } from '@/components/foundation';
import { X, CheckCircle, Circle } from 'lucide-react';

export interface ProgressStage {
  key: string;
  label: string;
  progress: number; // 0-100
}

export interface ProgressDrawerProps {
  stages: ProgressStage[];
  onClose: () => void;
  className?: string;
}

const ProgressDrawer = React.forwardRef<HTMLDivElement, ProgressDrawerProps>(
  ({ stages, onClose, className }, ref) => {
    const totalProgress = stages.reduce((acc, s) => acc + s.progress, 0) / stages.length;

    return (
      <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
        <div 
          ref={ref}
          className={cn(
            'bg-bg border border-stroke rounded-lg shadow-xl w-full max-w-md',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stroke">
            <div>
              <h2 className="text-lg font-semibold text-text">Progresso do Projeto</h2>
              <p className="text-sm text-text-muted">{Math.round(totalProgress)}% concluído</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar Global */}
          <div className="p-4 border-b border-stroke">
            <div className="h-2 bg-bg-soft rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>

          {/* Stages List */}
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {stages.map((stage) => (
              <div key={stage.key} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {stage.progress >= 100 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : stage.progress > 0 ? (
                    <Circle className="w-5 h-5 text-primary fill-primary/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-text">{stage.label}</h4>
                    <Badge variant={stage.progress >= 100 ? 'success' : stage.progress > 0 ? 'primary' : 'secondary'}>
                      {Math.round(stage.progress)}%
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-bg-soft rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full transition-all duration-300',
                        stage.progress >= 100 ? 'bg-green-600' : 'bg-primary'
                      )}
                      style={{ width: `${stage.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stroke flex justify-between items-center">
            <p className="text-xs text-text-muted">
              {stages.filter(s => s.progress >= 100).length} de {stages.length} etapas concluídas
            </p>
            <Button variant="primary" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

ProgressDrawer.displayName = 'ProgressDrawer';

export { ProgressDrawer };
