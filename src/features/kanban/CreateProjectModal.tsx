import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderGit2, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { workspaceService } from '@/services';
import { Modal, Button, Input } from '@/components/ui';

interface CreateProjectModalProps {
  isOpen: boolean;
  workspaceId: number;
  onClose: () => void;
  onCreated?: (projectId: number) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  workspaceId,
  onClose,
  onCreated,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto-generate project key like "ENG" or "PROJ" from words
    const words = val.trim().split(/\s+/).filter(Boolean);
    let autoKey = '';
    if (words.length === 1 && words[0]) {
      autoKey = words[0].slice(0, 4).toUpperCase();
    } else if (words.length > 1) {
      autoKey = words.map((w) => w[0] || '').join('').slice(0, 4).toUpperCase();
    }
    setKey(autoKey.replace(/[^A-Z0-9]/g, ''));
  };

  const createMutation = useMutation({
    mutationFn: () =>
      workspaceService.createProject(workspaceId, {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || undefined,
      }),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success('Project created successfully!');
      setName('');
      setKey('');
      setDescription('');
      onClose();
      if (onCreated && newProject?.id) {
        onCreated(newProject.id);
      }
    },
    onError: () => {
      toast.error('Failed to create project');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }
    if (!key.trim()) {
      toast.error('Project key is required');
      return;
    }
    createMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Projects organize tasks, boards, and milestones within your workspace."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Project Name"
          placeholder="e.g. Core Engine or Mobile App"
          value={name}
          onChange={handleNameChange}
          startIcon={<FolderGit2 className="h-4 w-4 text-slate-400" />}
          required
        />

        <Input
          label="Project Key (Prefix for Task IDs)"
          placeholder="e.g. CORE or MOB"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          startIcon={<Key className="h-4 w-4 text-slate-400" />}
          helperText="Short uppercase key used for task codes like CORE-101"
          maxLength={10}
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
            placeholder="What is this project focused on?"
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
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
