'use client';

import * as React from 'react';
import { Button, Badge } from '@/components/foundation';
import { AIPanel, ProgressDrawer } from '@/components/molecules';
import { OutputsModal } from '@/components/organisms/OutputsModal';
import { ReactFlowCanvas, type ReactFlowCanvasHandle } from '@/components/canvas/ReactFlowCanvas';
import { useCards } from '@/hooks/useCards';
import { useCardsStore } from '@/lib/stores/useCardsStore';
import { TelemetryService } from '@/lib/services/TelemetryService';
import { GraphService } from '@/lib/services/GraphService';
import { toast } from '@/lib/stores/useToastStore';
import { getCascadePosition } from '@/lib/utils/reactFlowAdapters';
import { cn } from '@/lib/utils';
import { 
  Download, 
  Share2,
  ArrowLeft,
  Eye,
  Sparkles,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import type { Project, Card, Edge } from '@/types';
import { toPng } from 'html-to-image';

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
    const [aiPanelOpen, setAiPanelOpen] = React.useState(false);
    const agentEnabled = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AGENT_ENABLED === 'true';
    const [agentMessages, setAgentMessages] = React.useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
    const [agentThreadId, setAgentThreadId] = React.useState<string | null>(null);
    const [isOrganizing, setIsOrganizing] = React.useState(false);
    
    // Edges state
    const [edges, setEdges] = React.useState<Edge[]>(initialEdges);

    // Ref para ReactFlowCanvas (auto-layout)
    const canvasRef = React.useRef<ReactFlowCanvasHandle>(null);

    // State para rastrear seleção múltipla
    const [selectedCount, setSelectedCount] = React.useState(0);

    // Atualizar contador de selecionados periodicamente
    React.useEffect(() => {
      const interval = setInterval(() => {
        if (canvasRef.current) {
          const selected = canvasRef.current.getSelectedNodes();
          setSelectedCount(selected.length);
        }
      }, 200);

      return () => clearInterval(interval);
    }, []);

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

    // Inicializar agent session (threadId)
    React.useEffect(() => {
      async function initAgentSession() {
        if (!agentEnabled) return;
        
        try {
          const res = await fetch('/api/agent/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId }),
          });
          
          if (!res.ok) throw new Error('Failed to initialize agent session');
          
          const data = await res.json();
          setAgentThreadId(data.threadId);
          console.log('[Agent] Session initialized:', data.threadId);
        } catch (error) {
          console.error('[Agent] Failed to initialize session:', error);
        }
      }
      
      initAgentSession();
    }, [projectId, agentEnabled]);

    // Handlers para cards
    const handleChecklistCreate = async (target: { stageKey: string; typeKey: string }) => {
      try {
        TelemetryService.checklistClickStage(target.stageKey, target.typeKey, { projectId });
        
        // Se já existir o card, focar nele em vez de criar outro
        const existing = cards.find(c => c.stageKey === target.stageKey && c.typeKey === target.typeKey);
        if (existing) {
          toast.info('Este card já existe. Focando nele.');
          // Focar via prop para o ReactFlowCanvas
          setSelectedCardId(existing.id);
          return;
        }

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
        setAiPanelOpen(true); // Abrir painel quando IA for acionada
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
      setAiPanelOpen(false); // Fechar painel
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

    // Auto-Layout
    const handleAutoLayout = () => {
      if (canvasRef.current) {
        setIsOrganizing(true);
        canvasRef.current.applyAutoLayout();
        toast.success('Layout organizado! ✨');
        TelemetryService.track('canvas_auto_layout', { projectId, cardCount: cards.length });
        
        // Reset após animação
        setTimeout(() => {
          setIsOrganizing(false);
        }, 500);
      }
    };

    // Bulk Delete - deletar múltiplos cards selecionados
    const handleBulkDelete = async () => {
      if (!canvasRef.current) return;

      const selectedNodes = canvasRef.current.getSelectedNodes();
      if (selectedNodes.length === 0) {
        toast.info('Nenhum card selecionado');
        return;
      }

      const confirmed = window.confirm(
        `Deseja realmente deletar ${selectedNodes.length} card(s) selecionado(s)? Esta ação não pode ser desfeita.`
      );

      if (!confirmed) return;

      try {
        // Deletar todos os cards em paralelo
        await Promise.all(
          selectedNodes.map(node => deleteCard(node.id))
        );

        // Remover edges relacionadas
        setEdges(prev => 
          prev.filter(e => 
            !selectedNodes.some(n => n.id === e.sourceCardId || n.id === e.targetCardId)
          )
        );

        toast.success(`${selectedNodes.length} card(s) excluído(s) com sucesso! 🗑️`);
        TelemetryService.track('canvas_bulk_delete', { projectId, count: selectedNodes.length });
      } catch (err) {
        console.error('Failed to bulk delete cards:', err);
        toast.error('Erro ao deletar cards');
      }
    };

    // Export PNG - exportar canvas como imagem
    const handleExportPNG = async () => {
      try {
        toast.info('Gerando imagem...');

        // Encontrar o elemento do viewport do React Flow
        const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
        
        if (!viewport) {
          toast.error('Canvas não encontrado');
          return;
        }

        // Gerar imagem com alta qualidade (2x scale)
        const dataUrl = await toPng(viewport, {
          quality: 1.0,
          pixelRatio: 2, // 2x para alta resolução
          backgroundColor: '#0F1115', // bg color
        });

        // Criar link de download
        const link = document.createElement('a');
        link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-canvas.png`;
        link.href = dataUrl;
        link.click();

        toast.success('Canvas exportado como PNG! 📸');
        TelemetryService.track('canvas_export_png', { projectId, cardCount: cards.length });
      } catch (err) {
        console.error('Failed to export canvas:', err);
        toast.error('Erro ao exportar canvas');
      }
    };

    // Agent: enviar mensagem (ChatKit headless)
    const handleSendAgentMessage = async (text: string) => {
      // Verificar se há threadId
      if (!agentThreadId) {
        toast.error('Sessão do agente não inicializada');
        return;
      }

      try {
        // Abrir painel quando enviar mensagem
        setAiPanelOpen(true);
        
        // Append mensagem do usuário
        setAgentMessages(prev => [...prev, { role: 'user', content: text }]);

        // Descobrir typeKey do card focado (se houver)
        const focusedCard = selectedCardId ? cards.find(c => c.id === selectedCardId) : undefined;
        const typeKey = focusedCard?.typeKey || focusedCard?.type_key;

        const res = await fetch('/api/agent/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            message: text,
            threadId: agentThreadId,
            cardId: selectedCardId,
            typeKey,
          }),
        });
        
        if (!res.ok) throw new Error('Falha ao enviar mensagem ao agente');
        
        const data = await res.json();
        
        // Processar toolResults para sincronizar store
        if (data.toolResults && Array.isArray(data.toolResults)) {
          for (const tr of data.toolResults) {
            console.log('[Agent] Processing tool result:', tr.tool, tr.result);
            
            if (tr.tool === 'create_card' && tr.result?.card) {
              // Adicionar card ao store
              useCardsStore.getState().addCard(tr.result.card);
              toast.success('Card criado pelo agente');
            } else if (tr.tool === 'update_card_fields' && tr.result?.cardId) {
              // Atualizar card no store
              const updatedCard = cards.find(c => c.id === tr.result.cardId);
              if (updatedCard) {
                useCardsStore.getState().updateCard(tr.result.cardId, {
                  fields: tr.result.fields || tr.result.updates,
                });
                toast.success('Card atualizado pelo agente');
              }
            } else if (tr.tool === 'confirm_card_ready' && tr.result?.cardId) {
              // Confirmar card como READY
              useCardsStore.getState().updateCard(tr.result.cardId, {
                status: 'READY',
              });
              toast.success('Card confirmado como READY');
            } else if (tr.tool === 'create_edge' && tr.result?.edge) {
              // Adicionar edge
              setEdges(prev => [...prev, tr.result.edge]);
              toast.success('Conexão criada pelo agente');
            }
          }
        }
        
        // Processar mensagens do assistente
        const assistantTexts: string[] = Array.isArray(data.messages)
          ? data.messages.map((m: any) => String(m.content))
          : [String(data.text || 'Ok')];
        
        setAgentMessages(prev => [
          ...prev,
          ...assistantTexts.map(t => ({ role: 'assistant' as const, content: t }))
        ]);
      } catch (err) {
        setAgentMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Ocorreu um erro ao processar a mensagem.' 
        }]);
        console.error('[Agent] error:', err);
      }
    };

    const readyCount = getReadyCount();
    const workPlanEnabled = readyCount >= 2;

    return (
      <div ref={ref} className="h-screen flex flex-col bg-bg overflow-hidden max-w-full">
        {/* Header */}
        <header className="relative overflow-hidden">
          {/* Gradiente de fundo (padrão do projeto) */}
          <div className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_-10%_-50%,_rgba(122,162,255,0.25),_transparent_60%),radial-gradient(800px_300px_at_110%_-10%,_rgba(138,211,255,0.18),_transparent_60%)]"></div>
          
          <div className="relative flex items-center justify-between px-8 py-8 border-b border-stroke bg-bg-elev/80 backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.history.back()}
                className="hover:bg-bg/50 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text tracking-tight">{project.name}</h1>
                <Badge
                  variant={project.status === 'draft' ? 'draft' : project.status === 'active' ? 'primary' : 'warning'}
                  className="capitalize"
                >
                  {project.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProgressOpen(true)}
                  title="Ver progresso"
                  className="hover:bg-bg/50 rounded-lg"
                >
                  <Eye className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleAutoLayout}
                  disabled={isOrganizing || cards.length < 2}
                  title="Organizar cards automaticamente"
                  className="gap-2 hover:bg-bg/50 rounded-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  {isOrganizing ? 'Organizando...' : 'Organizar'}
                </Button>

                {selectedCount > 1 && (
                  <Button
                    variant="ghost"
                    onClick={handleBulkDelete}
                    title={`Deletar ${selectedCount} cards selecionados`}
                    className="gap-2 text-danger hover:text-danger hover:bg-danger/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar {selectedCount}
                  </Button>
                )}

                <Button
                  variant="default"
                  onClick={() => setOutputsOpen(true)}
                  disabled={!workPlanEnabled}
                  title={workPlanEnabled ? 'Gerar Work Plan' : 'Precisa de 2+ cards READY'}
                  className="rounded-lg"
                >
                  📋 Work Plan {workPlanEnabled && '✅'}
                </Button>

                <Button variant="ghost" size="icon" title="Compartilhar (em breve)" className="hover:bg-bg/50 rounded-lg">
                  <Share2 className="w-5 h-5" />
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleExportPNG}
                  title="Exportar canvas como PNG"
                  className="hover:bg-bg/50 rounded-lg"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Canvas + AIPanel */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* React Flow Canvas */}
          <div className="flex-1 relative">
            {/* AI Panel Toggle Button */}
            {!aiPanelOpen && (
              <div className="absolute top-4 right-4 z-40">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAiPanelOpen(true)}
                  className="glass-effect rounded-full w-12 h-12 bg-bg-elev/80 backdrop-blur-md border border-stroke/50 shadow-lg hover:bg-primary/20 hover:border-primary/50 transition-all duration-200"
                  title="Abrir Assistente IA"
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </Button>
              </div>
            )}

            <ReactFlowCanvas
              ref={canvasRef}
              projectId={projectId}
              initialCards={cards}
              initialEdges={edges}
              focusCardId={selectedCardId || undefined}
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

          {/* AIPanel como overlay (só visível quando aberto) */}
          <div className={cn(
            "absolute top-4 right-4 z-50 h-full pointer-events-auto transition-all duration-300 ease-out",
            aiPanelOpen 
              ? "opacity-100 translate-x-0 animate-slide-in-right" 
              : "opacity-0 translate-x-full pointer-events-none"
          )}>
            <AIPanel
              mode={aiMode}
              loading={aiLoading}
              prompt=""
              diff={aiDiff}
              agentEnabled={agentEnabled}
              messages={agentMessages}
              onSendMessage={agentEnabled ? handleSendAgentMessage : undefined}
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
