import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/foundation';
import { Textarea } from '@/components/foundation';
import { cn } from '@/lib/utils';

export interface EditFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  fieldLabel: string;
  fieldValue: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function EditFieldModal({
  isOpen,
  onClose,
  onSave,
  fieldLabel,
  fieldValue,
  placeholder,
  icon,
}: EditFieldModalProps) {
  const [value, setValue] = React.useState(fieldValue);
  const [mounted, setMounted] = React.useState(false);

  // Garantir que está montado no cliente
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Atualizar valor quando fieldValue mudar
  React.useEffect(() => {
    setValue(fieldValue);
  }, [fieldValue]);

  // Prevenir scroll do body quando modal está aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  const handleCancel = () => {
    setValue(fieldValue); // Reverter para valor original
    onClose();
  };

  // Escape key para fechar
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, fieldValue]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-bg-elev rounded-lg border border-stroke shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stroke">
          <div className="flex items-center gap-2">
            {icon && <div className="text-primary">{icon}</div>}
            <h3 className="text-lg font-semibold text-text">{fieldLabel}</h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-text-dim hover:text-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={12}
            className="w-full resize-none font-normal"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-stroke">
          <Button variant="ghost" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );

  // Renderizar em portal no body
  return createPortal(modalContent, document.body);
}
