import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/foundation';
import { IconButton } from '@/components/foundation';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = 'Buscar...', className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div className={cn('relative w-full max-w-md', className)}>
        <Input
          ref={ref}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          prefix={<Search className="h-4 w-4 text-text-dim" />}
          suffix={
            value && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 hover:bg-bg-elev"
                aria-label="Limpar busca"
              >
                <X className="h-3 w-3" />
              </IconButton>
            )
          }
          className="pr-8"
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };


