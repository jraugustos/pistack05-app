import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, Badge } from '@/components/foundation';
import { Modal } from '@/components/foundation';
import { Download, Copy, RefreshCw, X } from 'lucide-react';

export interface OutputsModalProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onRegenerate?: (type: 'work-plan' | 'prd' | 'prompt-pack') => void;
}

const OutputsModal = React.forwardRef<HTMLDivElement, OutputsModalProps>(
  ({ projectId, open, onClose, onRegenerate }, ref) => {
    const [loading, setLoading] = React.useState(true);
    const [content, setContent] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
      if (open && projectId) {
        loadWorkPlan();
      }
    }, [open, projectId]);

    const loadWorkPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/outputs/work-plan?project_id=${projectId}`);
        if (!res.ok) throw new Error('Failed to load work plan');
        const json = await res.json();
        if (json.outputs && json.outputs.length > 0) {
          setContent(json.outputs[0].content);
        } else {
          setContent('Nenhum Work Plan gerado ainda.');
        }
      } catch (err) {
        console.error('Load work plan error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    const handleRegenerate = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/outputs/work-plan?project_id=${projectId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regenerate: true }),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.details || json.error || 'Failed to regenerate');
        }
        const json = await res.json();
        setContent(json.output.content);
        onRegenerate?.('work-plan');
      } catch (err) {
        console.error('Regenerate error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
      // TODO: Toast de sucesso
    };

    const handleDownload = () => {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `work-plan-${projectId}.md`;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div ref={ref} className="bg-bg border border-stroke rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stroke">
            <div>
              <h2 className="text-lg font-semibold text-text">Work Plan</h2>
              <p className="text-sm text-text-muted">Plano de trabalho do projeto</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-text-muted">Carregando...</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-text font-mono bg-bg-soft p-4 rounded-lg border border-stroke">
                  {content}
                </pre>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-stroke">
            <Button variant="secondary" size="sm" onClick={handleRegenerate} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              Regenerar
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
              <Button variant="primary" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OutputsModal.displayName = 'OutputsModal';

export { OutputsModal };
