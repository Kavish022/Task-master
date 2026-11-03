import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Layers, LayoutGrid, Table as TableIcon, Edit2, Trash2 } from 'lucide-react';
import { useItemsQuery, useDeleteItemMutation } from './hooks';
import type { Item, ItemStatus } from './types';
import { useModalStore } from '@/store';
import {
  Button,
  SearchBox,
  DataTable,
  Badge,
  type ColumnDef,
  type BadgeVariant,
} from '@/components';
import { formatDate } from '@/lib/utils';
import { ItemCard } from './components/ItemCard';

const statusBadgeMap: Record<ItemStatus, { variant: BadgeVariant; label: string }> = {
  draft: { variant: 'default', label: 'Draft' },
  in_progress: { variant: 'warning', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
};

export const ItemsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Global centralized modal host action
  const openModal = useModalStore((state) => state.openModal);

  // TanStack Query server state (bound to IItemRepository)
  const {
    data: items = [],
    isLoading,
    refetch,
    isFetching,
  } = useItemsQuery({
    search: searchTerm || undefined,
    status: selectedStatus,
  });

  const { mutate: deleteItem } = useDeleteItemMutation();

  const handleOpenCreateModal = useCallback(() => {
    openModal('ITEM_FORM', { itemToEdit: null });
  }, [openModal]);

  const handleOpenEditModal = useCallback((item: Item) => {
    openModal('ITEM_FORM', { itemToEdit: item });
  }, [openModal]);

  const handleDeletePrompt = useCallback((item: Item) => {
    openModal('CONFIRM_DELETE', {
      title: 'Delete Item',
      description: `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: () => deleteItem(item.id),
    });
  }, [openModal, deleteItem]);

  const statusTabs: Array<{ id: ItemStatus | 'all'; label: string }> = useMemo(
    () => [
      { id: 'all', label: 'All Items' },
      { id: 'draft', label: 'Drafts' },
      { id: 'in_progress', label: 'In Progress' },
      { id: 'completed', label: 'Completed' },
    ],
    []
  );

  // Table Columns Definition for Layer 2 DataTable
  const columns: ColumnDef<Item & Record<string, unknown>>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title & Summary',
        render: (item) => (
          <div>
            <Link
              to={`/items/${item.id}`}
              className="font-medium text-slate-900 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-400"
            >
              {item.title}
            </Link>
            <p className="line-clamp-1 text-xs text-slate-400">{item.description}</p>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item) => {
          const info = statusBadgeMap[item.status as ItemStatus] || {
            variant: 'default',
            label: String(item.status),
          };
          return <Badge variant={info.variant}>{info.label}</Badge>;
        },
      },
      {
        key: 'priority',
        header: 'Priority',
        render: (item) => (
          <span className="text-xs font-medium capitalize text-slate-600 dark:text-slate-300">
            {String(item.priority)}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created Date',
        render: (item) => (
          <span className="text-xs text-slate-400">{formatDate(String(item.createdAt))}</span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        render: (item) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal(item as Item);
              }}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Edit item"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePrompt(item as Item);
              }}
              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
              aria-label="Delete item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [handleDeletePrompt, handleOpenEditModal]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Items Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Engineered with a 3-layer component hierarchy and integration-agnostic service contracts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md p-1.5 ${
                viewMode === 'table'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Table view"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1.5 ${
                viewMode === 'grid'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Item
          </Button>
        </div>
      </div>

      {/* Filter and Shared SearchBox */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedStatus === tab.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Layer 2 Debounced SearchBox Wrapper */}
        <div className="w-full sm:w-72">
          <SearchBox
            placeholder="Search items..."
            onSearch={setSearchTerm}
            isLoading={isFetching}
          />
        </div>
      </div>

      {/* Presentation Layer: DataTable or Card Grid */}
      {viewMode === 'table' ? (
        <DataTable
          data={items as (Item & Record<string, unknown>)[]}
          columns={columns}
          isLoading={isLoading}
          emptyTitle="No items found"
          emptyDescription="Your catalog is currently empty or no items matched your search filter."
          emptyAction={
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create First Item
            </Button>
          }
        />
      ) : items.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center dark:border-slate-800">
          <Layers className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No items available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={handleOpenEditModal}
              onDelete={handleDeletePrompt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemsPage;
