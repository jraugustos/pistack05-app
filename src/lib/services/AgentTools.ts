/**
 * AgentTools
 * Implementação de tools que o agente pode chamar (wrappers para nossos serviços/APIs)
 */

import { ContextService } from '@/lib/services/ContextService';

/**
 * Tool definitions no formato OpenAI Function Calling
 */
export const AGENT_TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'get_project_context',
      description: 'Get the current project context including idea base and all READY cards',
      parameters: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'The ID of the project',
          },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_card',
      description: 'Create a new card in the project canvas',
      parameters: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'The ID of the project',
          },
          stageKey: {
            type: 'string',
            description: 'Stage key (e.g., "scope", "tech", "design", "plan")',
          },
          typeKey: {
            type: 'string',
            description: 'Card type key (e.g., "scope.features", "tech.stack")',
          },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
            },
            description: 'Position on canvas (optional)',
          },
        },
        required: ['projectId', 'stageKey', 'typeKey'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_card_fields',
      description: 'Update the fields of an existing card',
      parameters: {
        type: 'object',
        properties: {
          cardId: {
            type: 'string',
            description: 'The ID of the card to update',
          },
          fields: {
            type: 'object',
            description: 'The fields to update (must match card schema)',
          },
        },
        required: ['cardId', 'fields'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'confirm_card_ready',
      description: 'Change card status from DRAFT to READY',
      parameters: {
        type: 'object',
        properties: {
          cardId: {
            type: 'string',
            description: 'The ID of the card to confirm',
          },
        },
        required: ['cardId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_edge',
      description: 'Create a connection (edge) between two cards',
      parameters: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'The ID of the project',
          },
          sourceId: {
            type: 'string',
            description: 'The ID of the source card',
          },
          targetId: {
            type: 'string',
            description: 'The ID of the target card',
          },
        },
        required: ['projectId', 'sourceId', 'targetId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'delete_edge',
      description: 'Delete a connection (edge) between cards',
      parameters: {
        type: 'object',
        properties: {
          edgeId: {
            type: 'string',
            description: 'The ID of the edge to delete',
          },
        },
        required: ['edgeId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_ready_count',
      description: 'Get the count of READY cards in the project',
      parameters: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'The ID of the project',
          },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'generate_output',
      description: 'Generate project output (work-plan, prd, or prompt-pack)',
      parameters: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'The ID of the project',
          },
          type: {
            type: 'string',
            enum: ['work-plan', 'prd', 'prompt-pack'],
            description: 'Type of output to generate',
          },
        },
        required: ['projectId', 'type'],
      },
    },
  },
];

export const AgentTools = {
  async get_project_context(projectId: string) {
    return await ContextService.getProjectContext(projectId);
  },

  async create_card(params: { projectId: string; stageKey: string; typeKey: string; position?: { x: number; y: number } }) {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: params.projectId,
        stage_key: params.stageKey,
        type_key: params.typeKey,
        title: params.typeKey,
        x: params.position?.x,
        y: params.position?.y,
      }),
    });
    if (!res.ok) throw new Error('Failed to create card');
    const data = await res.json();
    return { cardId: data.card?.id };
  },

  async update_card_fields(params: { cardId: string; fields: Record<string, any> }) {
    const res = await fetch(`/api/cards/${params.cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: params.fields }),
    });
    if (!res.ok) throw new Error('Failed to update card fields');
    return { ok: true };
  },

  async confirm_card_ready(params: { cardId: string }) {
    const res = await fetch(`/api/cards/${params.cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'READY' }),
    });
    if (!res.ok) throw new Error('Failed to confirm card');
    return { ok: true };
  },

  async create_edge(params: { projectId: string; sourceId: string; targetId: string }) {
    const res = await fetch('/api/edges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: params.projectId,
        source_card_id: params.sourceId,
        target_card_id: params.targetId,
      }),
    });
    if (!res.ok) throw new Error('Failed to create edge');
    const data = await res.json();
    return { edgeId: data.edge?.id };
  },

  async delete_edge(params: { edgeId: string }) {
    const res = await fetch(`/api/edges/${params.edgeId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete edge');
    return { ok: true };
  },

  async get_ready_count(projectId: string) {
    // Endpoint rápido via outputs/work-plan gate ou cards count
    const res = await fetch(`/api/projects/${projectId}/cards?status=READY`);
    if (!res.ok) throw new Error('Failed to get ready count');
    const data = await res.json();
    return { count: Array.isArray(data.cards) ? data.cards.length : data.count || 0 };
  },

  async generate_output(params: { projectId: string; type: 'work-plan' | 'prd' | 'prompt-pack' }) {
    const res = await fetch(`/api/outputs/${params.type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: params.projectId }),
    });
    if (!res.ok) throw new Error('Failed to generate output');
    const data = await res.json();
    return { content: data.content, outputId: data.output?.id };
  },
};



