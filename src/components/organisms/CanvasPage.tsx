'use client';

import * as React from 'react';
import { Button, Badge } from '@/components/foundation';
import { AIPanel, ProgressDrawer } from '@/components/molecules';
import { OutputsModal } from '@/components/organisms/OutputsModal';
import { ReactFlowCanvas } from '@/components/canvas/ReactFlowCanvas';
import { useCards } from '@/hooks/useCards';
import { useCardsStore } from '@/lib/stores/useCardsStore';
import { TelemetryService } from '@/lib/services/TelemetryService';
import { GraphService } from '@/lib/services/GraphService';
import { toast } from '@/lib/stores/useToastStore';
import { getCascadePosition } from '@/lib/utils/reactFlowAdapters';
import { 
  Download, 
  Share2,
  ArrowLeft,
  Eye
} from 'lucide-react';
import type { Project, Card, Edge } from '@/types';

export interface CanvasPageProps {
  projectId: string;
  project: Project;
  cards?: Card[];
  edges?: Edge[];
  isLoading?: boolean;
  onboarding?: boolean;
}

const CanvasPage = React.forwardRef<HTMLDivElement, CanvasPageProps>(
  ({ projectId, project, cards: initialCards = [], edges: initialEdges = [], onboarding = false }, ref) => {
    // Store e API
    const {
      cards,
      loading,
      error,
      loadCards,
      createCard,
      updateCard,
      deleteCard,
      generateAI,
      confirmReady,
      getCardsByStage,
      getReadyCount,
    } = useCards(projectId);

    // UI State
    const [progressOpen, setProgressOpen] = React.useState(false);
    const [outputsOpen, setOutputsOpen] = React.useState(false);
    const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
    const [aiMode, setAiMode] = React.useState<'generate' | 'expand' | 'review'>('generate');
    const [aiLoading, setAiLoading] = React.useState(false);
    const [aiDiff, setAiDiff] = React.useState<any>(null);
    
    // Edges state
    const [edges, setEdges] = React.useState<Edge[]>(initialEdges);

    // Inicializar cards do SSR
    React.useEffect(() => {
      console.log('[CanvasPage] Inicializando com cards:', { 
        initialCards: initialCards?.length, 
        projectId 
      });
      
      if (initialCards && initialCards.length > 0) {
        console.log('[CanvasPage] Usando cards do SSR:', initialCards);
        useCardsStore.getState().setCards(initialCards);
      } else {
        console.log('[CanvasPage] Carregando cards da API...');
        loadCards();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // Atualizar edges quando initialEdges mudar
    React.useEffect(() => {
      setEdges(initialEdges);
    }, [initialEdges]);

    // Handlers para cards
    const handleChecklistCreate = async (target: { stageKey: string; typeKey: string }) => {
      try {
        TelemetryService.checklistClickStage(target.stageKey, target.typeKey, { projectId });
        
        // Calcular posição em cascade
        const position = getCascadePosition(
          cards.map(c => ({
            id: c.id,
            position: c.position || { x: 80, y: 80 },
            style: { 
              width: c.size?.width || 360, 
              minHeight: c.size?.height || 240 
            }
          } as any))
        );
        
        const newCard = await createCard({
          stage_key: target.stageKey,
          type_key: target.typeKey,
          title: target.typeKey === 'scope.features' ? 'Funcionalidades' : 'Stack Tecnológico',
          summary: '',
          fields: {},
          x: position.x,
          y: position.y,
          w: 360,
          h: 240,
        });

        // Auto-conectar ao Ideia Base
        const ideaBaseCard = cards.find(c => c.typeKey === 'idea.base');
        if (ideaBaseCard && newCard) {
          await handleCreateEdge(ideaBaseCard.id, newCard.id);
        }

        TelemetryService.cardGenerated(target.typeKey, { projectId, cardId: newCard?.id });
      } catch (err) {
        console.error('Failed to create card:', err);
        toast.error('Erro ao criar card');
      }
    };

    const handleCardUpdate = async (cardId: string, fields: any) => {
      try {
        await updateCard(cardId, { fields });
        toast.success('Card atualizado');
      } catch (err) {
        console.error('Failed to update card:', err);
        toast.error('Erro ao atualizar card');
      }
    };

    const handleCardDelete = async (cardId: string) => {
      try {
        await deleteCard(cardId);
        // Remover edges relacionadas
        setEdges(prev => prev.filter(e => e.sourceCardId !== cardId && e.targetCardId !== cardId));
        toast.success('Card excluído');
      } catch (err) {
        console.error('Failed to delete card:', err);
        toast.error('Erro ao excluir card');
      }
    };

    const handleCardGenerate = async (cardId: string, mode: 'generate' | 'expand' | 'review') => {
      try {
        setAiMode(mode);
        setAiLoading(true);
        const diff = await generateAI(cardId, mode);
        setAiDiff(diff);
        setSelectedCardId(cardId);
      } catch (err) {
        console.error('Failed to generate AI:', err);
        toast.error('Erro ao gerar conteúdo');
      } finally {
        setAiLoading(false);
      }
    };

    const handleCardConfirmReady = async (cardId: string) => {
      try {
        await confirmReady(cardId);
        toast.success('Card confirmado como READY 🎉');
        TelemetryService.cardConfirmed(cardId, { projectId });
      } catch (err) {
        console.error('Failed to confirm card:', err);
        toast.error('Erro ao confirmar card');
      }
    };

    const handleNodePositionChange = async (cardId: string, x: number, y: number) => {
      try {
        await updateCard(cardId, { position: { x, y } });
      } catch (err) {
        console.error('Failed to update card position:', err);
      }
    };

    // Handlers para edges
    const handleCreateEdge = async (sourceId: string, targetId: string) => {
      try {
        // Verificar se edge já existe localmente
        const existingEdge = edges.find(
          e => e.sourceCardId === sourceId && e.targetCardId === targetId
        );
        if (existingEdge) {
          throw new Error('Conexão já existe');
        }

        const response = await fetch('/api/edges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            source_card_id: sourceId,
            target_card_id: targetId,
          }),
        });

        if (response.status === 409) {
          throw new Error('Conexão já existe');
        }

        if (!response.ok) {
          throw new Error('Failed to create edge');
        }

        const { edge } = await response.json();
        setEdges(prev => [...prev, edge]);
      } catch (error: any) {
        throw error;
      }
    };

    const handleDeleteEdge = async (edgeId: string) => {
      try {
        const response = await fetch(`/api/edges/${edgeId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete edge');
        }
      } catch (error) {
        throw error;
      }
    };

    // AIPanel handlers
    const handleAIApply = async () => {
      if (!selectedCardId || !aiDiff) return;

      try {
        await updateCard(selectedCardId, { fields: aiDiff });
        setAiDiff(null);
        toast.success('Alterações aplicadas! ✅');
      } catch (err) {
        console.error('Failed to apply AI changes:', err);
        toast.error('Erro ao aplicar alterações');
      }
    };

    const handleAIClose = () => {
      setAiDiff(null);
      setSelectedCardId(null);
    };

    // Outputs
    const handleGenerateOutput = async (type: 'workplan' | 'prd' | 'promptpack') => {
      try {
        TelemetryService.outputGenerated(type, { projectId });
        toast.info('Gerando output...');
        
        // TODO: implementar geração real
        setTimeout(() => {
          toast.success('Output gerado! 🎉');
        }, 2000);
      } catch (err) {
        console.error('Failed to generate output:', err);
        toast.error('Erro ao gerar output');
      }
    };

    const readyCount = getReadyCount();
    const workPlanEnabled = readyCount >= 2;

    return (
      <div ref={ref} className="h-screen flex flex-col bg-bg">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-stroke bg-bg-soft">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          <div>
            <h1 className="text-lg font-semibold text-text">{project.name}</h1>
            <div className="text-sm text-text-dim flex items-center gap-2">
              <Badge variant="secondary">{project.status}</Badge>
              <span>Canvas Livre</span>
            </div>
          </div>
          </div>

          <div className="flex items-center gap-2">
            {onboarding && (
              <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm animate-pulse">
                💡 Arraste cards, conecte-os pelas alças laterais!
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setProgressOpen(true)}
              title="Ver progresso"
            >
              <Eye className="w-5 h-5" />
            </Button>

            <Button
              variant="default"
              onClick={() => setOutputsOpen(true)}
              disabled={!workPlanEnabled}
              title={workPlanEnabled ? 'Gerar Work Plan' : 'Precisa de 2+ cards READY'}
            >
              📋 Work Plan {workPlanEnabled && '✅'}
            </Button>

            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon">
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Canvas + AIPanel */}
        <div className="flex-1 flex overflow-hidden">
          {/* React Flow Canvas */}
          <div className="flex-1 relative">
            <ReactFlowCanvas
              projectId={projectId}
              initialCards={cards}
              initialEdges={edges}
              onCardUpdate={handleCardUpdate}
              onCardDelete={handleCardDelete}
              onCardGenerate={handleCardGenerate}
              onCardConfirmReady={handleCardConfirmReady}
              onChecklistClick={handleChecklistCreate}
              onCreateEdge={handleCreateEdge}
              onDeleteEdge={handleDeleteEdge}
              onNodePositionChange={handleNodePositionChange}
            />
          </div>

          {/* AIPanel (sempre visível, mas pode estar em idle) */}
          <div className="w-80 lg:w-96 border-l border-stroke bg-bg-soft">
            <AIPanel
              mode={aiMode}
              loading={aiLoading}
              prompt=""
              diff={aiDiff}
              onModeChange={setAiMode}
              onApply={handleAIApply}
              onClose={handleAIClose}
            />
          </div>
        </div>

        {/* Modals */}
        {progressOpen && (
          <ProgressDrawer
            open={progressOpen}
            onOpenChange={setProgressOpen}
            cards={cards}
          />
        )}

        {outputsOpen && (
          <OutputsModal
            open={outputsOpen}
            onOpenChange={setOutputsOpen}
            outputs={[]}
            onRegenerate={handleGenerateOutput}
          />
        )}
      </div>
    );
  }
);

CanvasPage.displayName = 'CanvasPage';

export { CanvasPage };
