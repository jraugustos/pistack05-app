import * as React from 'react';
import { Lightbulb, Sparkles, Target, Users } from 'lucide-react';
import { CardHeader, CardBody, CardFooter } from '@/components/molecules';
import { Button } from '@/components/foundation';
import { Textarea } from '@/components/foundation';
import { Badge } from '@/components/foundation';
import { cn } from '@/lib/utils';

export interface IdeaBaseCardProps {
  idea: {
    title: string;
    description: string;
    problem: string;
    solution: string;
    targetAudience: string;
    valueProposition: string;
  };
  status: 'DRAFT' | 'READY';
  onUpdate: (field: keyof IdeaBaseCardProps['idea'], value: string) => void;
  onAIGenerate: (field: keyof IdeaBaseCardProps['idea']) => void;
  onMenuAction?: (action: 'duplicate' | 'delete' | 'link') => void;
  className?: string;
}

const IdeaBaseCard = React.forwardRef<HTMLDivElement, IdeaBaseCardProps>(
  ({ idea, status, onUpdate, onAIGenerate, onMenuAction, className }, ref) => {
    const fields = [
      {
        key: 'description' as const,
        label: 'Descrição da Ideia',
        placeholder: 'Descreva sua ideia de forma clara e objetiva...',
        icon: <Lightbulb className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'problem' as const,
        label: 'Problema que Resolve',
        placeholder: 'Qual problema específico sua ideia resolve?',
        icon: <Target className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'solution' as const,
        label: 'Solução Proposta',
        placeholder: 'Como sua ideia resolve o problema?',
        icon: <Sparkles className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'targetAudience' as const,
        label: 'Público-Alvo',
        placeholder: 'Quem são seus usuários ideais?',
        icon: <Users className="h-4 w-4" />,
        required: false,
      },
      {
        key: 'valueProposition' as const,
        label: 'Proposta de Valor',
        placeholder: 'Qual o valor único que você oferece?',
        icon: <Sparkles className="h-4 w-4" />,
        required: false,
      },
    ];

    const completedFields = fields.filter(field => idea[field.key]?.trim()).length;
    const totalFields = fields.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-elev border border-stroke rounded-lg overflow-hidden',
          'hover:border-primary/50 transition-all duration-200',
          className
        )}
      >
        <CardHeader
          icon={<Lightbulb className="h-5 w-5" />}
          title="Ideia Base"
          status={status}
          stageKey="ideia-base"
          onMenuAction={onMenuAction}
        />

        <CardBody>
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">Completude</span>
                <Badge variant={completionPercentage === 100 ? 'success' : 'info'}>
                  {completionPercentage}%
                </Badge>
              </div>
              <div className="text-xs text-text-dim">
                {completedFields} de {totalFields} campos
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-text">
                      {field.icon}
                      {field.label}
                      {field.required && <span className="text-danger">*</span>}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAIGenerate(field.key)}
                      className="h-6 px-2 text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      IA
                    </Button>
                  </div>
                  <Textarea
                    value={idea[field.key] || ''}
                    onChange={(e) => onUpdate(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              ))}
            </div>

            {/* Summary */}
            {idea.title && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                <h4 className="text-sm font-medium text-primary mb-1">Resumo da Ideia</h4>
                <p className="text-sm text-text-dim">
                  <strong>{idea.title}</strong> - {idea.description?.slice(0, 100)}
                  {idea.description && idea.description.length > 100 && '...'}
                </p>
              </div>
            )}
          </div>
        </CardBody>

        <CardFooter
          updatedAt={new Date()}
          aiGenerated={completedFields > 0}
        />
      </div>
    );
  }
);

IdeaBaseCard.displayName = 'IdeaBaseCard';

export { IdeaBaseCard };


