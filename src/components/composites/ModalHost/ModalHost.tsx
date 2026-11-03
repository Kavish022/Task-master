import React, { useState } from 'react';
import { useModalStore } from '@/store/slices/modal.slice';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ItemFormModal } from '@/features/items/components/ItemFormModal';
import { useCreateItemMutation, useUpdateItemMutation } from '@/features/items/hooks';
import type { Item } from '@/features/items/types';
import type { ItemFormData } from '@/features/items/schemas';

/**
 * Global Modal Host: Renders the active application modal centrally.
 * Any page or component opens modals via `useModalStore.getState().openModal(...)`.
 */
export const ModalHost: React.FC = () => {
  const isOpen = useModalStore((state) => state.isOpen);
  const type = useModalStore((state) => state.type);
  const props = useModalStore((state) => state.props);
  const closeModal = useModalStore((state) => state.closeModal);

  const [isActionPending, setIsActionPending] = useState(false);

  // Wire feature mutations centrally for the host
  const { mutate: createItem, isPending: isCreating } = useCreateItemMutation();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItemMutation();

  if (!isOpen || !type) {
    return null;
  }

  // Handle generic confirmation dialogs
  if (type === 'CONFIRM_DELETE') {
    const handleConfirm = async () => {
      const onConfirm = props['onConfirm'] as (() => Promise<void> | void) | undefined;
      if (onConfirm) {
        try {
          setIsActionPending(true);
          await onConfirm();
          closeModal();
        } finally {
          setIsActionPending(false);
        }
      } else {
        closeModal();
      }
    };

    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={String(props['title'] || 'Confirm Action')}
        description={String(props['description'] || 'Are you sure you want to proceed?')}
        confirmText={String(props['confirmText'] || 'Confirm')}
        cancelText={String(props['cancelText'] || 'Cancel')}
        variant="danger"
        isLoading={isActionPending}
      />
    );
  }

  // Handle Item Form modal (Create / Edit)
  if (type === 'ITEM_FORM') {
    const itemToEdit = props['itemToEdit'] as Item | null | undefined;

    const handleFormSubmit = (formData: ItemFormData) => {
      if (itemToEdit) {
        updateItem(
          { id: itemToEdit.id, dto: formData },
          {
            onSuccess: () => {
              closeModal();
            },
          }
        );
      } else {
        createItem(formData, {
          onSuccess: () => {
            closeModal();
          },
        });
      }
    };

    return (
      <ItemFormModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
        itemToEdit={itemToEdit}
      />
    );
  }

  return null;
};

export default ModalHost;
