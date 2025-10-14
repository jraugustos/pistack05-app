import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { IdeaEnricherCard } from '@/components/cards/IdeaEnricherCard';
import type { Card } from '@/types';

interface IdeaEnricherNodeData {
  card: Card;
  cards: Card[];
  onUpdate?: (cardId: string, fields: Record<string, unknown>) => void;
  onGenerate?: (cardId: string, mode: 'generate' | 'expand' | 'review') => void;
  onConfirmReady?: (cardId: string) => void;
  onFocusCard?: (cardId: string) => void;
}

const IdeaEnricherNode = memo(({ data, selected }: NodeProps<IdeaEnricherNodeData>) => {
  const { card } = data;

  return (
    <div
      className={`
        bg-bg border-2 rounded-lg shadow-lg transition-all relative
        ${selected ? 'border-info ring-2 ring-info/30' : 'border-info/60'}
        ${selected ? 'animate-border-gradient' : ''}
      `}
      style={{ boxShadow: '0 0 18px rgba(154, 167, 255, 0.25)' }}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="idea-base"
        style={{
          background: '#9AA7FF',
          border: '2px solid #151821',
          width: '16px',
          height: '16px',
          boxShadow: '0 0 8px rgba(154, 167, 255, 0.6)',
        }}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="scope-features"
        style={{
          background: '#9AA7FF',
          border: '2px solid #151821',
          width: '16px',
          height: '16px',
          boxShadow: '0 0 8px rgba(154, 167, 255, 0.6)',
        }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="tech-stack"
        style={{
          background: '#9AA7FF',
          border: '2px solid #151821',
          width: '16px',
          height: '16px',
          top: '50px',
          boxShadow: '0 0 8px rgba(154, 167, 255, 0.6)',
        }}
      />

      <div className="relative z-10">
        <IdeaEnricherCard
          card={card}
          onUpdate={(fields) => data.onUpdate?.(card.id, fields)}
          onGenerate={(field, mode) => data.onGenerate?.(card.id, mode)}
          onConfirmReady={() => data.onConfirmReady?.(card.id)}
        />
      </div>
    </div>
  );
});

IdeaEnricherNode.displayName = 'IdeaEnricherNode';

export { IdeaEnricherNode };
