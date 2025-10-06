import * as React from 'react';
import { X, Sparkles, Expand, Eye, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/foundation';
import { IconButton } from '@/components/foundation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/foundation';
import { cn } from '@/lib/utils';

export type AIMode = 'Generate' | 'Expand' | 'Review';

export interface AIPanelProps {
  mode: AIMode;
  loading?: boolean;
  prompt?: string;
  diff?: {
    before?: any;
    after?: any;
  };
  onModeChange: (mode: AIMode) => void;
  onApply: () => void;
  onClose?: () => void;
  className?: string;
}

const AIPanel = React.forwardRef<HTMLDivElement, AIPanelProps>(
  ({ mode, loading = false, prompt, diff, onModeChange, onApply, onClose, className }, ref) => {
    const modes = [
      { key: 'Generate' as const, label: 'Gerar', icon: Sparkles },
      { key: 'Expand' as const, label: 'Expandir', icon: Expand },
      { key: 'Review' as const, label: 'Revisar', icon: Eye },
    ];

    const currentMode = modes.find(m => m.key === mode);

    return (
      <div
        ref={ref}
        className={cn(
          'w-96 bg-bg-elev border-l border-stroke h-full flex flex-col',
          'shadow-2',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stroke">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text">Assistente IA</h3>
              <p className="text-xs text-text-dim">Gerar e expandir conteúdo</p>
            </div>
          </div>
          
          {onClose && (
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </IconButton>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="p-4 border-b border-stroke">
          <Tabs value={mode} onValueChange={(value) => onModeChange(value as AIMode)}>
            <TabsList className="grid w-full grid-cols-3">
              {modes.map(({ key, label, icon: Icon }) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4">
          {/* Prompt Preview */}
          {prompt && (
            <div>
              <h4 className="text-sm font-medium text-text mb-2">Prompt</h4>
              <div className="bg-bg rounded-md p-3 border border-stroke">
                <pre className="text-xs text-text-dim whitespace-pre-wrap font-mono">
                  {prompt}
                </pre>
              </div>
            </div>
          )}

          {/* Diff Viewer */}
          {diff && (
            <div>
              <h4 className="text-sm font-medium text-text mb-2">Alterações</h4>
              <div className="space-y-2">
                {diff.before && (
                  <div>
                    <div className="text-xs text-danger mb-1">Removido:</div>
                    <div className="bg-danger/5 border border-danger/20 rounded-md p-2">
                      <pre className="text-xs text-danger whitespace-pre-wrap font-mono">
                        {JSON.stringify(diff.before, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {diff.after && (
                  <div>
                    <div className="text-xs text-success mb-1">Adicionado:</div>
                    <div className="bg-success/5 border border-success/20 rounded-md p-2">
                      <pre className="text-xs text-success whitespace-pre-wrap font-mono">
                        {JSON.stringify(diff.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-text-dim">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <span className="text-sm">Gerando conteúdo...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!prompt && !diff && !loading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-text mb-1">Pronto para gerar</h4>
              <p className="text-sm text-text-dim">
                Selecione um modo e clique em "Gerar" para começar
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stroke">
          <Button
            onClick={onApply}
            disabled={loading || (!prompt && !diff)}
            className="w-full"
            variant="primary"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                Gerando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aplicar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }
);

AIPanel.displayName = 'AIPanel';

export { AIPanel };


