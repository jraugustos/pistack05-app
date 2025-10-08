/**
 * Adaptadores para converter tipos do PiStack para React Flow
 */

import type { Node, Edge as ReactFlowEdge } from 'reactflow';
import type { Card, Edge } from '@/types';

/**
 * Mapeia typeKey do Card para o tipo de Node no React Flow
 */
export function getNodeType(typeKey: string): string {
  const typeMap: Record<string, string> = {
    'idea.base': 'ideaBase',
    'scope.features': 'scopeFeatures',
    'tech.stack': 'techStack',
  };
  
  return typeMap[typeKey] || 'default';
}

/**
 * Converte um Card do PiStack para um Node do React Flow
 */
export function cardToNode(
  card: Card,
  handlers: {
    onUpdate?: (cardId: string, fields: any) => void;
    onDelete?: (cardId: string) => void;
    onGenerate?: (cardId: string, mode: 'generate' | 'expand' | 'review') => void;
    onConfirmReady?: (cardId: string) => void;
    onChecklistClick?: (params: { stageKey: string; typeKey: string }) => void;
  } = {}
): Node {
  const position = card.position || { x: 80, y: 80 };
  const size = card.size || { width: 360, height: 240 };

  return {
    id: card.id,
    type: getNodeType(card.typeKey),
    position,
    data: {
      card,
      onUpdate: handlers.onUpdate,
      onDelete: handlers.onDelete,
      onGenerate: handlers.onGenerate,
      onConfirmReady: handlers.onConfirmReady,
      onChecklistClick: handlers.onChecklistClick,
    },
    // Configurações do React Flow
    draggable: true,
    selectable: true,
    // Usar size do card (React Flow usa 'style')
    style: {
      width: size.width,
      minHeight: size.height,
    },
  };
}

/**
 * Converte múltiplos Cards para Nodes
 */
export function cardsToNodes(cards: Card[], handlers?: any): Node[] {
  return cards.map(card => cardToNode(card, handlers));
}

/**
 * Converte um Edge do PiStack para ReactFlowEdge
 */
export function edgeToReactFlowEdge(edge: Edge): ReactFlowEdge {
  return {
    id: edge.id,
    source: edge.sourceCardId,
    target: edge.targetCardId,
    label: edge.label,
    type: 'smoothstep', // ou 'bezier', 'straight', 'step'
    animated: true, // animação sutil
    style: {
      stroke: 'var(--primary)',
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrowclosed' as const,
      color: 'var(--primary)',
    },
  };
}

/**
 * Converte múltiplos Edges para ReactFlowEdges
 */
export function edgesToReactFlowEdges(edges: Edge[]): ReactFlowEdge[] {
  return edges.map(edgeToReactFlowEdge);
}

/**
 * Converte um Node do React Flow de volta para dados de Card (para salvar posição)
 */
export function nodeToCardUpdate(node: Node): { id: string; position: { x: number; y: number } } {
  return {
    id: node.id,
    position: node.position,
  };
}

/**
 * Calcula posição em cascata para novos cards
 */
export function getCascadePosition(existingNodes: Node[]): { x: number; y: number } {
  if (existingNodes.length === 0) {
    return { x: 80, y: 80 };
  }

  // Encontrar o card mais à direita
  const rightmost = existingNodes.reduce((max, node) => {
    return node.position.x > max.position.x ? node : max;
  }, existingNodes[0]);

  const nodeWidth = rightmost.style?.width ? Number(rightmost.style.width) : 360;
  const newX = rightmost.position.x + nodeWidth + 40; // 40px de margem

  // Se ultrapassar 1200px, wrap para nova linha
  if (newX > 1200) {
    const baseX = 80;
    const lowestInFirstColumn = existingNodes
      .filter(n => n.position.x <= baseX + 420)
      .reduce((max, node) => {
        return node.position.y > max.position.y ? node : max;
      }, existingNodes[0]);

    const nodeHeight = lowestInFirstColumn.style?.minHeight 
      ? Number(lowestInFirstColumn.style.minHeight) 
      : 240;

    return {
      x: baseX,
      y: lowestInFirstColumn.position.y + nodeHeight + 40,
    };
  }

  return {
    x: newX,
    y: rightmost.position.y,
  };
}

