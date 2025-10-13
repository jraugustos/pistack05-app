import * as React from 'react';
import { X, Sparkles, Expand, Eye, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/foundation';
import { IconButton } from '@/components/foundation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/foundation';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/components/chat/ChatMessage';

export type AIMode = 'Generate' | 'Expand' | 'Review';

export interface AIPanelProps {
  mode: AIMode;
  loading?: boolean;
  prompt?: string;
  diff?: {
    before?: any;
    after?: any;
  };
  // Headless ChatKit (mínimo):
  agentEnabled?: boolean;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  onSendMessage?: (text: string) => void;
  onModeChange: (mode: AIMode) => void;
  onApply: () => void;
  onClose?: () => void;
  className?: string;
}

const AIPanel = React.forwardRef<HTMLDivElement, AIPanelProps>(
  ({ mode, loading = false, prompt, diff, agentEnabled = false, messages = [], onSendMessage, onModeChange, onApply, onClose, className }, ref) => {
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
          'w-96 bg-bg-elev/80 backdrop-blur-md border border-stroke/50 h-[calc(100vh-2rem)] flex flex-col',
          'shadow-2xl rounded-xl',
          'glass-effect',
          className
        )}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between p-4 border-b border-stroke rounded-t-xl overflow-hidden">
          {/* Gradiente padrão do header */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(900px_300px_at_-10%_-50%,_rgba(122,162,255,0.25),_transparent_60%),radial-gradient(600px_240px_at_120%_-20%,_rgba(138,211,255,0.18),_transparent_60%)]" />
          <div className="relative w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text">Assistente IA</h3>
            </div>
          </div>
          
          {onClose && (
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 hover:bg-bg/50 rounded-lg"
            >
              <X className="h-4 w-4" />
            </IconButton>
          )}
          </div>
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
        <div className="flex-1 p-4 space-y-4 min-h-0">
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

          {/* Empty State (vem antes das conversas) */}
          {!prompt && !diff && !loading && (!messages || messages.length === 0) && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-text mb-1">Pronto para começar?</h4>
              <p className="text-sm text-text-dim">
                Selecione um modo e envie sua mensagem
              </p>
            </div>
          )}

          {/* Conversa - usando IU do chat da criação de projetos v2 */}
          {agentEnabled && (
            <div className="space-y-3 flex flex-col min-h-0">
              <div className="flex-1 min-h-0 overflow-auto px-0">
                {messages && messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map((m, idx) => (
                      <ChatMessage
                        key={idx}
                        message={m.content}
                        sender={m.role === 'assistant' ? 'bot' : 'user'}
                        timestamp={new Date()}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Input fixo antes do footer */}
        {agentEnabled && onSendMessage && (
          <div className="px-4 pb-3">
            <div className="border border-stroke rounded-xl p-2 bg-bg-elev/60 backdrop-blur-md glass-effect">
              <div className="flex gap-2">
                <input
                  type="text"
                  id="chat-input"
                  className="flex-1 bg-transparent outline-none px-2 py-2 text-sm"
                  placeholder="Escreva uma mensagem..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        onSendMessage(value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <Button size="sm" variant="default" onClick={() => {
                  const input = document.getElementById('chat-input') as HTMLInputElement;
                  if (input) {
                    const value = input.value.trim();
                    if (value) {
                      onSendMessage(value);
                      input.value = '';
                    }
                  }
                }}>Enviar</Button>
              </div>
            </div>
          </div>
        )}

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


