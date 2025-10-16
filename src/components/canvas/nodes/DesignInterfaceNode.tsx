import * as React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DesignInterfaceCard } from '@/components/cards/DesignInterfaceCard';
import type { Card } from '@/types';

export interface DesignInterfaceNodeData {
  card: Card;
  onUpdate?: (fields: any) => void;
  onConfirmReady?: () => void;
}

export function DesignInterfaceNode({ data }: NodeProps<DesignInterfaceNodeData>) {
  return (
    <div className="design-interface-node">
      {/* Handles de conexão */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-pink-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-pink-500 border-2 border-white"
      />

      {/* Card de Interface e Design */}
      <DesignInterfaceCard
        card={data.card}
        onUpdate={data.onUpdate}
        onConfirmReady={data.onConfirmReady}
        className="w-[400px]"
      />
    </div>
  );
}
