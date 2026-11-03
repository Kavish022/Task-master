import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchBox } from './SearchBox';

describe('SearchBox Composite Component', () => {
  it('renders with default placeholder', () => {
    render(<SearchBox onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search records...')).toBeInTheDocument();
  });

  it('debounces input changes before calling onSearch', async () => {
    vi.useFakeTimers();
    const handleSearch = vi.fn();

    render(<SearchBox onSearch={handleSearch} debounceMs={300} />);
    const input = screen.getByTestId('search-box-input');

    fireEvent.change(input, { target: { value: 'arch' } });

    // Not called immediately due to debounce
    expect(handleSearch).not.toHaveBeenCalled();

    // Fast-forward debounce timer
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(handleSearch).toHaveBeenCalledWith('arch');
    vi.useRealTimers();
  });

  it('clears query and triggers onSearch when clear button is clicked', () => {
    const handleSearch = vi.fn();
    render(<SearchBox value="initial text" onSearch={handleSearch} />);

    const clearButton = screen.getByTestId('search-box-clear');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(handleSearch).toHaveBeenCalledWith('');
  });
});
