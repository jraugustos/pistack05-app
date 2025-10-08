'use client';

import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type { Card, Edge as PiStackEdge } from '@/types';
import { cardsToNodes, edgesToReactFlowEdges, nodeToCardUpdate } from '@/lib/utils/reactFlowAdapters';
import { useToastStore } from '@/lib/stores/useToastStore';

// Node types (vamos criar na Fase 2)
import { IdeaBaseNode } from './nodes/IdeaBaseNode';
import { ScopeFeaturesNode } from './nodes/ScopeFeaturesNode';
import { TechStackNode } from './nodes/TechStackNode';

const nodeTypes = {
  ideaBase: IdeaBaseNode,
  scopeFeatures: ScopeFeaturesNode,
  techStack: TechStackNode,
};

interface ReactFlowCanvasProps {
  projectId: string;
  initialCards: Card[];
  initialEdges: PiStackEdge[];
  onCardUpdate: (cardId: string, fields: any) => void;
  onCardDelete: (cardId: string) => void;
  onCardGenerate: (cardId: string, mode: 'generate' | 'expand' | 'review') => void;
  onCardConfirmReady: (cardId: string) => void;
  onChecklistClick: (params: { stageKey: string; typeKey: string }) => void;
  onCreateEdge: (sourceId: string, targetId: string) => Promise<void>;
  onDeleteEdge: (edgeId: string) => Promise<void>;
  onNodePositionChange: (cardId: string, x: number, y: number) => void;
}

function ReactFlowCanvasInner({
  projectId,
  initialCards,
  initialEdges,
  onCardUpdate,
  onCardDelete,
  onCardGenerate,
  onCardConfirmReady,
  onChecklistClick,
  onCreateEdge,
  onDeleteEdge,
  onNodePositionChange,
}: ReactFlowCanvasProps) {
  const { toast } = useToastStore();
  const { fitView } = useReactFlow();

  // Handlers para passar aos nodes
  const handlers = {
    onUpdate: onCardUpdate,
    onDelete: onCardDelete,
    onGenerate: onCardGenerate,
    onConfirmReady: onCardConfirmReady,
    onChecklistClick,
  };

  // Converter Cards → Nodes e Edges → ReactFlowEdges
  const [nodes, setNodes, onNodesChange] = useNodesState(
    cardsToNodes(initialCards, handlers)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    edgesToReactFlowEdges(initialEdges)
  );

  // Referência para debounce de autosave
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    setNodes(cardsToNodes(initialCards, handlers));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCards]);

  // Atualizar edges quando initialEdges mudar
  React.useEffect(() => {
    setEdges(edgesToReactFlowEdges(initialEdges));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEdges]);

  // Fit view ao montar (com delay para garantir que renderizou)
  React.useEffect(() => {
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChangeWithSave}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgeClick={onEdgeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      // Configurações de interação
      panOnScroll={false} // pan com Space + drag ou middle mouse
      panOnDrag={[1, 2]} // middle mouse (1) e right click (2)
      selectionOnDrag={false}
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
      <Controls showInteractive={false} />

      {/* Grid de fundo */}
      <Background
        color="rgba(255, 255, 255, 0.05)"
        gap={16}
        variant={BackgroundVariant.Dots}
      />

      {/* Hint de navegação */}
      <Panel position="bottom-left" className="bg-bg-soft/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-text-dim">
        <div className="flex items-center gap-3">
          <span>🖱️ <kbd className="px-1.5 py-0.5 bg-bg rounded text-xs">Space</kbd> + Arraste para navegar</span>
          <span>🔍 <kbd className="px-1.5 py-0.5 bg-bg rounded text-xs">Scroll</kbd> para zoom</span>
          <span>🔗 Arraste das <strong>alças laterais</strong> para conectar</span>
        </div>
      </Panel>
    </ReactFlow>
  );
}

/**
 * Wrapper com ReactFlowProvider (necessário para useReactFlow)
 */
export function ReactFlowCanvas(props: ReactFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <ReactFlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

