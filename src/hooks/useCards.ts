'use client';

import { useCallback } from 'react';
import { useCardsStore } from '@/lib/stores/useCardsStore';
import { toast } from '@/lib/stores/useToastStore';
import { mapSupabaseCards, mapSupabaseCardToCard } from '@/lib/utils/mappers';
import type { Card } from '@/types';

export function useCards(projectId: string) {
  const store = useCardsStore();
  
  const loadCards = useCallback(async () => {
    store.setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/cards`);
      if (!res.ok) throw new Error('Failed to load cards');
      const json = await res.json();
      const mappedCards = json.cards ? mapSupabaseCards(json.cards) : [];
      store.setCards(mappedCards);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      store.setLoading(false);
    }
  }, [projectId, store]);
  
  const createCard = useCallback(async (payload: {
    stage_key: string;
    type_key: string;
    title: string;
    summary?: string;
    fields?: Record<string, any>;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
  }) => {
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          ...payload,
        }),
      });
      if (!res.ok) throw new Error('Failed to create card');
      const json = await res.json();
      const mappedCard = mapSupabaseCardToCard(json.card);
      store.addCard(mappedCard);
      toast.success('Card criado', `${payload.title} foi criado com sucesso`);
      return mappedCard;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      store.setError(message);
      toast.error('Erro ao criar card', message);
      throw err;
    }
  }, [projectId, store]);
  
  const updateCard = useCallback(async (cardId: string, updates: {
    title?: string;
    summary?: string;
    fields?: Record<string, any>;
    status?: 'DRAFT' | 'READY';
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  }) => {
    try {
      // Converter position/size para x,y,w,h para a API
      const apiUpdates: any = { ...updates };
      if (updates.position) {
        apiUpdates.x = updates.position.x;
        apiUpdates.y = updates.position.y;
        delete apiUpdates.position;
      }
      if (updates.size) {
        apiUpdates.w = updates.size.width;
        apiUpdates.h = updates.size.height;
        delete apiUpdates.size;
      }

      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiUpdates),
      });
      if (!res.ok) throw new Error('Failed to update card');
      const json = await res.json();
      const mappedCard = mapSupabaseCardToCard(json.card);
      store.updateCard(cardId, mappedCard);
      if (updates.status === 'READY') {
        toast.success('Card confirmado!', 'O card está pronto para ser usado');
      }
      return mappedCard;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      store.setError(message);
      toast.error('Erro ao atualizar card', message);
      throw err;
    }
  }, [store]);
  
  const generateAI = useCallback(async (cardId: string, mode: 'generate' | 'expand' | 'review', prompt?: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, prompt }),
      });
      if (!res.ok) throw new Error('Failed to generate AI content');
      const json = await res.json();
      return json.fields;
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [store]);
  
  const confirmReady = useCallback(async (cardId: string) => {
    return updateCard(cardId, { status: 'READY' });
  }, [updateCard]);

  const deleteCard = useCallback(async (cardId: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete card');
      store.removeCard(cardId);
      toast.success('Card removido', 'O card foi excluído com sucesso');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      store.setError(message);
      toast.error('Erro ao deletar card', message);
      throw err;
    }
  }, [store]);
  
  return {
    cards: store.cards,
    loading: store.loading,
    error: store.error,
    loadCards,
    createCard,
    updateCard,
    deleteCard,
    generateAI,
    confirmReady,
    getCardById: store.getCardById,
    getCardsByStage: store.getCardsByStage,
    getReadyCards: store.getReadyCards,
    getReadyCount: store.getReadyCount,
  };
}

