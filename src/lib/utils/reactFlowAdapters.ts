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
    'idea.enricher': 'ideaEnricher',
    'idea.target-audience': 'targetAudience',
    'scope.features': 'scopeFeatures',
    'design.interface': 'designInterface',
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
    onEnrichIdea?: (ideaBaseCardId: string) => void;
    onFocusCard?: (cardId: string) => void;
    enrichmentLoading?: boolean;
    cards?: Card[];
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
      onEnrichIdea: handlers.onEnrichIdea,
      onFocusCard: handlers.onFocusCard,
      enrichmentLoading: handlers.enrichmentLoading,
      cards: handlers.cards,
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
  // Se tem edgeType, usar custom edge
  const edgeType = edge.edgeType;
  const useCustomEdge = !!edgeType;

  // Cores por tipo
  const colorMap: Record<string, string> = {
    derives: '#7AA2FF',
    depends: '#FFC24B',
    references: '#8A90A6',
  };

  const color = edge.color || (edgeType ? colorMap[edgeType] : undefined) || 'var(--primary)';

  return {
    id: edge.id,
    source: edge.sourceCardId,
    target: edge.targetCardId,
    label: edge.label,
    type: useCustomEdge ? 'custom' : 'smoothstep',
    animated: !useCustomEdge, // Animação apenas para edges simples
    data: useCustomEdge
      ? {
          edgeType: edge.edgeType,
          label: edge.label,
          color: edge.color,
        }
      : undefined,
    style: {
      stroke: color,
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrowclosed' as const,
      color: color,
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

  // CRITICAL: Filter out Ideia Base to avoid overlapping it
  const nonBaseNodes = existingNodes.filter(
    (node) => node.type !== 'ideaBase' && node.type !== 'ideaEnricher'
  );

  // If only Ideia Base/Enricher exists, position to the right
  if (nonBaseNodes.length === 0) {
    const ideaBaseNode = existingNodes.find((n) => n.type === 'ideaBase' || n.type === 'ideaEnricher');
    if (ideaBaseNode) {
      const nodeWidth = ideaBaseNode.style?.width ? Number(ideaBaseNode.style.width) : 360;
      return {
        x: ideaBaseNode.position.x + nodeWidth + 60, // 60px margin from Ideia Base
        y: ideaBaseNode.position.y,
      };
    }
    return { x: 80, y: 80 };
  }

  // Encontrar o card mais à direita (excluindo Ideia Base)
  const rightmost = nonBaseNodes.reduce((max, node) => {
    return node.position.x > max.position.x ? node : max;
  }, nonBaseNodes[0]);

  const nodeWidth = rightmost.style?.width ? Number(rightmost.style.width) : 360;
  const newX = rightmost.position.x + nodeWidth + 40; // 40px de margem

  // Se ultrapassar 1200px, wrap para nova linha
  if (newX > 1200) {
    const baseX = 80;
    const lowestInFirstColumn = nonBaseNodes
      .filter(n => n.position.x <= baseX + 420)
      .reduce((max, node) => {
        return node.position.y > max.position.y ? node : max;
      }, nonBaseNodes[0]);

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

