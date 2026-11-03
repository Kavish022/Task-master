import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { workspaceService } from '@/services';
import { Modal, Button, Input } from '@/components/ui';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (workspaceId: number) => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    );
  };

  const createMutation = useMutation({
    mutationFn: () =>
      workspaceService.createWorkspace({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace created successfully!');
      setName('');
      setSlug('');
      setDescription('');
      onClose();
      if (onCreated && newWorkspace?.id) {
        onCreated(newWorkspace.id);
      }
    },
    onError: () => {
      toast.error('Failed to create workspace');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    createMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workspace"
      description="Workspaces group projects, team members, and permissions together."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Workspace Name"
          placeholder="e.g. Acme Corp or Mobile App Team"
          value={name}
          onChange={handleNameChange}
          startIcon={<Building2 className="h-4 w-4 text-slate-400" />}
          required
        />

        <Input
          label="URL Slug"
          placeholder="e.g. acme-corp"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          helperText="Unique identifier used in URLs and identifiers"
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the workspace purpose..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={createMutation.isPending}
            className="bg-brand-600 hover:bg-brand-500 text-white"
          >
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};
