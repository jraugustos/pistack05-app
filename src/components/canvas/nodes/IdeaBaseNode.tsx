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
        bg-bg border rounded-lg shadow-lg transition-all relative
        ${selected ? 'border-primary/70 ring-1 ring-primary/40' : 'border-stroke/60'}
      `}
      style={{ boxShadow: '0 0 14px rgba(122, 162, 255, 0.18)' }}
    >
      {/* Gradient border with smooth transition */}
      <div
        className={`pointer-events-none absolute -inset-[1px] rounded-lg -z-10 opacity-60`}
        style={{
          background:
            'linear-gradient(90deg, rgba(122,162,255,0.5), rgba(90,209,154,0.45), rgba(138,211,255,0.5))',
          backgroundSize: '200% 200%',
          animation: 'border-gradient 10s ease-in-out infinite',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px'
        }}
      />
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
        cards={data.cards} // Array de todos os cards para verificar status
        onUpdate={(fields) => data.onUpdate?.(card.id, fields)}
        onGenerate={(mode) => data.onGenerate?.(card.id, mode)}
        onConfirmReady={() => data.onConfirmReady?.(card.id)}
        onChecklistClick={data.onChecklistClick}
        onFocusCard={data.onFocusCard} // Callback para focar card
      />
    </div>
  );
}

