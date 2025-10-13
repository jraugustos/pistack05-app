import * as React from 'react';
import { Lightbulb, Sparkles, Target, Users, Circle, Clock, CheckCircle } from 'lucide-react';
import { CardHeader, CardBody, CardFooter } from '@/components/molecules';
import { Button } from '@/components/foundation';
import { Textarea } from '@/components/foundation';
import { Badge } from '@/components/foundation';
import { cn } from '@/lib/utils';

import type { Card } from '@/types';

export interface IdeaBaseCardProps {
  card: Card;
  cards?: Card[]; // Array de todos os cards para verificar status
  onUpdate?: (fields: any) => void;
  onGenerate?: (mode: 'generate' | 'expand' | 'review') => void;
  onConfirmReady?: () => void;
  onChecklistClick?: (target: { stageKey: string; typeKey: string }) => void;
  onFocusCard?: (cardId: string) => void; // Nova prop para focar em card existente
  className?: string;
}

const IdeaBaseCard = React.forwardRef<HTMLDivElement, IdeaBaseCardProps>(
  ({ card, cards = [], onUpdate, onGenerate, onConfirmReady, onChecklistClick, onFocusCard, className }, ref) => {
    // Extrair dados dos fields do card
    const idea = {
      name: card.fields?.name || '',
      pitch: card.fields?.pitch || '',
      // campos movidos para IdeaEnricher
    };
    
    const status = card.status;

    // Função para verificar status de cada etapa do checklist
    const getChecklistStatus = (stageKey: string, typeKey: string) => {
      const existingCard = cards.find(c => c.stageKey === stageKey && c.typeKey === typeKey);
      
      if (!existingCard) return { status: 'pending' as const, cardId: null };
      if (existingCard.status === 'READY') return { status: 'completed' as const, cardId: existingCard.id };
      return { status: 'in_progress' as const, cardId: existingCard.id };
    };

    // Definir checklist com informações de cada etapa
    const checklistItems = [
      { stageKey: 'escopo', typeKey: 'scope.features', label: 'Funcionalidades', description: 'Defina as features principais' },
      { stageKey: 'tech', typeKey: 'tech.stack', label: 'Tech Stack', description: 'Escolha as tecnologias' },
    ];

    // Calcular progresso geral
    const checklistStatuses = checklistItems.map(item => getChecklistStatus(item.stageKey, item.typeKey));
    const completedCount = checklistStatuses.filter(s => s.status === 'completed').length;
    const totalCount = checklistItems.length;
    const fields = [
      {
        key: 'pitch' as const,
        label: 'Descrição da Ideia',
        placeholder: 'Descreva sua ideia de forma clara e objetiva...',
        icon: <Lightbulb className="h-4 w-4" />,
        required: true,
      },
    ];

    const completedFields = fields.filter(field => {
      const value = idea[field.key];
      return value && typeof value === 'string' && value.trim().length > 0;
    }).length;
    const totalFields = fields.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-elev rounded-lg overflow-hidden',
          'border border-stroke',
          'transition-all duration-200',
          className
        )}
        style={{
          boxShadow: '0 0 20px rgba(122, 162, 255, 0.3)',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-stroke bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Stage Icon */}
            <div className="flex-shrink-0 text-primary">
              <Lightbulb className="h-5 w-5" />
            </div>

            {/* Title */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-text">Ideia Base</h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={status === 'READY' ? 'success' : 'draft'} className="capitalize">
                  {status === 'READY' ? 'ready' : 'draft'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status Icon */}
          <div className="flex-shrink-0">
            {status === 'READY' ? (
              <span className="text-success">✓</span>
            ) : (
              <span className="text-text-dim">○</span>
            )}
          </div>
        </div>

        <CardBody>
          <div className="space-y-6">
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
                      onClick={() => onGenerate?.('generate')}
                      className="h-6 px-2 text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      IA
                    </Button>
                  </div>
                  <Textarea
                    value={idea[field.key] || ''}
                    onChange={(e) => {
                      if (onUpdate) {
                        const updatedFields = { ...card.fields, [field.key]: e.target.value };
                        onUpdate(updatedFields);
                      }
                    }}
                    placeholder={field.placeholder}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              ))}
            </div>

            {/* Stage Checklist */}
            {typeof onChecklistClick === 'function' && (
              <div className="p-5 bg-bg border border-stroke rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-text">Próximas etapas</h4>
                  <Badge variant={completedCount === totalCount ? 'success' : 'default'} className="text-xs">
                    {completedCount}/{totalCount} concluídas
                  </Badge>
                </div>

                <div className="space-y-4">
                  {checklistItems.map((item, index) => {
                    const itemStatus = checklistStatuses[index];
                    
                    // Renderizar ícone baseado no status
                    const StatusIcon = itemStatus.status === 'completed' 
                      ? CheckCircle 
                      : itemStatus.status === 'in_progress' 
                      ? Clock 
                      : Circle;
                    
                    const iconColor = itemStatus.status === 'completed'
                      ? 'text-success'
                      : itemStatus.status === 'in_progress'
                      ? 'text-warning'
                      : 'text-text-dim';

                    const buttonText = itemStatus.status === 'pending'
                      ? `Criar ${item.label}`
                      : itemStatus.status === 'in_progress'
                      ? `Editar ${item.label}`
                      : `Ver ${item.label}`;

                    return (
                      <Button
                        key={item.typeKey}
                        variant={itemStatus.status === 'pending' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          if (itemStatus.status === 'pending') {
                            // Criar novo card
                            onChecklistClick({ stageKey: item.stageKey, typeKey: item.typeKey });
                          } else if (itemStatus.cardId && onFocusCard) {
                            // Focar card existente
                            onFocusCard(itemStatus.cardId);
                          }
                        }}
                        className={cn(
                          'w-full justify-start gap-3 h-auto py-3 px-3 rounded-lg',
                          itemStatus.status !== 'pending' && 'hover:bg-bg-elev/50'
                        )}
                      >
                        <StatusIcon className={cn('w-4 h-4', iconColor)} />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{buttonText}</div>
                          <div className="text-xs text-text-dim">{item.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                <p className="text-xs text-text-dim mt-6 pt-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Adicione 2+ cards para habilitar o Work Plan
                </p>
              </div>
            )}

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


