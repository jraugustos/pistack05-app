import * as React from 'react';
import { Palette, Type, Layout, Sparkles, Eye, Accessibility, Smartphone, Edit2 } from 'lucide-react';
import { CardBody, CardFooter } from '@/components/molecules';
import { Button } from '@/components/foundation';
import { Badge } from '@/components/foundation';
import { EditFieldModal } from '@/components/molecules/EditFieldModal';
import { cn } from '@/lib/utils';

import type { Card, DesignInterfaceFields } from '@/types';

export interface DesignInterfaceCardProps {
  card: Card;
  onUpdate?: (fields: DesignInterfaceFields) => void;
  onGenerate?: (field: keyof DesignInterfaceFields, mode: 'generate' | 'expand' | 'review') => void;
  onConfirmReady?: () => void;
  className?: string;
}

const DesignInterfaceCard = React.forwardRef<HTMLDivElement, DesignInterfaceCardProps>(
  ({ card, onUpdate, onGenerate, onConfirmReady, className }, ref) => {
    const [editingField, setEditingField] = React.useState<keyof DesignInterfaceFields | null>(null);

    const fields: DesignInterfaceFields = {
      styleGuide: card.fields?.styleGuide || '',
      colorPalette: card.fields?.colorPalette || [],
      typography: card.fields?.typography || {},
      componentLibrary: card.fields?.componentLibrary || '',
      designSystem: card.fields?.designSystem || '',
      accessibility: card.fields?.accessibility || '',
      responsiveness: card.fields?.responsiveness || '',
      inspiration: card.fields?.inspiration || [],
      layoutGuidelines: card.fields?.layoutGuidelines || '',
      interactions: card.fields?.interactions || '',
    };

    const status = card.status;

    // Campos obrigatórios para o card de Interface
    const requiredFields: (keyof DesignInterfaceFields)[] = [
      'styleGuide',
      'designSystem',
      'responsiveness'
    ];

    // Verificar se todos os campos obrigatórios estão preenchidos
    const allRequiredFilled = requiredFields.every(field => {
      const value = fields[field];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0;
      }
      return value && typeof value === 'string' && value.trim().length > 0;
    });

    // Configuração dos campos
    const fieldConfigs = [
      {
        key: 'styleGuide' as const,
        label: 'Guia de Estilo',
        placeholder: 'Descreva o estilo visual geral: moderno, minimalista, bold, corporativo, etc...',
        icon: <Eye className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'colorPalette' as const,
        label: 'Paleta de Cores',
        placeholder: 'Liste as cores principais (ex: #3B82F6, #10B981, #F59E0B). Digite cores separadas por vírgula...',
        icon: <Palette className="h-4 w-4" />,
        required: false,
        isArray: true,
      },
      {
        key: 'typography' as const,
        label: 'Tipografia',
        placeholder: 'Defina fonts, tamanhos, pesos. Ex: "Headings: Inter Bold 24-48px, Body: Inter Regular 14-16px"...',
        icon: <Type className="h-4 w-4" />,
        required: false,
        isObject: true,
      },
      {
        key: 'componentLibrary' as const,
        label: 'Biblioteca de Componentes',
        placeholder: 'Sugira biblioteca: Shadcn/ui, Material-UI, Ant Design, Chakra UI, ou Custom...',
        icon: <Layout className="h-4 w-4" />,
        required: false,
      },
      {
        key: 'designSystem' as const,
        label: 'Sistema de Design',
        placeholder: 'Qual sistema de design seguir? Material Design, Fluent, Apple HIG, Custom...',
        icon: <Layout className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'accessibility' as const,
        label: 'Acessibilidade',
        placeholder: 'Diretrizes de acessibilidade: WCAG 2.1 AA, contraste, navegação por teclado, screen readers...',
        icon: <Accessibility className="h-4 w-4" />,
        required: false,
      },
      {
        key: 'responsiveness' as const,
        label: 'Responsividade',
        placeholder: 'Estratégia responsive: Mobile-first, Desktop-first, breakpoints, adaptive vs fluid...',
        icon: <Smartphone className="h-4 w-4" />,
        required: true,
      },
      {
        key: 'inspiration' as const,
        label: 'Inspirações',
        placeholder: 'URLs ou nomes de sites/apps de referência. Digite separados por vírgula...',
        icon: <Sparkles className="h-4 w-4" />,
        required: false,
        isArray: true,
      },
      {
        key: 'layoutGuidelines' as const,
        label: 'Diretrizes de Layout',
        placeholder: 'Grids, espaçamentos, margens: ex. Grid 12 colunas, gap 16px, max-width 1200px...',
        icon: <Layout className="h-4 w-4" />,
        required: false,
      },
      {
        key: 'interactions' as const,
        label: 'Interações e Animações',
        placeholder: 'Micro-interações, transições, hover states, loading states, animations...',
        icon: <Sparkles className="h-4 w-4" />,
        required: false,
      },
    ];

    const handleFieldSave = (fieldKey: keyof DesignInterfaceFields, value: string) => {
      if (onUpdate) {
        const config = fieldConfigs.find(f => f.key === fieldKey);

        // Se for array, parsear por vírgula
        if (config?.isArray) {
          const arrayValue = value.split(',').map(v => v.trim()).filter(v => v.length > 0);
          onUpdate({
            ...fields,
            [fieldKey]: arrayValue,
          });
        }
        // Se for object, tentar parsear JSON ou salvar como string
        else if (config?.isObject) {
          try {
            const objValue = JSON.parse(value);
            onUpdate({
              ...fields,
              [fieldKey]: objValue,
            });
          } catch {
            // Se não for JSON válido, salvar como string mesmo
            onUpdate({
              ...fields,
              [fieldKey]: value,
            });
          }
        }
        // String normal
        else {
          onUpdate({
            ...fields,
            [fieldKey]: value,
          });
        }
      }
    };

    const currentEditingConfig = fieldConfigs.find(f => f.key === editingField);

    // Função para renderizar valor de campo (array, object, string)
    const renderFieldValue = (key: keyof DesignInterfaceFields) => {
      const value = fields[key];

      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : null;
      }

      if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
        return JSON.stringify(value, null, 2);
      }

      return value || null;
    };

    // Função para obter valor inicial do modal de edição
    const getEditFieldValue = (key: keyof DesignInterfaceFields): string => {
      const value = fields[key];

      if (Array.isArray(value)) {
        return value.join(', ');
      }

      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2);
      }

      return value || '';
    };

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
          <div className="flex items-center justify-between p-4 border-b border-stroke bg-gradient-to-r from-pink-500/10 to-transparent">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0 text-pink-500">
                <Palette className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-text">Interface e Design</h3>
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
                        : 'Preencha os campos obrigatórios'
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
                      className="min-h-[72px] p-3 rounded-md bg-bg border border-stroke/30 text-sm cursor-pointer hover:border-stroke/50 hover:bg-bg-elev transition-all whitespace-pre-wrap"
                      onClick={() => setEditingField(field.key)}
                    >
                      {renderFieldValue(field.key) ? (
                        <span className="text-text">{renderFieldValue(field.key)}</span>
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
                  if (Array.isArray(value)) return value.length > 0;
                  if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
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
                      <Palette className="h-4 w-4" />
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
            fieldValue={getEditFieldValue(editingField)}
            placeholder={currentEditingConfig.placeholder}
            icon={currentEditingConfig.icon}
          />
        )}
      </>
    );
  }
);

DesignInterfaceCard.displayName = 'DesignInterfaceCard';

export { DesignInterfaceCard };
