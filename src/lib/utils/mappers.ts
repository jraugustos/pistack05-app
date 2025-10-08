import type { Card, Edge } from '@/types';

/**
 * Mapeia um card do formato Supabase (snake_case) para o formato TypeScript (camelCase)
 */
export function mapSupabaseCardToCard(supabaseCard: any): Card {
  return {
    id: supabaseCard.id,
    projectId: supabaseCard.project_id,
    stageKey: supabaseCard.stage_key,
    typeKey: supabaseCard.type_key,
    title: supabaseCard.title,
    summary: supabaseCard.summary,
    fields: supabaseCard.fields || {},
    status: supabaseCard.status,
    position: {
      x: supabaseCard.x || 80,
      y: supabaseCard.y || 80,
    },
    size: {
      width: supabaseCard.w || 360,
      height: supabaseCard.h || 240,
    },
    version: supabaseCard.version || 1,
    createdAt: new Date(supabaseCard.created_at),
    updatedAt: new Date(supabaseCard.updated_at),
  };
}

/**
 * Mapeia um array de cards do Supabase
 */
export function mapSupabaseCards(supabaseCards: any[]): Card[] {
  return supabaseCards.map(mapSupabaseCardToCard);
}

/**
 * Mapeia um edge do formato Supabase (snake_case) para o formato TypeScript (camelCase)
 */
export function mapSupabaseEdgeToEdge(supabaseEdge: any): Edge {
  return {
    id: supabaseEdge.id,
    projectId: supabaseEdge.project_id,
    sourceCardId: supabaseEdge.source_card_id,
    targetCardId: supabaseEdge.target_card_id,
    label: supabaseEdge.label,
    createdAt: new Date(supabaseEdge.created_at),
    updatedAt: new Date(supabaseEdge.updated_at),
  };
}

/**
 * Mapeia um array de edges do Supabase
 */
export function mapSupabaseEdges(supabaseEdges: any[]): Edge[] {
  return supabaseEdges.map(mapSupabaseEdgeToEdge);
}
