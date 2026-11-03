import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';

describe('LoadingScreen Component', () => {
  it('renders with default loading message', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('Loading application...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingScreen message="Welcome back! Preparing your workspace..." />);
    expect(screen.getByText('Welcome back! Preparing your workspace...')).toBeInTheDocument();
  });

  it('renders in fullScreen mode by default with fixed overlay', () => {
    const { container } = render(<LoadingScreen />);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).toContain('fixed inset-0');
  });

  it('renders inline when fullScreen is false', () => {
    const { container } = render(<LoadingScreen fullScreen={false} />);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).not.toContain('fixed inset-0');
    expect(rootDiv.className).toContain('min-h-[300px]');
  });
});

