import * as React from 'react';
import type { Card } from '@/types';

export interface CardMention {
  id: string;
  title: string;
  typeKey: string;
  startIndex: number;
  endIndex: number;
}

export interface UseCardMentionsResult {
  // Estado
  inputValue: string;
  mentions: CardMention[];
  showSuggestions: boolean;
  suggestions: Card[];
  selectedSuggestionIndex: number;
  cursorPosition: number | null;

  // Handlers
  handleInputChange: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleSelectSuggestion: (card: Card) => void;
  handleCloseSuggestions: () => void;

  // Utilidades
  extractMentionedCardIds: () => string[];
  clearInput: () => void;
}

/**
 * Hook para gerenciar menções de cards com "@"
 * Formato: @[Card Name](#cardId)
 */
export function useCardMentions(
  cards: Card[],
  onSubmit?: (message: string, mentionedCardIds: string[]) => void
): UseCardMentionsResult {
  const [inputValue, setInputValue] = React.useState('');
  const [mentions, setMentions] = React.useState<CardMention[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Card[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(0);
  const [cursorPosition, setCursorPosition] = React.useState<number | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = React.useState<number | null>(null);

  // Detectar "@" e mostrar sugestões
  const handleInputChange = React.useCallback((value: string) => {
    setInputValue(value);

    // Pegar posição do cursor (assumindo que está no final do texto por enquanto)
    const cursorPos = value.length;
    setCursorPosition(cursorPos);

    // Detectar se há "@" antes do cursor
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Verificar se não há espaço entre @ e cursor
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        // Está digitando uma menção
        setMentionStartIndex(lastAtIndex);
        setShowSuggestions(true);

        // Filtrar cards baseado no texto após @
        const query = textAfterAt.toLowerCase();
        const filtered = cards.filter(card =>
          card.title.toLowerCase().includes(query) ||
          (card.typeKey || card.type_key || '').toLowerCase().includes(query)
        ).slice(0, 5); // Limitar a 5 sugestões

        setSuggestions(filtered);
        setSelectedSuggestionIndex(0);
      } else {
        setShowSuggestions(false);
        setMentionStartIndex(null);
      }
    } else {
      setShowSuggestions(false);
      setMentionStartIndex(null);
    }
  }, [cards]);

  // Navegar pelas sugestões com teclado
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      // Enter sem sugestões → submit
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (onSubmit && inputValue.trim()) {
          const mentionedIds = extractMentionedCardIds();
          onSubmit(inputValue, mentionedIds);
          setInputValue('');
          setMentions([]);
        }
      }
      return;
    }

    // Navegação nas sugestões
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCloseSuggestions();
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, inputValue, onSubmit]);

  // Selecionar uma sugestão e inserir menção
  const handleSelectSuggestion = React.useCallback((card: Card) => {
    if (mentionStartIndex === null) return;

    // Formato visível: @[Card Name]
    const mention = `@[${card.title}]`;

    // Substituir @texto por @[Card Name]
    const before = inputValue.slice(0, mentionStartIndex);
    const after = inputValue.slice(cursorPosition || inputValue.length);
    const newValue = before + mention + ' ' + after;

    setInputValue(newValue);

    // Adicionar à lista de menções (guardamos o ID separadamente)
    const newMention: CardMention = {
      id: card.id,
      title: card.title,
      typeKey: card.typeKey || card.type_key || '',
      startIndex: mentionStartIndex,
      endIndex: mentionStartIndex + mention.length,
    };
    setMentions(prev => [...prev, newMention]);

    // Fechar sugestões
    setShowSuggestions(false);
    setMentionStartIndex(null);
    setSelectedSuggestionIndex(0);
  }, [inputValue, mentionStartIndex, cursorPosition]);

  // Fechar sugestões
  const handleCloseSuggestions = React.useCallback(() => {
    setShowSuggestions(false);
    setMentionStartIndex(null);
    setSelectedSuggestionIndex(0);
  }, []);

  // Extrair IDs dos cards mencionados
  const extractMentionedCardIds = React.useCallback((): string[] => {
    // 1. Usar o array de menções que mantém os IDs
    const mentionIds = mentions.map(mention => mention.id);

    // 2. Também parsear menções digitadas manualmente no formato @[Card Name]
    const manualMentionRegex = /@\[([^\]]+)\]/g;
    const matches = [...inputValue.matchAll(manualMentionRegex)];

    for (const match of matches) {
      const cardName = match[1];
      // Procurar card por título
      const foundCard = cards.find(c => c.title === cardName);
      if (foundCard && !mentionIds.includes(foundCard.id)) {
        mentionIds.push(foundCard.id);
      }
    }

    return mentionIds;
  }, [mentions, inputValue, cards]);

  // Limpar input
  const clearInput = React.useCallback(() => {
    setInputValue('');
    setMentions([]);
    setShowSuggestions(false);
    setMentionStartIndex(null);
  }, []);

  return {
    inputValue,
    mentions,
    showSuggestions,
    suggestions,
    selectedSuggestionIndex,
    cursorPosition,
    handleInputChange,
    handleKeyDown,
    handleSelectSuggestion,
    handleCloseSuggestions,
    extractMentionedCardIds,
    clearInput,
  };
}
