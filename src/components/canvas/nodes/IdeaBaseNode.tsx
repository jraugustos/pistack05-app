'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { IdeaBaseCard } from '@/components/cards/IdeaBaseCard';
import type { Card } from '@/types';

/**
 * Node customizado para o card Ideia Base no React Flow
 */
export function IdeaBaseNode({ data, selected }: NodeProps) {
  const card = data.card as Card;

  return (
    <div
      className={`
        bg-bg border-2 rounded-lg shadow-lg transition-all
        ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-stroke'}
      `}
    >
      {/* Handle de saída (direita) - para conectar a outros cards */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-bg"
        style={{ right: -6 }}
      />

      {/* Handle de entrada (esquerda) - caso queira conectar de volta */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-bg"
        style={{ left: -6 }}
      />

      {/* Card original */}
      <IdeaBaseCard
        card={card}
        onUpdate={(fields) => data.onUpdate?.(card.id, fields)}
        onGenerate={(mode) => data.onGenerate?.(card.id, mode)}
        onConfirmReady={() => data.onConfirmReady?.(card.id)}
        onChecklistClick={data.onChecklistClick}
      />
    </div>
  );
}

