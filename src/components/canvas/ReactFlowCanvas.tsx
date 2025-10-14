'use client';

import React, { useCallback, useRef, useImperativeHandle } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type { Card, Edge as PiStackEdge } from '@/types';
import { cardsToNodes, edgesToReactFlowEdges, nodeToCardUpdate } from '@/lib/utils/reactFlowAdapters';
import { useToastStore } from '@/lib/stores/useToastStore';
import { getLayoutedElements, centerNodes, type LayoutDirection } from '@/lib/utils/autoLayout';
import { Info, X } from 'lucide-react';

// Node types
import { IdeaBaseNode } from './nodes/IdeaBaseNode';
import { IdeaEnricherNode } from './nodes/IdeaEnricherNode';
import { TargetAudienceNode } from './nodes/TargetAudienceNode';
import { ScopeFeaturesNode } from './nodes/ScopeFeaturesNode';
import { TechStackNode } from './nodes/TechStackNode';

// Edge types
import { CustomEdge } from './edges/CustomEdge';

const nodeTypes = {
  ideaBase: IdeaBaseNode,
  ideaEnricher: IdeaEnricherNode,
  targetAudience: TargetAudienceNode,
  scopeFeatures: ScopeFeaturesNode,
  techStack: TechStackNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface ReactFlowCanvasProps {
  projectId: string;
  initialCards: Card[];
  initialEdges: PiStackEdge[];
  focusCardId?: string;
  enrichmentLoading?: boolean; // Loading state para enriquecimento
  onCardUpdate: (cardId: string, fields: any) => void;
  onCardDelete: (cardId: string) => void;
  onCardGenerate: (cardId: string, mode: 'generate' | 'expand' | 'review') => void;
  onCardConfirmReady: (cardId: string) => void;
  onChecklistClick: (params: { stageKey: string; typeKey: string }) => void;
  onCreateEdge: (sourceId: string, targetId: string) => Promise<void>;
  onDeleteEdge: (edgeId: string) => Promise<void>;
  onNodePositionChange: (cardId: string, x: number, y: number) => void;
  onEnrichIdea?: (ideaBaseCardId: string) => void; // Callback para criar IdeaEnricher
  onAutoLayout?: () => void; // Callback quando auto-layout é aplicado
}

export interface ReactFlowCanvasHandle {
  applyAutoLayout: () => void;
  getSelectedNodes: () => Node[];
}

const ReactFlowCanvasInner = React.forwardRef<ReactFlowCanvasHandle, ReactFlowCanvasProps>(
  ({
    projectId,
    initialCards,
    initialEdges,
    focusCardId,
    enrichmentLoading = false,
    onCardUpdate,
    onCardDelete,
    onCardGenerate,
    onCardConfirmReady,
    onChecklistClick,
    onCreateEdge,
    onDeleteEdge,
    onNodePositionChange,
    onEnrichIdea,
    onAutoLayout,
  }, ref) => {
  const { toast } = useToastStore();
  const { fitView, getNode, zoomIn, zoomOut } = useReactFlow();

  // Handler para focar em card
  const handleFocusCard = useCallback((cardId: string) => {
    const node = getNode(cardId);
    if (node) {
      fitView({ nodes: [node], padding: 0.25, duration: 300 });
    }
  }, [getNode, fitView]);

  // Handlers para passar aos nodes
  const handlers = {
    onUpdate: onCardUpdate,
    onDelete: onCardDelete,
    onGenerate: onCardGenerate,
    onConfirmReady: onCardConfirmReady,
    onChecklistClick,
    onFocusCard: handleFocusCard,
    onEnrichIdea,
    enrichmentLoading,
    cards: initialCards, // Passar todos os cards para verificar status
  };

  // Converter Cards → Nodes e Edges → ReactFlowEdges
  const [nodes, setNodes, onNodesChange] = useNodesState(
    cardsToNodes(initialCards, handlers)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    edgesToReactFlowEdges(initialEdges, initialCards)
  );
  
  // Estado para controlar visibilidade das instruções
  const [showInstructions, setShowInstructions] = React.useState(false);

  // Referência para debounce de autosave
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State para seleção múltipla
  const [selectedNodes, setSelectedNodes] = React.useState<Node[]>([]);

  // Handler: rastrear seleção múltipla
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodes(selectedNodes);
    },
    []
  );

  // Expor funções via ref
  useImperativeHandle(ref, () => ({
    applyAutoLayout: () => {
      const layouted = getLayoutedElements(nodes, edges, {
        direction: 'LR', // Left to Right
        nodeWidth: 360,
        nodeHeight: 240,
        rankSep: 100,
        nodeSep: 60,
      });

      setNodes(layouted.nodes);

      // Salvar novas posições de todos os nodes
      layouted.nodes.forEach((node) => {
        onNodePositionChange(node.id, node.position.x, node.position.y);
      });

      // Fit view após layout com animação
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 500 });
      }, 100);
    },
    getSelectedNodes: () => selectedNodes,
  }), [nodes, edges, setNodes, onNodePositionChange, fitView, selectedNodes]);

  // Handler: criar conexão (drag & drop entre handles)
  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target) return;

      try {
        // Criar edge no backend
        await onCreateEdge(params.source, params.target);

        // Adicionar edge localmente
        setEdges((eds) => addEdge(params, eds));
        toast.success('Conexão criada! 🎉');
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('já existe')) {
          toast.info('Conexão já existe');
        } else {
          toast.error('Erro ao criar conexão');
        }
      }
    },
    [onCreateEdge, setEdges, toast]
  );

  // Handler: deletar edge
  const onEdgeClick = useCallback(
    async (_event: React.MouseEvent, edge: Edge) => {
      if (confirm('Deseja remover esta conexão?')) {
        try {
          await onDeleteEdge(edge.id);
          setEdges((eds) => eds.filter((e) => e.id !== edge.id));
          toast.success('Conexão removida');
        } catch (error) {
          toast.error('Erro ao remover conexão');
        }
      }
    },
    [onDeleteEdge, setEdges, toast]
  );

  // Handler: salvar posições dos nodes (debounced)
  const onNodesChangeWithSave = useCallback(
    (changes: any) => {
      onNodesChange(changes);

      // Debounce: salvar após 800ms de inatividade
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        // Extrair nodes que mudaram de posição
        const positionChanges = changes.filter(
          (c: any) => c.type === 'position' && c.dragging === false
        );

        positionChanges.forEach((change: any) => {
          const node = nodes.find((n) => n.id === change.id);
          if (node && node.position) {
            onNodePositionChange(node.id, node.position.x, node.position.y);
          }
        });
      }, 800);
    },
    [onNodesChange, onNodePositionChange, nodes]
  );

  // Atualizar nodes quando initialCards mudar (ex: novo card criado)
  React.useEffect(() => {
    // Atualizar handlers com cards mais recentes
    const updatedHandlers = {
      ...handlers,
      enrichmentLoading,
      cards: initialCards,
    };
    setNodes(cardsToNodes(initialCards, updatedHandlers));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCards, enrichmentLoading]);

  // Atualizar edges quando initialEdges ou initialCards mudar
  React.useEffect(() => {
    setEdges(edgesToReactFlowEdges(initialEdges, initialCards));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEdges, initialCards]);

  // Fit view ao montar (com delay para garantir que renderizou)
  React.useEffect(() => {
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focar card solicitado externamente
  React.useEffect(() => {
    if (!focusCardId) return;
    const node = getNode(focusCardId);
    if (node) {
      fitView({ nodes: [node], padding: 0.25, duration: 300 });
    }
  }, [focusCardId, getNode, fitView]);

  // Expor função de auto-layout via ref
  React.useImperativeHandle(ref, () => ({
    applyAutoLayout: () => {
      if (nodes.length === 0) {
        toast.info('Nenhum card para organizar');
        return;
      }

      // Aplicar layout usando Dagre
      const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, {
        direction: 'LR', // Left to Right
        rankSep: 100,
        nodeSep: 60,
      });

      // Centralizar nodes
      const centeredNodes = centerNodes(layoutedNodes, 80);

      // Atualizar posições dos nodes
      setNodes(centeredNodes);

      // Persistir novas posições
      centeredNodes.forEach(node => {
        onNodePositionChange(node.id, node.position.x, node.position.y);
      });

      // Aplicar fit view após layout
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 500 });
      }, 100);

      // Notificar callback externo
      onAutoLayout?.();

      toast.success('Cards organizados automaticamente! ✨');
    },
    getSelectedNodes: () => {
      return nodes.filter(node => node.selected);
    },
  }), [nodes, edges, setNodes, onNodePositionChange, fitView, onAutoLayout, toast]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChangeWithSave}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgeClick={onEdgeClick}
      onSelectionChange={handleSelectionChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      // Configurações de interação
      panOnScroll={false} // pan com Space + drag ou middle mouse
      panOnDrag={[1, 2]} // middle mouse (1) e right click (2)
      selectionOnDrag={true} // Habilitar seleção múltipla arrastando
      multiSelectionKeyCode="Shift" // Shift para selecionar múltiplos
      zoomOnScroll={true}
      zoomOnPinch={true}
      minZoom={0.1}
      maxZoom={2}
      // Atalhos de teclado
      deleteKeyCode="Delete"
      // Estilo
      className="react-flow-canvas"
    >
      {/* Controles de zoom/fit */}

      {/* Grid de fundo */}
      <Background />

      {/* MiniMap para navegação */}
      <MiniMap
        nodeStrokeColor={(n) => {
          switch (n.type) {
            case 'ideaBase':
              return '#7AA2FF'; // Primary - destaque especial
            case 'scopeFeatures':
              return '#5AD19A'; // Success
            case 'techStack':
              return '#8AD3FF'; // Cyan
            default:
              return '#242837';
          }
        }}
        nodeColor={(n) => {
          // Ideia Base com preenchimento especial
          if (n.type === 'ideaBase') {
            return 'rgba(122, 162, 255, 0.15)';
          }
          return '#1A1D2E';
        }}
        nodeBorderRadius={12}
        maskColor="rgba(15,17,21,0.8)"
        pannable
        zoomable
        position="bottom-left"
        className="minimap-glass"
        style={{
          background: 'rgba(21, 24, 33, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(36, 40, 55, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      />

      {/* Ícones embaixo do minimap */}
      <Panel position="bottom-left" className="z-50" style={{ marginLeft: '16px', marginBottom: '1rem' }}>
        <div 
          className="glass-effect rounded-xl p-2 flex gap-2"
          style={{
            background: 'rgba(21, 24, 33, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(36, 40, 55, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Botões de zoom */}
          <button
            onClick={() => zoomIn()}
            className="w-8 h-8 bg-bg/60 hover:bg-primary/20 border border-stroke/30 hover:border-primary/50 rounded-lg flex items-center justify-center transition-all duration-200 group"
            title="Zoom In"
          >
            <span className="text-sm font-medium text-text group-hover:text-primary">+</span>
          </button>
          <button
            onClick={() => zoomOut()}
            className="w-8 h-8 bg-bg/60 hover:bg-primary/20 border border-stroke/30 hover:border-primary/50 rounded-lg flex items-center justify-center transition-all duration-200 group"
            title="Zoom Out"
          >
            <span className="text-sm font-medium text-text group-hover:text-primary">−</span>
          </button>
          <button
            onClick={() => fitView({ padding: 0.2, duration: 300 })}
            className="w-8 h-8 bg-bg/60 hover:bg-primary/20 border border-stroke/30 hover:border-primary/50 rounded-lg flex items-center justify-center transition-all duration-200 group"
            title="Fit View"
          >
            <span className="text-xs font-medium text-text group-hover:text-primary">⌂</span>
          </button>
          
          {/* Botão de informações */}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-8 h-8 bg-bg/60 hover:bg-primary/20 border border-stroke/30 hover:border-primary/50 rounded-lg flex items-center justify-center transition-all duration-200 group"
            title={showInstructions ? 'Ocultar instruções' : 'Mostrar instruções'}
          >
            <Info className="w-4 h-4 text-text-dim group-hover:text-primary" />
          </button>
        </div>
      </Panel>


      {/* Hint de navegação - agora condicional e com animação */}
      {showInstructions && (
        <Panel position="bottom-center" className="glass-effect px-4 py-3 rounded-xl text-xs text-text-dim animate-slide-in-bottom">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span>🖱️ <kbd className="px-2 py-1 bg-bg/50 rounded text-xs border border-stroke/30">Space</kbd> + Arraste para navegar</span>
              <span>🔍 <kbd className="px-2 py-1 bg-bg/50 rounded text-xs border border-stroke/30">Scroll</kbd> para zoom</span>
              <span>🔗 Arraste das <strong className="text-primary">alças laterais</strong> para conectar</span>
              <span>📦 Arraste para selecionar múltiplos • <kbd className="px-2 py-1 bg-bg/50 rounded text-xs border border-stroke/30">Shift</kbd> para adicionar</span>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-bg/50 transition-colors"
              title="Fechar instruções"
            >
              <X className="w-4 h-4 text-text-dim hover:text-text" />
            </button>
          </div>
        </Panel>
      )}
    </ReactFlow>
  );
});

ReactFlowCanvasInner.displayName = 'ReactFlowCanvasInner';

/**
 * Wrapper com ReactFlowProvider (necessário para useReactFlow)
 */
export const ReactFlowCanvas = React.forwardRef<ReactFlowCanvasHandle, ReactFlowCanvasProps>(
  (props, ref) => {
    return (
      <ReactFlowProvider>
        <ReactFlowCanvasInner {...props} ref={ref} />
      </ReactFlowProvider>
    );
  }
);

ReactFlowCanvas.displayName = 'ReactFlowCanvas';

