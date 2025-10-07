'use client';

import { create } from 'zustand';
import type { Card } from '@/types';

interface CardsState {
  cards: Card[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCards: (cards: Card[]) => void;
  addCard: (card: Card) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  removeCard: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getCardById: (id: string) => Card | undefined;
  getCardsByStage: (stageKey: string) => Card[];
  getReadyCards: () => Card[];
  getReadyCount: () => number;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  loading: false,
  error: null,
  
  setCards: (cards) => set({ cards, error: null }),
  
  addCard: (card) => set((state) => ({ 
    cards: [...state.cards, card],
    error: null 
  })),
  
  updateCard: (id, updates) => set((state) => ({
    cards: state.cards.map((card) => 
      card.id === id ? { ...card, ...updates } : card
    ),
    error: null
  })),
  
  removeCard: (id) => set((state) => ({
    cards: state.cards.filter((card) => card.id !== id),
    error: null
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error, loading: false }),
  
  // Computed
  getCardById: (id) => get().cards.find((card) => card.id === id),
  
  getCardsByStage: (stageKey) => 
    get().cards.filter((card) => card.stageKey === stageKey),
  
  getReadyCards: () => 
    get().cards.filter((card) => card.status === 'READY'),
  
  getReadyCount: () => 
    get().cards.filter((card) => card.status === 'READY').length,
}));

