import * as React from 'react';
import { Brain, Search, BarChart3, Users, TrendingUp } from 'lucide-react';
import { CardHeader, CardBody, CardFooter } from '@/components/molecules';
import { Button } from '@/components/foundation';
import { Textarea } from '@/components/foundation';
import { Badge } from '@/components/foundation';
import { Input } from '@/components/foundation';
import { cn } from '@/lib/utils';

export interface UnderstandingCardProps {
  understanding: {
    marketResearch: string;
    competitors: string;
    userPersonas: string;
    marketSize: string;
    trends: string;
    opportunities: string;
  };
  status: 'DRAFT' | 'READY';
  onUpdate: (field: keyof UnderstandingCardProps['understanding'], value: string) => void;
  onAIGenerate: (field: keyof UnderstandingCardProps['understanding']) => void;
  onMenuAction?: (action: 'duplicate' | 'delete' | 'link') => void;
  className?: string;
}

const UnderstandingCard = React.forwardRef<HTMLDivElement, UnderstandingCardProps>(
  ({ understanding, status, onUpdate, onAIGenerate, onMenuAction, className }, ref) => {
    const fields = [
      {
        key: 'marketResearch' as const,
        label: 'Pesquisa de Mercado',
        placeholder: 'Descreva o mercado atual, tendências e oportunidades...',
        icon: <Search className="h-4 w-4" />,
        required: true,
        type: 'textarea' as const,
      },
      {
        key: 'competitors' as const,
        label: 'Análise de Concorrentes',
        placeholder: 'Liste os principais concorrentes e suas características...',
        icon: <BarChart3 className="h-4 w-4" />,
        required: true,
        type: 'textarea' as const,
      },
      {
        key: 'userPersonas' as const,
        label: 'Personas do Usuário',
        placeholder: 'Descreva as personas principais do seu público...',
        icon: <Users className="h-4 w-4" />,
        required: true,
        type: 'textarea' as const,
      },
      {
        key: 'marketSize' as const,
        label: 'Tamanho do Mercado',
        placeholder: 'Estime o tamanho do mercado (TAM, SAM, SOM)...',
        icon: <TrendingUp className="h-4 w-4" />,
        required: false,
        type: 'input' as const,
      },
      {
        key: 'trends' as const,
        label: 'Tendências do Setor',
        placeholder: 'Identifique as principais tendências que afetam seu negócio...',
        icon: <TrendingUp className="h-4 w-4" />,
        required: false,
        type: 'textarea' as const,
      },
      {
        key: 'opportunities' as const,
        label: 'Oportunidades Identificadas',
        placeholder: 'Liste as oportunidades de mercado identificadas...',
        icon: <Brain className="h-4 w-4" />,
        required: false,
        type: 'textarea' as const,
      },
    ];

    const completedFields = fields.filter(field => understanding[field.key]?.trim()).length;
    const totalFields = fields.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-elev border border-stroke rounded-lg overflow-hidden',
          'hover:border-info/50 transition-all duration-200',
          className
        )}
      >
        <CardHeader
          icon={<Brain className="h-5 w-5" />}
          title="Entendimento do Mercado"
          status={status}
          stageKey="entendimento"
          onMenuAction={onMenuAction}
        />

        <CardBody>
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">Análise Completa</span>
                <Badge variant={completionPercentage === 100 ? 'success' : 'info'}>
                  {completionPercentage}%
                </Badge>
              </div>
              <div className="text-xs text-text-dim">
                {completedFields} de {totalFields} análises
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
                      <Brain className="h-3 w-3 mr-1" />
                      IA
                    </Button>
                  </div>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={understanding[field.key] || ''}
                      onChange={(e) => onUpdate(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="resize-none"
                    />
                  ) : (
                    <Input
                      value={understanding[field.key] || ''}
                      onChange={(e) => onUpdate(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Insights Summary */}
            {(understanding.marketResearch || understanding.competitors) && (
              <div className="p-3 bg-info/5 border border-info/20 rounded-md">
                <h4 className="text-sm font-medium text-info mb-1">Insights Principais</h4>
                <p className="text-sm text-text-dim">
                  {understanding.marketResearch?.slice(0, 150)}
                  {understanding.marketResearch && understanding.marketResearch.length > 150 && '...'}
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

UnderstandingCard.displayName = 'UnderstandingCard';

export { UnderstandingCard };


