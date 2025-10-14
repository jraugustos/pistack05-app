import * as React from 'react';
import { Target, AlertTriangle, Lightbulb, Shield, Edit2 } from 'lucide-react';
import { CardBody, CardFooter } from '@/components/molecules';
import { Button } from '@/components/foundation';
import { Badge } from '@/components/foundation';
import { EditFieldModal } from '@/components/molecules/EditFieldModal';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

import type { Card, IdeaEnricherFields } from '@/types';

export interface IdeaEnricherCardProps {
  card: Card;
  onUpdate?: (fields: IdeaEnricherFields) => void;
  onGenerate?: (field: keyof IdeaEnricherFields, mode: 'generate' | 'expand' | 'review') => void;
  onConfirmReady?: () => void;
  className?: string;
}

const IdeaEnricherCard = React.forwardRef<HTMLDivElement, IdeaEnricherCardProps>(
  ({ card, onUpdate, onGenerate, onConfirmReady, className }, ref) => {
    const [editingField, setEditingField] = React.useState<keyof IdeaEnricherFields | null>(null);

    const fields: IdeaEnricherFields = {
      whatWeWantToCreate: card.fields?.whatWeWantToCreate || '',
      problemSolved: card.fields?.problemSolved || '',
      proposedSolution: card.fields?.proposedSolution || '',
      constraintsAssumptions: card.fields?.constraintsAssumptions || '',
    };

    const status = card.status;

    // Campos obrigatórios
    const requiredFields: (keyof IdeaEnricherFields)[] = [
      'whatWeWantToCreate',
      'problemSolved',
      'proposedSolution'
    ];

    // Verificar se todos os campos obrigatórios estão preenchidos
    const allRequiredFilled = requiredFields.every(field => {
      const value = fields[field];
      return value && typeof value === 'string' && value.trim().length > 0;
    });

    // Configuração dos campos
    const fieldConfigs = [
      {
        key: 'whatWeWantToCreate' as const,
        label: 'O que queremos criar',
        placeholder: 'Descreva claramente o que você quer construir, desenvolver ou criar...',
        icon: <Lightbulb className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'problemSolved' as const,
        label: 'Problema/Dor que resolve',
        placeholder: 'Qual problema específico sua ideia resolve? Que dor ela alivia?',
        icon: <AlertTriangle className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'proposedSolution' as const,
        label: 'Solução Proposta',
        placeholder: 'Como sua ideia resolve o problema? Qual é a abordagem?',
        icon: <Target className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'constraintsAssumptions' as const,
        label: 'Restrições e Suposições',
        placeholder: 'Quais limitações existem? Que suposições estamos fazendo?',
        icon: <Shield className="h-4 w-4" />,
        required: false,
      },
    ];

    const handleFieldSave = (fieldKey: keyof IdeaEnricherFields, value: string) => {
      if (onUpdate) {
        onUpdate({
          ...fields,
          [fieldKey]: value,
        });
      }
    };

    const currentEditingConfig = fieldConfigs.find(f => f.key === editingField);

    return (
      <>
        <div
          ref={ref}
          className={cn(
            'secondary-card',
            'bg-bg-elev rounded-lg overflow-hidden',
            'border border-stroke/30',
            'transition-all duration-200',
            className
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-stroke bg-gradient-to-r from-info/10 to-transparent">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0 text-info">
                <Target className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-text">Enriquecimento da Ideia</h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={status === 'READY' ? 'success' : 'draft'} className="capitalize">
                    {status === 'READY' ? 'ready' : 'draft'}
                  </Badge>
                </div>
              </div>
            </div>
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
              {/* Campos em modo exibição */}
              <div className="space-y-4">
                {fieldConfigs.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium text-text">
                        {field.icon}
                        {field.label}
                        {field.required && <span className="text-danger">*</span>}
                      </label>
                      <div className="flex items-center gap-2">
                        {onGenerate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onGenerate(field.key, 'generate')}
                            className="h-6 px-2 text-xs"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            IA
                          </Button>
                        )}
                        <button
                          onClick={() => setEditingField(field.key)}
                          className="text-text-dim hover:text-primary transition-colors p-1"
                          title="Editar campo"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {/* Exibição do texto */}
                    <div
                      className="min-h-[72px] p-3 rounded-md bg-bg border border-stroke/30 text-sm text-text cursor-pointer hover:border-stroke/50 hover:bg-bg-elev transition-all"
                      onClick={() => setEditingField(field.key)}
                    >
                      {fields[field.key] || (
                        <span className="text-muted italic">{field.placeholder}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>

          <CardFooter>
            <div className="flex justify-between items-center">
              <div className="text-xs text-text-dim">
                {requiredFields.length - requiredFields.filter(field => {
                  const value = fields[field];
                  return value && typeof value === 'string' && value.trim().length > 0;
                }).length} campos obrigatórios restantes
              </div>
              {onConfirmReady && (
                <Button
                  onClick={onConfirmReady}
                  disabled={!allRequiredFilled || status === 'READY'}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  {status === 'READY' ? (
                    <>
                      <span className="text-success">✓</span>
                      Confirmado
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      Confirmar como READY
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </div>

        {/* Modal de Edição */}
        {editingField && currentEditingConfig && (
          <EditFieldModal
            isOpen={true}
            onClose={() => setEditingField(null)}
            onSave={(value) => handleFieldSave(editingField, value)}
            fieldLabel={currentEditingConfig.label}
            fieldValue={fields[editingField]}
            placeholder={currentEditingConfig.placeholder}
            icon={currentEditingConfig.icon}
          />
        )}
      </>
    );
  }
);

IdeaEnricherCard.displayName = 'IdeaEnricherCard';

export { IdeaEnricherCard };
