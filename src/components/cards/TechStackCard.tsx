import * as React from 'react';
import { Code, Plus, X, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { CardHeader, CardBody, CardFooter } from '@/components/molecules';
import { Button } from '@/components/foundation';
import { Input } from '@/components/foundation';
import { Textarea } from '@/components/foundation';
import { Badge } from '@/components/foundation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/foundation';
import { cn } from '@/lib/utils';

export interface TechChoice {
  id: string;
  category: string;
  name: string;
  description: string;
  reason: string;
  alternatives: string[];
  complexity: 'low' | 'medium' | 'high';
  cost: 'free' | 'low' | 'medium' | 'high';
  selected: boolean;
}

export interface TechStackCardProps {
  techStack: {
    architecture: string;
    frontend: string;
    backend: string;
    database: string;
    infrastructure: string;
    devops: string;
    choices: TechChoice[];
  };
  status: 'DRAFT' | 'READY';
  onUpdate: (field: keyof Omit<TechStackCardProps['techStack'], 'choices'>, value: string) => void;
  onTechChoiceAdd: (choice: Omit<TechChoice, 'id'>) => void;
  onTechChoiceUpdate: (id: string, updates: Partial<TechChoice>) => void;
  onTechChoiceDelete: (id: string) => void;
  onAIGenerate: (type: 'architecture' | 'stack' | 'alternatives') => void;
  onMenuAction?: (action: 'duplicate' | 'delete' | 'link') => void;
  className?: string;
}

const TechStackCard = React.forwardRef<HTMLDivElement, TechStackCardProps>(
  ({ 
    techStack, 
    status, 
    onUpdate, 
    onTechChoiceAdd, 
    onTechChoiceUpdate, 
    onTechChoiceDelete, 
    onAIGenerate, 
    onMenuAction, 
    className 
  }, ref) => {
    const [newChoice, setNewChoice] = React.useState({
      category: '',
      name: '',
      description: '',
      reason: '',
      alternatives: '',
      complexity: 'medium' as const,
      cost: 'free' as const,
    });

    const categories = [
      'Frontend',
      'Backend',
      'Database',
      'Infrastructure',
      'DevOps',
      'Mobile',
      'AI/ML',
      'Analytics',
      'Security',
      'Other',
    ];

    const handleAddChoice = () => {
      if (newChoice.name.trim() && newChoice.category) {
        const choice: TechChoice = {
          id: Date.now().toString(),
          ...newChoice,
          alternatives: newChoice.alternatives.split(',').map(s => s.trim()).filter(Boolean),
          selected: true,
        };
        onTechChoiceAdd(choice);
        setNewChoice({
          category: '',
          name: '',
          description: '',
          reason: '',
          alternatives: '',
          complexity: 'medium',
          cost: 'free',
        });
      }
    };

    const getComplexityColor = (complexity: TechChoice['complexity']) => {
      switch (complexity) {
        case 'low': return 'text-success';
        case 'medium': return 'text-warning';
        case 'high': return 'text-danger';
        default: return 'text-text-dim';
      }
    };

    const getCostColor = (cost: TechChoice['cost']) => {
      switch (cost) {
        case 'free': return 'text-success';
        case 'low': return 'text-info';
        case 'medium': return 'text-warning';
        case 'high': return 'text-danger';
        default: return 'text-text-dim';
      }
    };

    const getComplexityLabel = (complexity: TechChoice['complexity']) => {
      switch (complexity) {
        case 'low': return 'Baixa';
        case 'medium': return 'Média';
        case 'high': return 'Alta';
        default: return 'N/A';
      }
    };

    const getCostLabel = (cost: TechChoice['cost']) => {
      switch (cost) {
        case 'free': return 'Gratuito';
        case 'low': return 'Baixo';
        case 'medium': return 'Médio';
        case 'high': return 'Alto';
        default: return 'N/A';
      }
    };

    const selectedChoices = techStack.choices.filter(c => c.selected).length;
    const totalChoices = techStack.choices.length;
    const completionPercentage = totalChoices > 0 ? Math.round((selectedChoices / totalChoices) * 100) : 0;

    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-elev border border-stroke rounded-lg overflow-hidden',
          'hover:border-cyan/50 transition-all duration-200',
          className
        )}
      >
        <CardHeader
          icon={<Code className="h-5 w-5" />}
          title="Stack Tecnológico"
          status={status}
          stageKey="tecnologia"
          onMenuAction={onMenuAction}
        />

        <CardBody>
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">Tecnologias</span>
                <Badge variant={completionPercentage === 100 ? 'success' : 'info'}>
                  {completionPercentage}%
                </Badge>
              </div>
              <div className="text-xs text-text-dim">
                {selectedChoices} de {totalChoices} selecionadas
              </div>
            </div>

            {/* Architecture Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text">Arquitetura Geral</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAIGenerate('architecture')}
                  className="h-6 px-2 text-xs"
                >
                  <Code className="h-3 w-3 mr-1" />
                  IA
                </Button>
              </div>
              <Textarea
                value={techStack.architecture || ''}
                onChange={(e) => onUpdate('architecture', e.target.value)}
                placeholder="Descreva a arquitetura geral do sistema..."
                rows={3}
              />
            </div>

            {/* Quick Stack Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Frontend</label>
                <Input
                  value={techStack.frontend || ''}
                  onChange={(e) => onUpdate('frontend', e.target.value)}
                  placeholder="React, Vue, Angular..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Backend</label>
                <Input
                  value={techStack.backend || ''}
                  onChange={(e) => onUpdate('backend', e.target.value)}
                  placeholder="Node.js, Python, Java..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Database</label>
                <Input
                  value={techStack.database || ''}
                  onChange={(e) => onUpdate('database', e.target.value)}
                  placeholder="PostgreSQL, MongoDB, Redis..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Infrastructure</label>
                <Input
                  value={techStack.infrastructure || ''}
                  onChange={(e) => onUpdate('infrastructure', e.target.value)}
                  placeholder="AWS, Vercel, Docker..."
                />
              </div>
            </div>

            {/* Tech Choices */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-text">Escolhas Tecnológicas</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAIGenerate('stack')}
                  className="h-6 px-2 text-xs"
                >
                  <Code className="h-3 w-3 mr-1" />
                  IA
                </Button>
              </div>

              {/* Add New Choice */}
              <div className="p-3 bg-bg border border-stroke rounded-md space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Select value={newChoice.category} onValueChange={(value) => setNewChoice(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newChoice.name}
                    onChange={(e) => setNewChoice(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da tecnologia..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    value={newChoice.description}
                    onChange={(e) => setNewChoice(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição..."
                  />
                  <Input
                    value={newChoice.alternatives}
                    onChange={(e) => setNewChoice(prev => ({ ...prev, alternatives: e.target.value }))}
                    placeholder="Alternativas (separadas por vírgula)..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select
                    value={newChoice.complexity}
                    onChange={(e) => setNewChoice(prev => ({ ...prev, complexity: e.target.value as any }))}
                    className="px-3 py-2 bg-bg-elev border border-stroke rounded-md text-sm text-text"
                  >
                    <option value="low">Complexidade: Baixa</option>
                    <option value="medium">Complexidade: Média</option>
                    <option value="high">Complexidade: Alta</option>
                  </select>
                  <select
                    value={newChoice.cost}
                    onChange={(e) => setNewChoice(prev => ({ ...prev, cost: e.target.value as any }))}
                    className="px-3 py-2 bg-bg-elev border border-stroke rounded-md text-sm text-text"
                  >
                    <option value="free">Custo: Gratuito</option>
                    <option value="low">Custo: Baixo</option>
                    <option value="medium">Custo: Médio</option>
                    <option value="high">Custo: Alto</option>
                  </select>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddChoice}
                    disabled={!newChoice.name.trim() || !newChoice.category}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Choices List */}
              <div className="space-y-2">
                {techStack.choices.map((choice) => (
                  <div
                    key={choice.id}
                    className="p-3 bg-bg border border-stroke rounded-md hover:bg-bg-elev/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onTechChoiceUpdate(choice.id, { selected: !choice.selected })}
                          className="flex-shrink-0"
                        >
                          {choice.selected ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <Circle className="h-4 w-4 text-text-dim" />
                          )}
                        </button>
                        <div>
                          <h5 className={cn(
                            "text-sm font-medium",
                            choice.selected ? "text-text" : "text-text-dim"
                          )}>
                            {choice.name}
                          </h5>
                          <Badge variant="info" className="text-xs">
                            {choice.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTechChoiceDelete(choice.id)}
                        className="h-6 w-6 p-0 text-text-dim hover:text-danger"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {choice.description && (
                      <p className="text-xs text-text-dim mb-2">
                        {choice.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs">
                      <span className={getComplexityColor(choice.complexity)}>
                        Complexidade: {getComplexityLabel(choice.complexity)}
                      </span>
                      <span className={getCostColor(choice.cost)}>
                        Custo: {getCostLabel(choice.cost)}
                      </span>
                      {choice.alternatives.length > 0 && (
                        <span className="text-text-dim">
                          {choice.alternatives.length} alternativa(s)
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {techStack.choices.length === 0 && (
                  <div className="text-center py-8 text-text-dim">
                    <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma tecnologia adicionada ainda</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter
          updatedAt={new Date()}
          aiGenerated={techStack.choices.length > 0}
        />
      </div>
    );
  }
);

TechStackCard.displayName = 'TechStackCard';

export { TechStackCard };


