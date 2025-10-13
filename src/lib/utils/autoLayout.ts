/**
 * Auto-Layout usando Dagre para organizar cards automaticamente
 */

import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';

export type LayoutDirection = 'LR' | 'TB' | 'RL' | 'BT';

export interface LayoutOptions {
  direction?: LayoutDirection;
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number; // Espaçamento entre ranks (níveis)
  nodeSep?: number; // Espaçamento entre nodes no mesmo rank
}

const defaultOptions: Required<LayoutOptions> = {
  direction: 'LR', // Left to Right (padrão)
  nodeWidth: 360,
  nodeHeight: 240,
  rankSep: 80, // 80px entre níveis
  nodeSep: 40, // 40px entre nodes
};

/**
 * Aplica layout automático usando algoritmo Dagre
 * @param nodes - Array de nodes do React Flow
 * @param edges - Array de edges do React Flow
 * @param options - Opções de layout
 * @returns Nodes com novas posições calculadas
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const opts = { ...defaultOptions, ...options };

  // Criar grafo Dagre
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Configurar grafo
  dagreGraph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
  });

  // Adicionar nodes ao grafo
  nodes.forEach((node) => {
    // Usar tamanho real do node se disponível
    const width = node.style?.width ? Number(node.style.width) : opts.nodeWidth;
    const height = node.style?.minHeight ? Number(node.style.minHeight) : opts.nodeHeight;
    
    dagreGraph.setNode(node.id, { width, height });
  });

  // Adicionar edges ao grafo
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calcular layout
  dagre.layout(dagreGraph);

  // Aplicar novas posições aos nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Dagre retorna o centro do node, precisamos ajustar para o top-left
    const width = node.style?.width ? Number(node.style.width) : opts.nodeWidth;
    const height = node.style?.minHeight ? Number(node.style.minHeight) : opts.nodeHeight;
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges, // Edges não mudam
  };
}

/**
 * Calcula dimensões do bounding box após o layout
 */
export function getLayoutBounds(nodes: Node[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const width = node.style?.width ? Number(node.style.width) : 360;
    const height = node.style?.minHeight ? Number(node.style.minHeight) : 240;

    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Centraliza nodes após o layout
 */
export function centerNodes(nodes: Node[], padding = 80): Node[] {
  const bounds = getLayoutBounds(nodes);
  
  // Offset para centralizar (começar do padding, não do 0)
  const offsetX = padding - bounds.minX;
  const offsetY = padding - bounds.minY;

  return nodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
  }));
}
