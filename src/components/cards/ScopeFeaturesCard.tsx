import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, Badge } from '@/components/foundation';
import { Plus, Trash2, Sparkles, Check } from 'lucide-react';

export interface Feature {
  id: string;
  name: string;
  description: string;
  moscow: 'must' | 'should' | 'could' | 'wont';
  effort: 'low' | 'medium' | 'high';
}

export interface ScopeFeaturesCardProps {
  features?: Feature[];
  status?: 'DRAFT' | 'READY';
  onUpdate?: (updates: { features: Feature[] }) => void;
  onAIGenerate?: (mode: 'generate' | 'expand' | 'review', prompt?: string) => void;
  onConfirm?: () => void;
  className?: string;
}

const moscowColors = {
  must: 'bg-red-500/10 text-red-700 border-red-500/20',
  should: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  could: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  wont: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
};

const effortColors = {
  low: 'bg-green-500/10 text-green-700 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-700 border-red-500/20',
};

const ScopeFeaturesCard = React.forwardRef<HTMLDivElement, ScopeFeaturesCardProps>(
  ({ features = [], status = 'DRAFT', onUpdate, onAIGenerate, onConfirm, className }, ref) => {
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [newFeature, setNewFeature] = React.useState<Partial<Feature>>({
      name: '',
      description: '',
      moscow: 'should',
      effort: 'medium',
    });

    const handleAddFeature = () => {
      if (!newFeature.name?.trim()) return;
      
      const feature: Feature = {
        id: Date.now().toString(),
        name: newFeature.name.trim(),
        description: newFeature.description?.trim() || '',
        moscow: newFeature.moscow as any || 'should',
        effort: newFeature.effort as any || 'medium',
      };

      onUpdate?.({ features: [...features, feature] });
      setNewFeature({ name: '', description: '', moscow: 'should', effort: 'medium' });
    };

    const handleRemoveFeature = (id: string) => {
      onUpdate?.({ features: features.filter(f => f.id !== id) });
    };

    const handleUpdateFeature = (id: string, updates: Partial<Feature>) => {
      onUpdate?.({
        features: features.map(f => f.id === id ? { ...f, ...updates } : f),
      });
    };

    const isReady = status === 'READY';

    return (
      <div ref={ref} className={cn('bg-bg-soft border border-stroke rounded-lg overflow-hidden', className)}>
        {/* Header */}
        <div className="p-4 border-b border-stroke bg-bg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text">Funcionalidades</h3>
              <p className="text-sm text-text-muted mt-1">
                {features.length} funcionalidades definidas
              </p>
            </div>
            <button
              onClick={() => {
                if (onConfirm && (features.length > 0 || isReady)) {
                  onConfirm();
                }
              }}
              disabled={features.length === 0 && !isReady}
              className={cn(
                'transition-all',
                (features.length > 0 || isReady) ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'
              )}
              title={
                isReady
                  ? 'Clique para voltar para DRAFT'
                  : features.length > 0
                  ? 'Clique para marcar como READY'
                  : 'Adicione pelo menos uma funcionalidade'
              }
            >
              <Badge variant={isReady ? 'success' : 'draft'}>
                {isReady && <Check className="w-3 h-3 mr-1" />}
                {isReady ? 'READY' : 'DRAFT'}
              </Badge>
            </button>
          </div>
        </div>

        {/* Features List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {features.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <p className="text-sm">Nenhuma funcionalidade adicionada ainda</p>
              <p className="text-xs mt-1">Use a IA para gerar sugestões ou adicione manualmente</p>
            </div>
          )}

          {features.map((feature) => (
            <div key={feature.id} className="p-3 bg-bg border border-stroke rounded-md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-text">{feature.name}</h4>
                  {feature.description && (
                    <p className="text-xs text-text-muted mt-1">{feature.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Badge className={moscowColors[feature.moscow]} variant="secondary">
                      {feature.moscow.toUpperCase()}
                    </Badge>
                    <Badge className={effortColors[feature.effort]} variant="secondary">
                      {feature.effort}
                    </Badge>
                  </div>
                </div>
                {!isReady && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFeature(feature.id)}
                  >
                    <Trash2 className="w-4 h-4 text-text-muted hover:text-red-600" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Add New Feature */}
          {!isReady && (
            <div className="p-3 bg-bg border border-dashed border-stroke rounded-md">
              <input
                type="text"
                placeholder="Nome da funcionalidade"
                value={newFeature.name || ''}
                onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
              />
              <input
                type="text"
                placeholder="Descrição (opcional)"
                value={newFeature.description || ''}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                className="w-full px-2 py-1 bg-transparent border-0 text-xs text-text-muted focus:outline-none mt-1"
              />
              <div className="flex gap-2 mt-2">
                <select
                  value={newFeature.moscow || 'should'}
                  onChange={(e) => setNewFeature({ ...newFeature, moscow: e.target.value as any })}
                  className="text-xs bg-bg-soft border border-stroke rounded px-2 py-1"
                >
                  <option value="must">Must Have</option>
                  <option value="should">Should Have</option>
                  <option value="could">Could Have</option>
                  <option value="wont">Won't Have</option>
                </select>
                <select
                  value={newFeature.effort || 'medium'}
                  onChange={(e) => setNewFeature({ ...newFeature, effort: e.target.value as any })}
                  className="text-xs bg-bg-soft border border-stroke rounded px-2 py-1"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <Button size="sm" variant="secondary" onClick={handleAddFeature}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isReady && (
          <div className="p-4 border-t border-stroke bg-bg flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onAIGenerate?.('generate')}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4" />
              Gerar com IA
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onAIGenerate?.('expand')}
              disabled={features.length === 0}
            >
              Expandir
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={onConfirm}
              disabled={features.length === 0}
            >
              <Check className="w-4 h-4" />
              Confirmar
            </Button>
          </div>
        )}
      </div>
    );
  }
);

ScopeFeaturesCard.displayName = 'ScopeFeaturesCard';

export { ScopeFeaturesCard };
