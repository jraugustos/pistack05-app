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
    <div className="idea-base-node relative">
      {/* Handle de saída (direita) - para conectar a outros cards */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-primary border-2 border-white"
      />

      {/* Handle de entrada (esquerda) - caso queira conectar de volta */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-primary border-2 border-white"
      />

      {/* Card original - o estilo fica no card */}
      <IdeaBaseCard
        card={card}
        cards={data.cards}
        enrichmentLoading={data.enrichmentLoading}
        onUpdate={(fields) => data.onUpdate?.(card.id, fields)}
        onGenerate={(mode) => data.onGenerate?.(card.id, mode)}
        onConfirmReady={() => data.onConfirmReady?.(card.id)}
        onChecklistClick={data.onChecklistClick}
        onFocusCard={data.onFocusCard}
        onEnrichIdea={data.onEnrichIdea}
      />
    </div>
  );
}

