import type { Card } from '@/types';

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
    summary: supabaseCard.summary || '',
    fields: supabaseCard.fields || {},
    status: supabaseCard.status,
    x: supabaseCard.x || 0,
    y: supabaseCard.y || 0,
    w: supabaseCard.w || 360,
    h: supabaseCard.h || 240,
    createdAt: supabaseCard.created_at,
    updatedAt: supabaseCard.updated_at,
  };
}

/**
 * Mapeia um array de cards do Supabase
 */
export function mapSupabaseCards(supabaseCards: any[]): Card[] {
  return supabaseCards.map(mapSupabaseCardToCard);
}

