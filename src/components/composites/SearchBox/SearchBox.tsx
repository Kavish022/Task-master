import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export interface SearchBoxProps {
  value?: string;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  onSearch: (query: string) => void;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value = '',
  placeholder = 'Search records...',
  debounceMs = 300,
  isLoading = false,
  onSearch,
  className,
}) => {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative w-full ${className ?? ''}`}>
      <Input
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        data-testid="search-box-input"
        startIcon={
          isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <Search className="h-4 w-4 text-slate-400" />
          )
        }
        endIcon={
          query ? (
            <button
              type="button"
              onClick={handleClear}
              data-testid="search-box-clear"
              className="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
      />
    </div>
  );
};

export default SearchBox;
