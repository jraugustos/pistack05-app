'use client';

import * as React from 'react';
import Draggable from 'react-draggable';
import { cn } from '@/lib/utils';
import { Button, Badge } from '@/components/foundation';
import { AIPanel, ProgressDrawer } from '@/components/molecules';
import { OutputsModal } from '@/components/organisms/OutputsModal';
import { IdeaBaseCard, ScopeFeaturesCard, TechStackCard } from '@/components/cards';
import { CanvasViewport } from '@/components/canvas/CanvasViewport';
import { useCards } from '@/hooks/useCards';
import { useCardsStore } from '@/lib/stores/useCardsStore';
import { TelemetryService } from '@/lib/services/TelemetryService';
import { GraphService } from '@/lib/services/GraphService';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid3X3, 
  Magnet, 
  Download, 
  Share2,
  ArrowLeft,
  Eye,
  EyeOff,
  Hand
} from 'lucide-react';
import type { Project, Card } from '@/types';

export interface CanvasPageProps {
  projectId: string;
  project: Project;
  cards?: Card[];
  isLoading?: boolean;
  onboarding?: boolean;
}

// Componente auxiliar para card draggable com ref estável
interface DraggableCardProps {
  card: Card;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onDragStop: (cardId: string, x: number, y: number) => void;
  onDelete: (cardId: string) => void;
  renderCard: (card: Card) => React.ReactNode;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ card, position, size, onDragStop, onDelete, renderCard }) => {
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [showDelete, setShowDelete] = React.useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este card?')) {
      onDelete(card.id);
    }
  };

  // Não mostrar delete no Ideia Base
  const isIdeaBase = card.typeKey === 'idea.base';

  return (
    <Draggable
      defaultPosition={{ x: position.x, y: position.y }}
      onStop={(e, data) => onDragStop(card.id, data.x, data.y)}
      handle=".card-drag-handle"
      nodeRef={nodeRef}
    >
      <div
        ref={nodeRef}
        className="absolute bg-bg border border-stroke rounded-lg shadow-lg"
        style={{
          width: size.width,
          minHeight: size.height,
        }}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        {/* Adicionar handle de drag visível */}
        <div className="card-drag-handle absolute top-0 left-0 right-0 h-2 cursor-grab active:cursor-grabbing hover:bg-primary/20 transition-colors rounded-t-lg z-10" />
        
        {/* Botão de deletar (apenas cards gerados) */}
        {!isIdeaBase && showDelete && (
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md z-20 transition-all"
            title="Excluir card"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {renderCard(card)}
      </div>
    </Draggable>
  );
};

const CanvasPage = React.forwardRef<HTMLDivElement, CanvasPageProps>(
  ({ projectId, project, cards: initialCards = [], onboarding = false }, ref) => {
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
    const [showGrid, setShowGrid] = React.useState(true);
    const [snapToGrid, setSnapToGrid] = React.useState(false);
    const [panMode, setPanMode] = React.useState(false);
    const [progressOpen, setProgressOpen] = React.useState(false);
    const [outputsOpen, setOutputsOpen] = React.useState(false);
    const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
    const [aiMode, setAiMode] = React.useState<'generate' | 'expand' | 'review'>('generate');
    const [aiLoading, setAiLoading] = React.useState(false);
    const [aiDiff, setAiDiff] = React.useState<any>(null);
    
    // Viewport ref
    const viewportRef = React.useRef<any>(null);

    // Toggle pan mode
    const handleTogglePanMode = React.useCallback(() => {
      viewportRef.current?.togglePanMode();
      setPanMode(prev => !prev);
    }, []);

    // Inicializar cards do SSR e carregar layout
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

      // Carregar layout salvo
      GraphService.loadLayout(projectId).then((layout) => {
        if (layout && viewportRef.current) {
          viewportRef.current.setViewport(layout.viewport);
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // Autosave de layout
    const handleViewportChange = React.useCallback((viewport: { x: number; y: number; zoom: number }) => {
      GraphService.saveLayout(projectId, viewport, cards).catch(err => {
        console.error('Failed to save layout:', err);
      });
    }, [projectId, cards]);

    const handleCardDragStop = React.useCallback((cardId: string, x: number, y: number) => {
      updateCard(cardId, { 
        position: { x, y } 
      }).catch(err => {
        console.error('Failed to update card position:', err);
      });
    }, [updateCard]);

    // Handlers
    const handleChecklistCreate = async (target: { stageKey: string; typeKey: string }) => {
      try {
        TelemetryService.checklistClickStage(target.stageKey, target.typeKey, { projectId });
        
        // Calcular posição em cascade
        const position = GraphService.getCascadePosition(cards);
        
        await createCard({
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
      } catch (err) {
        console.error('Failed to create card:', err);
      }
    };

    const handleFitView = React.useCallback(() => {
      if (viewportRef.current && cards.length > 0) {
        const container = viewportRef.current;
        const viewport = GraphService.fitView(
          cards,
          container.clientWidth || 1200,
          container.clientHeight || 800
        );
        viewportRef.current.setViewport(viewport);
      }
    }, [cards]);

    const handleAIGenerate = async (cardId: string, mode: 'generate' | 'expand' | 'review', prompt?: string) => {
      setSelectedCardId(cardId);
      setAiMode(mode);
      setAiLoading(true);
      setAiDiff(null);
      try {
        const fields = await generateAI(cardId, mode, prompt);
        setAiDiff({ before: {}, after: fields });
        TelemetryService.cardGenerated(cardId, mode, { projectId });
      } catch (err) {
        console.error('AI generation failed:', err);
      } finally {
        setAiLoading(false);
      }
    };

    const handleAIApply = async () => {
      if (!selectedCardId || !aiDiff?.after) return;
      try {
        await updateCard(selectedCardId, { fields: aiDiff.after });
        setAiDiff(null);
        setSelectedCardId(null);
      } catch (err) {
        console.error('Failed to apply AI content:', err);
      }
    };

    const handleConfirmReady = async (cardId: string) => {
      try {
        const card = cards.find(c => c.id === cardId);
        await confirmReady(cardId);
        if (card) {
          TelemetryService.cardConfirmed(cardId, card.typeKey, { projectId });
        }
        const newReadyCount = getReadyCount();
        if (newReadyCount >= 2) {
          TelemetryService.workplanEnabled(newReadyCount, { projectId });
        }
      } catch (err) {
        console.error('Failed to confirm card:', err);
      }
    };

    const handleGenerateWorkPlan = async () => {
      try {
        const res = await fetch(`/api/outputs/work-plan?project_id=${projectId}`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to generate work plan');
        TelemetryService.outputGenerated('work-plan', { projectId });
        setOutputsOpen(true);
      } catch (err) {
        console.error('Work plan generation failed:', err);
      }
    };

    // Computed
    const readyCount = getReadyCount();

    // Renderizar card baseado no tipo
    const renderCard = (card: Card) => {
      switch (card.typeKey) {
        case 'idea.base':
          return (
            <IdeaBaseCard
              status={card.status as any}
              idea={card.fields || {}}
              onUpdate={(updates) => updateCard(card.id, { fields: updates })}
              onAIGenerate={(mode, prompt) => handleAIGenerate(card.id, mode, prompt)}
              onChecklistClick={handleChecklistCreate}
              onMenuAction={(action) => {
                if (action === 'confirm') handleConfirmReady(card.id);
              }}
            />
          );
        case 'scope.features':
          return (
            <ScopeFeaturesCard
              status={card.status as any}
              features={card.fields?.features || []}
              onUpdate={(updates) => updateCard(card.id, { fields: { ...card.fields, ...updates } })}
              onAIGenerate={(mode, prompt) => handleAIGenerate(card.id, mode, prompt)}
              onConfirm={() => handleConfirmReady(card.id)}
            />
          );
        case 'tech.stack':
          return (
            <TechStackCard
              status={card.status as any}
              stack={card.fields || {}}
              onUpdate={(updates) => updateCard(card.id, { fields: { ...card.fields, ...updates } })}
              onAIGenerate={(mode, prompt) => handleAIGenerate(card.id, mode, prompt)}
              onConfirm={() => handleConfirmReady(card.id)}
            />
          );
        default:
          return null;
      }
    };

    return (
      <div ref={ref} className="flex flex-col h-screen bg-bg">
        {/* Header */}
        <header className="border-b border-stroke bg-bg-soft/50 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-text">{project.name}</h1>
                <p className="text-sm text-text-muted">Canvas Livre</p>
              </div>
              <Badge variant="secondary">{project.status}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setProgressOpen(true)}>
                <Eye className="w-4 h-4" />
                Progresso
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleGenerateWorkPlan}
                disabled={readyCount < 2}
              >
                <Download className="w-4 h-4" />
                Work Plan
                {readyCount >= 2 && <Badge variant="success" className="ml-2">{readyCount} READY</Badge>}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="border-b border-stroke bg-bg px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant={panMode ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={handleTogglePanMode}
              title="Modo Pan (Espaço)"
            >
              <Hand className="w-4 h-4" />
              {panMode && <span className="ml-1.5">Pan</span>}
            </Button>
            <div className="w-px h-5 bg-stroke mx-1" />
            <Button variant="ghost" size="sm" onClick={() => viewportRef.current?.zoomOut()}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => viewportRef.current?.zoomIn()}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleFitView}>
              <Maximize2 className="w-4 h-4" />
              Ajustar Visualização
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={showGrid ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid3X3 className="w-4 h-4" />
              Grid
            </Button>
          </div>
        </div>

        {/* Onboarding hint */}
        {onboarding && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 max-w-2xl px-4">
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center backdrop-blur-sm">
              <p className="text-sm text-primary">
                Bem-vindo ao Canvas Livre! Pressione <kbd className="px-1.5 py-0.5 bg-primary/20 border border-primary/30 rounded text-xs font-mono mx-1">Espaço</kbd> 
                e arraste para navegar, ou use o botão <Hand className="inline w-3.5 h-3.5 mx-1" /> Mão no toolbar.
              </p>
            </div>
          </div>
        )}

        {/* Canvas Viewport */}
        <div className="flex-1">
          <CanvasViewport
            ref={viewportRef}
            showGrid={showGrid}
            onViewportChange={handleViewportChange}
          >
            {/* Renderizar todos os cards em posição absoluta */}
            {cards.map((card) => {
              // Garantir valores default se position/size não existirem
              const position = card.position || { x: 80, y: 80 };
              const size = card.size || { width: 360, height: 240 };
              
              return (
                <DraggableCard
                  key={card.id}
                  card={card}
                  position={position}
                  size={size}
                  onDragStop={handleCardDragStop}
                  onDelete={deleteCard}
                  renderCard={renderCard}
                />
              );
            })}
          </CanvasViewport>
        </div>

        {/* AI Panel */}
        {selectedCardId && (
          <AIPanel
            mode={aiMode}
            loading={aiLoading}
            prompt=""
            diff={aiDiff}
            onModeChange={setAiMode}
            onApply={handleAIApply}
            onClose={() => {
              setSelectedCardId(null);
              setAiDiff(null);
            }}
          />
        )}

        {/* Progress Drawer */}
        {progressOpen && (
          <ProgressDrawer
            stages={[
              { 
                key: 'ideia-base', 
                label: 'Ideia Base', 
                progress: cards.filter(c => c.stageKey === 'ideia-base' && c.status === 'READY').length / Math.max(1, cards.filter(c => c.stageKey === 'ideia-base').length) * 100 
              },
              { 
                key: 'escopo', 
                label: 'Escopo', 
                progress: cards.filter(c => c.stageKey === 'escopo' && c.status === 'READY').length / Math.max(1, cards.filter(c => c.stageKey === 'escopo').length) * 100 
              },
              { 
                key: 'tech', 
                label: 'Tech Stack', 
                progress: cards.filter(c => c.stageKey === 'tech' && c.status === 'READY').length / Math.max(1, cards.filter(c => c.stageKey === 'tech').length) * 100 
              },
            ]}
            onClose={() => setProgressOpen(false)}
          />
        )}

        {/* Outputs Modal */}
        {outputsOpen && (
          <OutputsModal
            projectId={projectId}
            open={outputsOpen}
            onClose={() => setOutputsOpen(false)}
            onRegenerate={(type) => console.log('Regenerate', type)}
          />
        )}
      </div>
    );
  }
);

CanvasPage.displayName = 'CanvasPage';

export { CanvasPage };
