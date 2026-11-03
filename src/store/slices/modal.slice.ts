import { create } from 'zustand';
import type { Item } from '@/features/items/types';

export type ModalType =
  | 'ITEM_FORM'
  | 'CONFIRM_DELETE'
  | null;

export interface ModalPayloadMap {
  ITEM_FORM: {
    itemToEdit?: Item | null;
  };
  CONFIRM_DELETE: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => Promise<void> | void;
  };
}

export interface ModalState {
  type: ModalType;
  props: Record<string, unknown>;
  isOpen: boolean;

  openModal: <T extends keyof ModalPayloadMap>(
    type: T,
    props: ModalPayloadMap[T]
  ) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  props: {},
  isOpen: false,

  openModal: (type, props) =>
    set({
      type,
      props: props as Record<string, unknown>,
      isOpen: true,
    }),

  closeModal: () =>
    set({
      type: null,
      props: {},
      isOpen: false,
    }),
}));

export const selectModalType = (state: ModalState) => state.type;
export const selectModalProps = (state: ModalState) => state.props;
export const selectIsModalOpen = (state: ModalState) => state.isOpen;
