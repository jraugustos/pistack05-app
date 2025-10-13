'use client';

import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
} from 'reactflow';
import type { EdgeType } from '@/types';

// Configurações de cor por tipo de edge
const EDGE_CONFIG: Record<EdgeType, { color: string; label: string }> = {
  derives: {
    color: '#7AA2FF', // Primary - azul
    label: 'deriva de',
  },
  depends: {
    color: '#FFC24B', // Warning - amarelo
    label: 'depende de',
  },
  references: {
    color: '#8A90A6', // Text dim - cinza
    label: 'referencia',
  },
};

interface CustomEdgeData {
  edgeType?: EdgeType;
  label?: string;
  color?: string;
}

/**
 * Custom Edge para React Flow com tipos e cores diferentes
 */
export function CustomEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<CustomEdgeData>) {
  const edgeType = data?.edgeType || 'derives';
  const config = EDGE_CONFIG[edgeType];
  const color = data?.color || config.color;
  const label = data?.label || config.label;

  // Usar smooth step para visual mais suave
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Edge principal */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: color,
          strokeWidth: 2,
        }}
      />

      {/* Label renderizado em cima do edge */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: `${color}20`, // 20% opacity
              color: color,
              border: `1px solid ${color}40`,
            }}
          >
            {label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

