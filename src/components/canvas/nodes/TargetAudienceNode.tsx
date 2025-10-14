import * as React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TargetAudienceCard } from '@/components/cards/TargetAudienceCard';
import type { Card } from '@/types';

export interface TargetAudienceNodeData {
  card: Card;
  onUpdate?: (fields: any) => void;
  onConfirmReady?: () => void;
}

export function TargetAudienceNode({ data }: NodeProps<TargetAudienceNodeData>) {
  return (
    <div className="target-audience-node">
      {/* Handles de conexão */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />

      {/* Card de Público-Alvo */}
      <TargetAudienceCard
        card={data.card}
        onUpdate={data.onUpdate}
        onConfirmReady={data.onConfirmReady}
        className="w-[400px]"
      />
    </div>
  );
}
