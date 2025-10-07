import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, Badge } from '@/components/foundation';
import { Plus, Trash2, Sparkles, Check, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';

export interface TechStackFields {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  infrastructure?: string[];
  integrations?: string[];
  risks?: string[];
  pros?: string[];
  cons?: string[];
}

export interface TechStackCardProps {
  stack?: TechStackFields;
  status?: 'DRAFT' | 'READY';
  onUpdate?: (updates: TechStackFields) => void;
  onAIGenerate?: (mode: 'generate' | 'expand' | 'review', prompt?: string) => void;
  onConfirm?: () => void;
  className?: string;
}

const TechStackCard = React.forwardRef<HTMLDivElement, TechStackCardProps>(
  ({ stack = {}, status = 'DRAFT', onUpdate, onAIGenerate, onConfirm, className }, ref) => {
    const [newItem, setNewItem] = React.useState('');
    const [activeSection, setActiveSection] = React.useState<keyof TechStackFields | null>(null);

    const handleAddItem = (section: keyof TechStackFields, value: string) => {
      if (!value.trim()) return;
      const current = stack[section] || [];
      onUpdate?.({ ...stack, [section]: [...current, value.trim()] });
      setNewItem('');
      setActiveSection(null);
    };

    const handleRemoveItem = (section: keyof TechStackFields, index: number) => {
      const current = stack[section] || [];
      onUpdate?.({ ...stack, [section]: current.filter((_, i) => i !== index) });
    };

    const isReady = status === 'READY';

    const sections: Array<{ key: keyof TechStackFields; label: string; icon?: any }> = [
      { key: 'frontend', label: 'Frontend' },
      { key: 'backend', label: 'Backend' },
      { key: 'database', label: 'Database' },
      { key: 'infrastructure', label: 'Infrastructure' },
      { key: 'integrations', label: 'Integrações' },
    ];

    const analysis: Array<{ key: keyof TechStackFields; label: string; icon: any; color: string }> = [
      { key: 'risks', label: 'Riscos', icon: AlertTriangle, color: 'text-yellow-600' },
      { key: 'pros', label: 'Vantagens', icon: ThumbsUp, color: 'text-green-600' },
      { key: 'cons', label: 'Desvantagens', icon: ThumbsDown, color: 'text-red-600' },
    ];

    const totalTechs = sections.reduce((acc, s) => acc + (stack[s.key]?.length || 0), 0);

    return (
      <div ref={ref} className={cn('bg-bg-soft border border-stroke rounded-lg overflow-hidden', className)}>
        {/* Header */}
        <div className="p-4 border-b border-stroke bg-bg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text">Stack Tecnológico</h3>
              <p className="text-sm text-text-muted mt-1">
                {totalTechs} tecnologias selecionadas
              </p>
            </div>
            {isReady && (
              <Badge variant="success">
                <Check className="w-3 h-3" />
                READY
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Tech Sections */}
          {sections.map((section) => (
            <div key={section.key} className="space-y-2">
              <h4 className="text-sm font-medium text-text">{section.label}</h4>
              <div className="flex flex-wrap gap-2">
                {(stack[section.key] || []).map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="pr-1">
                    {item}
                    {!isReady && (
                      <button
                        onClick={() => handleRemoveItem(section.key, idx)}
                        className="ml-1 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {!isReady && activeSection === section.key && (
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddItem(section.key, newItem);
                      if (e.key === 'Escape') setActiveSection(null);
                    }}
                    onBlur={() => {
                      if (newItem.trim()) handleAddItem(section.key, newItem);
                      else setActiveSection(null);
                    }}
                    autoFocus
                    placeholder={`Add ${section.label.toLowerCase()}...`}
                    className="px-2 py-1 text-xs bg-bg border border-stroke rounded focus:outline-none focus:border-primary"
                  />
                )}
                {!isReady && activeSection !== section.key && (
                  <button
                    onClick={() => setActiveSection(section.key)}
                    className="px-2 py-1 text-xs border border-dashed border-stroke rounded hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus className="w-3 h-3 inline" /> Add
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Analysis Sections */}
          <div className="pt-4 border-t border-stroke space-y-3">
            {analysis.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.key} className="space-y-2">
                  <h4 className="text-sm font-medium text-text flex items-center gap-2">
                    <Icon className={cn('w-4 h-4', section.color)} />
                    {section.label}
                  </h4>
                  <ul className="space-y-1">
                    {(stack[section.key] || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-text-muted">
                        <span className="mt-1">•</span>
                        <span className="flex-1">{item}</span>
                        {!isReady && (
                          <button
                            onClick={() => handleRemoveItem(section.key, idx)}
                            className="hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {!isReady && (
                    <button
                      onClick={() => setActiveSection(section.key)}
                      className="text-xs text-text-muted hover:text-primary"
                    >
                      + Adicionar {section.label.toLowerCase()}
                    </button>
                  )}
                  {activeSection === section.key && (
                    <textarea
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) handleAddItem(section.key, newItem);
                        if (e.key === 'Escape') setActiveSection(null);
                      }}
                      onBlur={() => {
                        if (newItem.trim()) handleAddItem(section.key, newItem);
                        else setActiveSection(null);
                      }}
                      autoFocus
                      placeholder={`Adicione ${section.label.toLowerCase()}... (Ctrl+Enter para salvar)`}
                      className="w-full px-2 py-1 text-xs bg-bg border border-stroke rounded focus:outline-none focus:border-primary resize-none"
                      rows={2}
                    />
                  )}
                </div>
              );
            })}
          </div>
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
              onClick={() => onAIGenerate?.('review')}
              disabled={totalTechs === 0}
            >
              Review
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={onConfirm}
              disabled={totalTechs === 0}
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

TechStackCard.displayName = 'TechStackCard';

export { TechStackCard };
