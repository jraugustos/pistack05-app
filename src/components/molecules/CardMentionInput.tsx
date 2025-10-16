import * as React from 'react';
import { Badge } from '@/components/foundation';
import { Button } from '@/components/foundation';
import { cn } from '@/lib/utils';
import { useCardMentions } from '@/hooks/useCardMentions';
import type { Card } from '@/types';

export interface CardMentionInputProps {
  cards: Card[];
  placeholder?: string;
  onSubmit?: (message: string, mentionedCardIds: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export const CardMentionInput = React.forwardRef<HTMLTextAreaElement, CardMentionInputProps>(
  ({ cards, placeholder = 'Escreva uma mensagem...', onSubmit, disabled, className }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = React.useRef<HTMLDivElement>(null);

    const {
      inputValue,
      showSuggestions,
      suggestions,
      selectedSuggestionIndex,
      handleInputChange,
      handleKeyDown,
      handleSelectSuggestion,
      handleCloseSuggestions,
      extractMentionedCardIds,
      clearInput,
    } = useCardMentions(cards, onSubmit);

    // Expor o clearInput para o componente pai via ref
    React.useImperativeHandle(ref, () => ({
      ...(textareaRef.current as HTMLTextAreaElement),
      clearInput,
    }));

    // Auto-resize textarea
    React.useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, [inputValue]);

    // Scroll sugestão selecionada para view
    React.useEffect(() => {
      if (showSuggestions && suggestionsRef.current) {
        const selectedEl = suggestionsRef.current.children[selectedSuggestionIndex] as HTMLElement;
        if (selectedEl) {
          selectedEl.scrollIntoView({ block: 'nearest' });
        }
      }
    }, [selectedSuggestionIndex, showSuggestions]);

    const handleSubmit = () => {
      if (disabled || !inputValue.trim()) return;

      if (onSubmit) {
        const mentionedIds = extractMentionedCardIds();
        onSubmit(inputValue, mentionedIds);
        clearInput();
      }
    };

    return (
      <div className={cn('relative', className)}>
        {/* Dropdown de Sugestões */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute bottom-full left-0 right-0 mb-2 bg-bg-elev border border-stroke rounded-lg shadow-xl max-h-64 overflow-y-auto z-50"
          >
            <div className="p-2 border-b border-stroke/50">
              <p className="text-xs text-text-dim">Mencionar card:</p>
            </div>
            <div className="py-1">
              {suggestions.map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectSuggestion(card)}
                  className={cn(
                    'w-full text-left px-3 py-2 hover:bg-bg/50 transition-colors',
                    index === selectedSuggestionIndex && 'bg-primary/10'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={card.status === 'READY' ? 'success' : 'draft'}
                      className="text-xs flex-shrink-0"
                    >
                      {card.status}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{card.title}</p>
                      <p className="text-xs text-text-dim truncate">
                        {card.typeKey || card.type_key}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border border-stroke rounded-xl bg-bg-elev/60 backdrop-blur-md glass-effect">
          <div className="flex items-end gap-2 p-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 bg-transparent outline-none px-2 py-2 text-sm resize-none min-h-[40px] max-h-[200px] border-0 focus:ring-0"
              rows={1}
            />
            <Button
              size="sm"
              variant="default"
              onClick={handleSubmit}
              disabled={disabled || !inputValue.trim()}
              className="flex-shrink-0 mb-1"
            >
              Enviar
            </Button>
          </div>
        </div>

        {/* Hint de @ */}
        {!showSuggestions && inputValue.length === 0 && (
          <div className="absolute bottom-full left-0 mb-1 text-xs text-text-dim">
            <span className="bg-bg/80 px-2 py-1 rounded">
              💡 Dica: Digite <kbd className="px-1 py-0.5 bg-stroke/30 rounded text-xs">@</kbd> para mencionar cards
            </span>
          </div>
        )}
      </div>
    );
  }
);

CardMentionInput.displayName = 'CardMentionInput';
