import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/foundation';
import { Modal } from '@/components/foundation';
import { 
  Download, 
  Copy, 
  RefreshCw, 
  FileText, 
  Code, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { Project, Output } from '@/types';

export interface OutputsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  outputs: Output[];
  isLoading?: boolean;
  activeTab: 'prd' | 'prompt-pack' | 'work-plan';
  onTabChange: (tab: OutputsModalProps['activeTab']) => void;
  onRegenerate: (type: OutputsModalProps['activeTab']) => void;
  onDownload: (type: OutputsModalProps['activeTab']) => void;
  onCopy: (type: OutputsModalProps['activeTab']) => void;
}

const OutputsModal = React.forwardRef<HTMLDivElement, OutputsModalProps>(
  (
    {
      isOpen,
      onClose,
      project,
      outputs,
      isLoading = false,
      activeTab,
      onTabChange,
      onRegenerate,
      onDownload,
      onCopy,
      ...props
    },
    ref
  ) => {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleRegenerate = async (type: OutputsModalProps['activeTab']) => {
      setIsGenerating(true);
      try {
        await onRegenerate(type);
      } finally {
        setIsGenerating(false);
      }
    };

    const getOutputByType = (type: OutputsModalProps['activeTab']) => {
      return outputs.find(output => output.type === type);
    };

    const getOutputStatus = (type: OutputsModalProps['activeTab']) => {
      const output = getOutputByType(type);
      if (!output) return 'missing';
      if (output.status === 'generating') return 'generating';
      if (output.status === 'ready') return 'ready';
      return 'draft';
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'ready':
          return <CheckCircle className="h-4 w-4 text-success" />;
        case 'generating':
          return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
        case 'draft':
          return <Clock className="h-4 w-4 text-warning" />;
        default:
          return <AlertCircle className="h-4 w-4 text-text-dim" />;
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'ready':
          return 'Pronto';
        case 'generating':
          return 'Gerando...';
        case 'draft':
          return 'Rascunho';
        default:
          return 'Não gerado';
      }
    };

    const tabs = [
      {
        id: 'prd' as const,
        label: 'PRD',
        icon: <FileText className="h-4 w-4" />,
        description: 'Product Requirements Document'
      },
      {
        id: 'prompt-pack' as const,
        label: 'Prompt Pack',
        icon: <Code className="h-4 w-4" />,
        description: 'Conjunto de prompts para desenvolvimento'
      },
      {
        id: 'work-plan' as const,
        label: 'Work Plan',
        icon: <Calendar className="h-4 w-4" />,
        description: 'Plano de trabalho detalhado'
      }
    ];

    return (
      <Modal
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        title={`Outputs - ${project.name}`}
        className="max-w-4xl"
        {...props}
      >
        <div className="space-y-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => {
                const status = getOutputStatus(tab.id);
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2"
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <Badge 
                      status={status === 'ready' ? 'ready' : 'draft'}
                      className="ml-2"
                    >
                      {getStatusText(status)}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabs.map((tab) => {
              const output = getOutputByType(tab.id);
              const status = getOutputStatus(tab.id);
              
              return (
                <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                        {tab.icon}
                        {tab.label}
                      </h3>
                      <p className="text-sm text-text-dim">{tab.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-sm text-text-dim">
                        {getStatusText(status)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRegenerate(tab.id)}
                      disabled={isGenerating || status === 'generating'}
                      className="gap-2"
                    >
                      <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                      {status === 'generating' ? 'Gerando...' : 'Regenerar'}
                    </Button>
                    
                    {status === 'ready' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onCopy(tab.id)}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copiar
                        </Button>
                        
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onDownload(tab.id)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="border border-stroke rounded-lg bg-bg-elev">
                    {status === 'generating' ? (
                      <div className="p-8 text-center">
                        <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-text-dim">Gerando {tab.label.toLowerCase()}...</p>
                      </div>
                    ) : status === 'ready' && output ? (
                      <div className="p-6">
                        <div className="prose prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-sm text-text">
                            {output.content}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <AlertCircle className="h-8 w-8 text-text-dim mx-auto mb-4" />
                        <p className="text-text-dim mb-4">
                          {tab.label} ainda não foi gerado
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRegenerate(tab.id)}
                          disabled={isGenerating}
                        >
                          Gerar {tab.label}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  {output && (
                    <div className="text-xs text-text-dim space-y-1">
                      <p>Criado em: {new Date(output.createdAt).toLocaleString('pt-BR')}</p>
                      {output.updatedAt && (
                        <p>Atualizado em: {new Date(output.updatedAt).toLocaleString('pt-BR')}</p>
                      )}
                      <p>Tamanho: {output.content?.length || 0} caracteres</p>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </Modal>
    );
  }
);

OutputsModal.displayName = 'OutputsModal';

export { OutputsModal };


