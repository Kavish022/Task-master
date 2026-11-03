import { describe, it, expect, beforeEach } from 'vitest';
import { useModalStore } from './modal.slice';

describe('Modal Host Store Slice', () => {
  beforeEach(() => {
    useModalStore.getState().closeModal();
  });

  it('initializes with modal closed', () => {
    const state = useModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.type).toBeNull();
    expect(state.props).toEqual({});
  });

  it('opens modal with requested type and payload', () => {
    useModalStore.getState().openModal('CONFIRM_DELETE', {
      title: 'Delete Item',
      description: 'Are you sure?',
      onConfirm: () => {},
    });

    const state = useModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.type).toBe('CONFIRM_DELETE');
    expect(state.props['title']).toBe('Delete Item');
  });

  it('resets state when closeModal is called', () => {
    useModalStore.getState().openModal('ITEM_FORM', { itemToEdit: null });
    expect(useModalStore.getState().isOpen).toBe(true);

    useModalStore.getState().closeModal();
    const state = useModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.type).toBeNull();
  });
});
