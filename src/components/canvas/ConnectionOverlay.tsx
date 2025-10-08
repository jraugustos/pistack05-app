'use client';

import React from 'react';
import type { Edge, Card } from '@/types';

interface ConnectionOverlayProps {
  edges: Edge[];
  cards: Card[];
  onDeleteEdge?: (edgeId: string) => void;
  connectionMode?: boolean;
  tempConnection?: { sourceCardId: string; mouseX: number; mouseY: number } | null;
}

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({
  edges,
  cards,
  onDeleteEdge,
  connectionMode = false,
  tempConnection = null,
}) => {
  const [hoveredEdgeId, setHoveredEdgeId] = React.useState<string | null>(null);

  // Debug: mostrar edges no console
  React.useEffect(() => {
    console.log('[ConnectionOverlay] Edges:', edges);
    console.log('[ConnectionOverlay] Cards:', cards.length);
  }, [edges, cards]);

  // Calcular centro de um card (posição absoluta no canvas)
  const getCardCenter = (card: Card) => {
    const position = card.position || { x: 80, y: 80 };
    const size = card.size || { width: 360, height: 240 };
    
    // Retorna coordenadas absolutas do centro do card
    return {
      x: position.x + size.width / 2,
      y: position.y + size.height / 2,
    };
  };

  // Gerar path de Bézier entre dois pontos
  const getBezierPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): string => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Controle horizontal para curvas suaves
    const controlOffset = Math.abs(dx) * 0.5;
    
    return `M ${start.x},${start.y} C ${start.x + controlOffset},${start.y} ${end.x - controlOffset},${end.y} ${end.x},${end.y}`;
  };

  // Calcular ponto médio para label
  const getMidPoint = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): { x: number; y: number } => {
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };
  };

  // Lidar com clique na edge
  const handleEdgeClick = (edgeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteEdge) {
      if (confirm('Deseja remover esta conexão?')) {
        onDeleteEdge(edgeId);
      }
    }
  };

  // Calcular tamanho do SVG baseado nos cards
  const getBoundingBox = () => {
    if (cards.length === 0) return { width: 2000, height: 2000 };
    
    let maxX = 0;
    let maxY = 0;
    
    cards.forEach(card => {
      const pos = card.position || { x: 80, y: 80 };
      const size = card.size || { width: 360, height: 240 };
      maxX = Math.max(maxX, pos.x + size.width);
      maxY = Math.max(maxY, pos.y + size.height);
    });
    
    return { width: maxX + 500, height: maxY + 500 };
  };

  const bbox = getBoundingBox();

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      width={bbox.width}
      height={bbox.height}
      style={{ zIndex: 1 }}
    >
      <defs>
        {/* Marcador de seta para final da linha */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="rgba(99, 102, 241, 0.6)" />
        </marker>
        
        {/* Marcador para hover */}
        <marker
          id="arrowhead-hover"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="rgba(99, 102, 241, 1)" />
        </marker>
      </defs>

      {/* Renderizar conexões existentes */}
      {edges.map((edge) => {
        const sourceCard = cards.find((c) => c.id === edge.sourceCardId);
        const targetCard = cards.find((c) => c.id === edge.targetCardId);

        if (!sourceCard || !targetCard) return null;

        const start = getCardCenter(sourceCard);
        const end = getCardCenter(targetCard);
        const path = getBezierPath(start, end);
        const midPoint = getMidPoint(start, end);
        
        const isHovered = hoveredEdgeId === edge.id;

        return (
          <g key={edge.id}>
            {/* Linha invisível mais grossa para facilitar hover/click */}
            <path
              d={path}
              stroke="transparent"
              strokeWidth="20"
              fill="none"
              className="pointer-events-auto cursor-pointer"
              onMouseEnter={() => setHoveredEdgeId(edge.id)}
              onMouseLeave={() => setHoveredEdgeId(null)}
              onClick={(e) => handleEdgeClick(edge.id, e)}
            />
            
            {/* Linha visual */}
            <path
              d={path}
              stroke={isHovered ? 'rgba(99, 102, 241, 1)' : 'rgba(99, 102, 241, 0.6)'}
              strokeWidth={isHovered ? '3' : '2'}
              fill="none"
              markerEnd={isHovered ? 'url(#arrowhead-hover)' : 'url(#arrowhead)'}
              className="pointer-events-none transition-all"
              strokeDasharray={connectionMode ? '5,5' : '0'}
            />

            {/* Label (se houver) */}
            {edge.label && (
              <g>
                <rect
                  x={midPoint.x - 40}
                  y={midPoint.y - 12}
                  width="80"
                  height="24"
                  rx="4"
                  fill={isHovered ? 'rgba(99, 102, 241, 0.95)' : 'rgba(99, 102, 241, 0.8)'}
                  className="pointer-events-none"
                />
                <text
                  x={midPoint.x}
                  y={midPoint.y + 4}
                  textAnchor="middle"
                  className="text-xs font-medium fill-white pointer-events-none"
                >
                  {edge.label}
                </text>
              </g>
            )}

            {/* Indicador de delete no hover */}
            {isHovered && onDeleteEdge && (
              <g>
                <circle
                  cx={midPoint.x}
                  cy={midPoint.y}
                  r="12"
                  fill="rgba(239, 68, 68, 0.9)"
                  className="pointer-events-none"
                />
                <text
                  x={midPoint.x}
                  y={midPoint.y + 4}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white pointer-events-none"
                >
                  ×
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Conexão temporária durante criação */}
      {tempConnection && connectionMode && (() => {
        const sourceCard = cards.find((c) => c.id === tempConnection.sourceCardId);
        if (!sourceCard) return null;

        const start = getCardCenter(sourceCard);
        const end = { x: tempConnection.mouseX, y: tempConnection.mouseY };
        const path = getBezierPath(start, end);

        return (
          <path
            key="temp-connection"
            d={path}
            stroke="rgba(99, 102, 241, 0.4)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            className="pointer-events-none animate-pulse"
          />
        );
      })()}
    </svg>
  );
};

