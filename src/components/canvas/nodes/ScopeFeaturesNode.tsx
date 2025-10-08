'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ScopeFeaturesCard } from '@/components/cards/ScopeFeaturesCard';
import type { Card } from '@/types';

/**
 * Node customizado para o card Scope Features no React Flow
 */
export function ScopeFeaturesNode({ data, selected }: NodeProps) {
  const card = data.card as Card;

  return (
    <div
      className={`
        bg-bg border-2 rounded-lg shadow-lg transition-all
        ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-stroke'}
      `}
    >
      {/* Handle de saída (direita) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-bg"
        style={{ right: -6 }}
      />

      {/* Handle de entrada (esquerda) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-bg"
        style={{ left: -6 }}
      />

      {/* Botão de deletar (apenas se não for Ideia Base) */}
      {data.onDelete && (
        <button
          onClick={() => data.onDelete(card.id)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md z-20 transition-all"
          title="Excluir card"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Card original */}
      <ScopeFeaturesCard
        card={card}
        onUpdate={(fields) => data.onUpdate?.(card.id, fields)}
        onGenerate={(mode) => data.onGenerate?.(card.id, mode)}
        onConfirmReady={() => data.onConfirmReady?.(card.id)}
      />
    </div>
  );
}

