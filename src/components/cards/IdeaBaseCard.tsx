import * as React from 'react';
import { Lightbulb, Sparkles, Target, Circle, Clock, CheckCircle } from 'lucide-react';
import { CardBody, CardFooter } from '@/components/molecules';
import { Button } from '@/components/foundation';
import { Textarea } from '@/components/foundation';
import { Badge } from '@/components/foundation';
import { LoadingSpinner } from '@/components/foundation';
import { cn } from '@/lib/utils';

import type { Card } from '@/types';

export interface IdeaBaseCardProps {
  card: Card;
  cards?: Card[]; // Array de todos os cards para verificar status
  enrichmentLoading?: boolean; // Loading state para enriquecimento
  onUpdate?: (fields: Record<string, unknown>) => void;
  onGenerate?: (mode: 'generate' | 'expand' | 'review') => void;
  onConfirmReady?: () => void;
  onChecklistClick?: (target: { stageKey: string; typeKey: string }) => void;
  onFocusCard?: (cardId: string) => void; // Nova prop para focar em card existente
  onEnrichIdea?: () => void; // Nova prop para criar IdeaEnricher
  className?: string;
}

const IdeaBaseCard = React.forwardRef<HTMLDivElement, IdeaBaseCardProps>(
  ({ card, cards = [], enrichmentLoading = false, onUpdate, onGenerate, onConfirmReady, onChecklistClick, onFocusCard, onEnrichIdea, className }, ref) => {
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

    // Verificar se existe IdeaEnricher (não precisa estar READY)
    const ideaEnricher = cards.find(c => c.typeKey === 'idea.enricher');
    const isIdeaEnriched = !!ideaEnricher; // Apenas verifica se existe

    // Definir checklist com informações de cada etapa
    const checklistItems = [
      { stageKey: 'ideia-base', typeKey: 'idea.target-audience', label: 'Público-Alvo', description: 'Defina quem é o público' },
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

    return (
      <div
        ref={ref}
        className={cn(
          'idea-base-card',
          'bg-bg-elev rounded-lg overflow-hidden',
          'transition-all duration-200',
          className
        )}
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
                    {onGenerate && status !== 'READY' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onGenerate?.('generate')}
                        className="h-6 px-2 text-xs"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        IA
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={idea[field.key] || ''}
                    onChange={(e) => {
                      if (onUpdate && status !== 'READY') {
                        const updatedFields = { ...card.fields, [field.key]: e.target.value };
                        onUpdate(updatedFields);
                      }
                    }}
                    placeholder={field.placeholder}
                    rows={3}
                    className="resize-none"
                    disabled={status === 'READY'}
                  />
                </div>
              ))}
            </div>

            {/* Botão Enriquecer Ideia */}
            {!ideaEnricher && onEnrichIdea && status !== 'READY' && (
              <div className="flex justify-center">
                <Button
                  onClick={onEnrichIdea}
                  variant="primary"
                  className="w-full"
                  disabled={enrichmentLoading}
                >
                  {enrichmentLoading ? (
                    <>
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                      Enriquecendo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enriquecer Ideia
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Mensagem quando ideia base está READY */}
            {status === 'READY' && (
              <div className="flex justify-center">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 w-full">
                  <p className="text-xs text-primary text-center">
                    <span className="font-medium">Ideia base confirmada</span> - Não pode ser alterada pois é a fundação do projeto
                  </p>
                </div>
              </div>
            )}

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
                          if (!isIdeaEnriched) {
                            // Bloquear se ideia não foi enriquecida
                            return;
                          }
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
                          itemStatus.status !== 'pending' && 'hover:bg-bg-elev/50',
                          !isIdeaEnriched && 'opacity-50 cursor-not-allowed'
                        )}
                        disabled={!isIdeaEnriched}
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

                <p className="text-xs text-text-dim mt-6 pt-12 flex items-center gap-2">
                  {!isIdeaEnriched ? (
                    <>
                      <Target className="w-3 h-3 flex-shrink-0" />
                      <span>Enriqueça para desbloquear as próximas etapas</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-3 h-3 flex-shrink-0" />
                      <span>Adicione 2+ cards para habilitar o Work Plan</span>
                    </>
                  )}
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

        <CardFooter>
          <div className="flex justify-between items-center">
            <div className="text-xs text-text-dim">
              {totalFields - completedFields} campos obrigatórios restantes
            </div>
            {onConfirmReady && status !== 'READY' && completedFields === totalFields && (
              <Button
                onClick={onConfirmReady}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Confirmar Ideia Base
              </Button>
            )}
            {status === 'READY' && (
              <div className="flex items-center gap-2 text-success">
                <span className="text-success">✓</span>
                <span className="text-xs font-medium">Ideia Base Confirmada</span>
              </div>
            )}
          </div>
        </CardFooter>
      </div>
    );
  }
);

IdeaBaseCard.displayName = 'IdeaBaseCard';

export { IdeaBaseCard };


