import * as React from 'react';
import { Target, Plus, X, CheckCircle2, Circle } from 'lucide-react';
import { CardHeader, CardBody, CardFooter } from '@/components/molecules';
import { Button } from '@/components/foundation';
import { Input } from '@/components/foundation';
import { Textarea } from '@/components/foundation';
import { Badge } from '@/components/foundation';
import { Chip } from '@/components/foundation';
import { cn } from '@/lib/utils';

export interface Feature {
  id: string;
  title: string;
  description: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  effort: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface ScopeFeaturesCardProps {
  scope: {
    projectGoals: string;
    successMetrics: string;
    constraints: string;
    timeline: string;
    budget: string;
    features: Feature[];
  };
  status: 'DRAFT' | 'READY';
  onUpdate: (field: keyof Omit<ScopeFeaturesCardProps['scope'], 'features'>, value: string) => void;
  onFeatureAdd: (feature: Omit<Feature, 'id'>) => void;
  onFeatureUpdate: (id: string, updates: Partial<Feature>) => void;
  onFeatureDelete: (id: string) => void;
  onAIGenerate: (type: 'goals' | 'features' | 'metrics') => void;
  onMenuAction?: (action: 'duplicate' | 'delete' | 'link') => void;
  className?: string;
}

const ScopeFeaturesCard = React.forwardRef<HTMLDivElement, ScopeFeaturesCardProps>(
  ({ 
    scope, 
    status, 
    onUpdate, 
    onFeatureAdd, 
    onFeatureUpdate, 
    onFeatureDelete, 
    onAIGenerate, 
    onMenuAction, 
    className 
  }, ref) => {
    const [newFeature, setNewFeature] = React.useState({
      title: '',
      description: '',
      priority: 'must' as const,
      effort: 'medium' as const,
    });

    const handleAddFeature = () => {
      if (newFeature.title.trim()) {
        onFeatureAdd({
          ...newFeature,
          id: Date.now().toString(),
          completed: false,
        });
        setNewFeature({
          title: '',
          description: '',
          priority: 'must',
          effort: 'medium',
        });
      }
    };

    const getEffortColor = (effort: Feature['effort']) => {
      switch (effort) {
        case 'low': return 'text-success';
        case 'medium': return 'text-warning';
        case 'high': return 'text-danger';
        default: return 'text-text-dim';
      }
    };

    const getEffortLabel = (effort: Feature['effort']) => {
      switch (effort) {
        case 'low': return 'Baixo';
        case 'medium': return 'Médio';
        case 'high': return 'Alto';
        default: return 'N/A';
      }
    };

    const completedFeatures = scope.features.filter(f => f.completed).length;
    const totalFeatures = scope.features.length;
    const completionPercentage = totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0;

    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-elev border border-stroke rounded-lg overflow-hidden',
          'hover:border-success/50 transition-all duration-200',
          className
        )}
      >
        <CardHeader
          icon={<Target className="h-5 w-5" />}
          title="Escopo e Funcionalidades"
          status={status}
          stageKey="escopo"
          onMenuAction={onMenuAction}
        />

        <CardBody>
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">Funcionalidades</span>
                <Badge variant={completionPercentage === 100 ? 'success' : 'info'}>
                  {completionPercentage}%
                </Badge>
              </div>
              <div className="text-xs text-text-dim">
                {completedFeatures} de {totalFeatures} concluídas
              </div>
            </div>

            {/* Project Goals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text">Objetivos do Projeto</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAIGenerate('goals')}
                  className="h-6 px-2 text-xs"
                >
                  <Target className="h-3 w-3 mr-1" />
                  IA
                </Button>
              </div>
              <Textarea
                value={scope.projectGoals || ''}
                onChange={(e) => onUpdate('projectGoals', e.target.value)}
                placeholder="Defina os objetivos principais do projeto..."
                rows={3}
              />
            </div>

            {/* Success Metrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text">Métricas de Sucesso</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAIGenerate('metrics')}
                  className="h-6 px-2 text-xs"
                >
                  <Target className="h-3 w-3 mr-1" />
                  IA
                </Button>
              </div>
              <Textarea
                value={scope.successMetrics || ''}
                onChange={(e) => onUpdate('successMetrics', e.target.value)}
                placeholder="Como medir o sucesso do projeto?"
                rows={2}
              />
            </div>

            {/* Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Cronograma</label>
                <Input
                  value={scope.timeline || ''}
                  onChange={(e) => onUpdate('timeline', e.target.value)}
                  placeholder="Ex: 3 meses, 6 sprints..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Orçamento</label>
                <Input
                  value={scope.budget || ''}
                  onChange={(e) => onUpdate('budget', e.target.value)}
                  placeholder="Ex: R$ 50.000, $10k..."
                />
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-text">Funcionalidades</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAIGenerate('features')}
                  className="h-6 px-2 text-xs"
                >
                  <Target className="h-3 w-3 mr-1" />
                  IA
                </Button>
              </div>

              {/* Add New Feature */}
              <div className="p-3 bg-bg border border-stroke rounded-md space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newFeature.title}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nome da funcionalidade..."
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddFeature}
                    disabled={!newFeature.title.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newFeature.description}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da funcionalidade..."
                    className="flex-1"
                  />
                  <select
                    value={newFeature.priority}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="px-3 py-2 bg-bg-elev border border-stroke rounded-md text-sm text-text"
                  >
                    <option value="must">Must</option>
                    <option value="should">Should</option>
                    <option value="could">Could</option>
                    <option value="wont">Won't</option>
                  </select>
                  <select
                    value={newFeature.effort}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, effort: e.target.value as any }))}
                    className="px-3 py-2 bg-bg-elev border border-stroke rounded-md text-sm text-text"
                  >
                    <option value="low">Baixo</option>
                    <option value="medium">Médio</option>
                    <option value="high">Alto</option>
                  </select>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                {scope.features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center gap-3 p-3 bg-bg border border-stroke rounded-md hover:bg-bg-elev/50 transition-colors"
                  >
                    <button
                      onClick={() => onFeatureUpdate(feature.id, { completed: !feature.completed })}
                      className="flex-shrink-0"
                    >
                      {feature.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-text-dim" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className={cn(
                          "text-sm font-medium truncate",
                          feature.completed ? "text-text-dim line-through" : "text-text"
                        )}>
                          {feature.title}
                        </h5>
                        <Chip variant={feature.priority} className="text-xs">
                          {feature.priority.toUpperCase()}
                        </Chip>
                        <span className={cn("text-xs", getEffortColor(feature.effort))}>
                          {getEffortLabel(feature.effort)}
                        </span>
                      </div>
                      {feature.description && (
                        <p className="text-xs text-text-dim truncate">
                          {feature.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFeatureDelete(feature.id)}
                      className="h-6 w-6 p-0 text-text-dim hover:text-danger"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {scope.features.length === 0 && (
                  <div className="text-center py-8 text-text-dim">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma funcionalidade adicionada ainda</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter
          updatedAt={new Date()}
          aiGenerated={scope.features.length > 0}
        />
      </div>
    );
  }
);

ScopeFeaturesCard.displayName = 'ScopeFeaturesCard';

export { ScopeFeaturesCard };


