import * as React from 'react';
import { Users, TrendingUp, Heart, Brain, MapPin, Activity, Edit2 } from 'lucide-react';
import { CardBody, CardFooter } from '@/components/molecules';
import { Button } from '@/components/foundation';
import { Badge } from '@/components/foundation';
import { EditFieldModal } from '@/components/molecules/EditFieldModal';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

import type { Card, TargetAudienceFields } from '@/types';

export interface TargetAudienceCardProps {
  card: Card;
  onUpdate?: (fields: TargetAudienceFields) => void;
  onGenerate?: (field: keyof TargetAudienceFields, mode: 'generate' | 'expand' | 'review') => void;
  onConfirmReady?: () => void;
  className?: string;
}

const TargetAudienceCard = React.forwardRef<HTMLDivElement, TargetAudienceCardProps>(
  ({ card, onUpdate, onGenerate, onConfirmReady, className }, ref) => {
    const [editingField, setEditingField] = React.useState<keyof TargetAudienceFields | null>(null);

    const fields: TargetAudienceFields = {
      primaryAudience: card.fields?.primaryAudience || '',
      secondaryAudience: card.fields?.secondaryAudience || '',
      demographics: card.fields?.demographics || '',
      psychographics: card.fields?.psychographics || '',
      painPoints: card.fields?.painPoints || '',
      behaviors: card.fields?.behaviors || '',
    };

    const status = card.status;

    // Campos obrigatórios
    const requiredFields: (keyof TargetAudienceFields)[] = [
      'primaryAudience',
      'demographics',
      'psychographics',
      'painPoints'
    ];

    // Verificar se todos os campos obrigatórios estão preenchidos
    const allRequiredFilled = requiredFields.every(field => {
      const value = fields[field];
      return value && typeof value === 'string' && value.trim().length > 0;
    });

    // Configuração dos campos
    const fieldConfigs = [
      {
        key: 'primaryAudience' as const,
        label: 'Público Principal',
        placeholder: 'Quem é o público-alvo principal? Descreva de forma clara e específica...',
        icon: <Users className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'secondaryAudience' as const,
        label: 'Público Secundário',
        placeholder: 'Existe algum público secundário? Usuários indiretos ou influenciadores...',
        icon: <TrendingUp className="h-4 w-4" />,
        required: false,
      },
      {
        key: 'demographics' as const,
        label: 'Demografia',
        placeholder: 'Idade, localização, renda, educação, ocupação, gênero, etc...',
        icon: <MapPin className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'psychographics' as const,
        label: 'Psicografia',
        placeholder: 'Interesses, valores, estilo de vida, personalidade, atitudes...',
        icon: <Brain className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'painPoints' as const,
        label: 'Dores e Necessidades',
        placeholder: 'Quais são as principais dores, problemas e necessidades deste público?',
        icon: <Heart className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'behaviors' as const,
        label: 'Comportamentos e Hábitos',
        placeholder: 'Como se comportam? Que hábitos têm? Como tomam decisões?',
        icon: <Activity className="h-4 w-4" />,
        required: false,
      },
    ];

    const handleFieldSave = (fieldKey: keyof TargetAudienceFields, value: string) => {
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
          <div className="flex items-center justify-between p-4 border-b border-stroke bg-gradient-to-r from-purple-500/10 to-transparent">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0 text-purple-500">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-text">Público-Alvo</h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => {
                      if (onConfirmReady && allRequiredFilled) {
                        onConfirmReady();
                      }
                    }}
                    disabled={!allRequiredFilled && status !== 'READY'}
                    className={cn(
                      'transition-all',
                      allRequiredFilled || status === 'READY' ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'
                    )}
                    title={
                      status === 'READY'
                        ? 'Clique para voltar para DRAFT'
                        : allRequiredFilled
                        ? 'Clique para marcar como READY'
                        : 'Preencha os campos obrigatórios para marcar como READY'
                    }
                  >
                    <Badge variant={status === 'READY' ? 'success' : 'draft'} className="capitalize">
                      {status === 'READY' ? 'ready' : 'draft'}
                    </Badge>
                  </button>
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
                      className="min-h-[72px] p-3 rounded-md bg-bg border border-stroke/30 text-sm cursor-pointer hover:border-stroke/50 hover:bg-bg-elev transition-all"
                      onClick={() => setEditingField(field.key)}
                    >
                      {fields[field.key] ? (
                        <span className="text-text">{fields[field.key]}</span>
                      ) : (
                        <span className="text-text-dim">{field.placeholder}</span>
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
                      <Users className="h-4 w-4" />
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

TargetAudienceCard.displayName = 'TargetAudienceCard';

export { TargetAudienceCard };
