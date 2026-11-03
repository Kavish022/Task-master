import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  CheckCircle2,
  CheckSquare,
  Clock,
  CircleDot,
  Building2,
  FolderGit2,
  Tag,
  User2,
  Search,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { workspaceService, kanbanService } from '@/services';
import type { TaskStatus, TaskPriority, TaskItem } from '@/types/kanban';
import { Button, Badge, Spinner } from '@/components/ui';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { CreateProjectModal } from './CreateProjectModal';

const COLUMNS: { id: TaskStatus; label: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
  {
    id: 'TODO',
    label: 'To Do',
    icon: CircleDot,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    id: 'IN_PROGRESS',
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    id: 'DONE',
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
];

const PRIORITY_BADGES: Record<TaskPriority, 'default' | 'success' | 'warning' | 'danger'> = {
  LOW: 'default',
  MEDIUM: 'default',
  HIGH: 'warning',
  URGENT: 'danger',
};

export const KanbanBoardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number>(1);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [newTitle, setNewTitle] = useState('');

  // Modals & Drawer State
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');

  // 1. Fetch Workspaces
  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.listWorkspaces(),
  });

  // Auto-select first workspace
  useEffect(() => {
    if (workspaces.length > 0 && workspaces[0] && !workspaces.some((w) => w.id === selectedWorkspaceId)) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  // 2. Fetch Projects for Selected Workspace
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', selectedWorkspaceId],
    queryFn: () => workspaceService.getWorkspaceProjects(selectedWorkspaceId),
    enabled: !!selectedWorkspaceId,
  });

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && projects[0] && !projects.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // 3. Fetch Workspace Members for Assignee Filter
  const { data: members = [] } = useQuery({
    queryKey: ['members', selectedWorkspaceId],
    queryFn: () => workspaceService.getWorkspaceMembers(selectedWorkspaceId),
    enabled: !!selectedWorkspaceId,
  });

  // 4. Fetch Tasks for Selected Project
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => kanbanService.listTasks(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  // 5. Update Task Status Mutation (Drag & Drop or Move)
  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: number; newStatus: TaskStatus }) =>
      kanbanService.updateTaskStatus(taskId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedProjectId] });
      toast.success('Task status updated!');
    },
    onError: () => toast.error('Failed to move task'),
  });

  // 6. Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: (title: string) => kanbanService.createTask(selectedProjectId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedProjectId] });
      setNewTitle('');
      toast.success('Task created successfully!');
    },
    onError: () => toast.error('Failed to create task'),
  });

  // Filter Tasks based on search, priority, assignee
  const filteredTasks = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    return list.filter((task: TaskItem) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesKey = task.taskKey.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesKey && !matchesDesc) return false;
      }

      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false;
      }

      if (assigneeFilter !== 'ALL') {
        if (assigneeFilter === 'UNASSIGNED') {
          if (task.assigneeId) return false;
        } else {
          if (task.assigneeId !== Number(assigneeFilter)) return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('text/plain', taskId.toString());
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData('text/plain'));
    if (taskId) {
      moveTaskMutation.mutate({ taskId, newStatus: status });
    }
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Workspace & Project Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Workspace Select */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
            <Building2 className="h-4 w-4 text-brand-400" />
            <span className="text-xs text-slate-400 font-medium">Workspace:</span>
            <select
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(Number(e.target.value))}
              className="bg-transparent text-slate-100 text-sm font-semibold focus:outline-none cursor-pointer"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                  {w.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsWorkspaceModalOpen(true)}
              title="Create new workspace"
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Project Select */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
            <FolderGit2 className="h-4 w-4 text-indigo-400" />
            <span className="text-xs text-slate-400 font-medium">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="bg-transparent text-slate-100 text-sm font-semibold focus:outline-none cursor-pointer"
            >
              {projects.length === 0 ? (
                <option value={0} className="bg-slate-900 text-slate-500">
                  No projects
                </option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} [{p.key}]
                  </option>
                ))
              )}
            </select>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              title="Create new project"
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Add Task Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newTitle.trim()) createTaskMutation.mutate(newTitle.trim());
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Add task to ${activeProject?.name || 'project'}...`}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={!selectedProjectId}
            className="bg-slate-950 text-slate-200 text-sm rounded-xl px-3.5 py-2 border border-slate-800 focus:outline-none focus:border-brand-500 w-full sm:w-64 placeholder:text-slate-500 disabled:opacity-50"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!selectedProjectId || !newTitle.trim()}
            isLoading={createTaskMutation.isPending}
            leftIcon={<Plus className="h-4 w-4" />}
            className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md shadow-brand-600/20"
          >
            Create
          </Button>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, key, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-300 px-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5 text-brand-400" />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All</option>
              <option value="LOW" className="bg-slate-900 text-white">Low</option>
              <option value="MEDIUM" className="bg-slate-900 text-white">Medium</option>
              <option value="HIGH" className="bg-slate-900 text-white">High</option>
              <option value="URGENT" className="bg-slate-900 text-white">Urgent</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400">
            <User2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Members</option>
              <option value="UNASSIGNED" className="bg-slate-900 text-white">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id} className="bg-slate-900 text-white">
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Pills */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-slate-500" />
              Total: <strong className="text-slate-200">{filteredTasks.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 min-h-[580px] shadow-xl backdrop-blur-sm transition-colors"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-200">
                  <div className={`p-1.5 rounded-lg ${col.bg} border ${col.border}`}>
                    <Icon className={`h-4 w-4 ${col.color}`} />
                  </div>
                  <span>{col.label}</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-semibold">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {isTasksLoading && colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 space-y-2 text-slate-500">
                    <Spinner size="md" variant="primary" />
                    <span className="text-xs">Loading tasks...</span>
                  </div>
                )}

                {colTasks.length === 0 && !isTasksLoading && (
                  <div className="flex flex-col items-center justify-center h-40 border border-dashed border-slate-800/80 rounded-xl text-slate-500 text-xs text-center p-4">
                    <Sparkles className="h-6 w-6 text-slate-600 mb-2" />
                    <span>No tasks in this lane</span>
                    <span className="text-[11px] text-slate-600 mt-1">Drag a task here or create one</span>
                  </div>
                )}

                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setActiveTaskId(task.id)}
                    className="p-4 rounded-xl border border-slate-800/90 bg-slate-900 hover:border-brand-500/50 hover:bg-slate-850 hover:shadow-xl hover:shadow-brand-500/5 cursor-pointer active:cursor-grabbing transition-all space-y-2.5 group transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-brand-400 font-bold tracking-wide">
                        {task.taskKey}
                      </span>
                      <Badge variant={PRIORITY_BADGES[task.priority]}>
                        {task.priority}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors leading-snug">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/70 text-[11px] text-slate-400">
                      {/* Assignee */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <div className="h-5 w-5 rounded-full bg-brand-600/30 text-brand-300 flex items-center justify-center font-bold text-[10px] border border-brand-500/20">
                          {task.assignee?.name?.charAt(0) || <User2 className="h-3 w-3" />}
                        </div>
                        <span className="truncate max-w-[90px]">{task.assignee?.name || 'Unassigned'}</span>
                      </div>

                      {/* Subtasks Count */}
                      {task._count?.subtasks !== undefined && task._count.subtasks > 0 && (
                        <div
                          className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-[10px] text-slate-300"
                          title={`${task._count.subtasks} subtasks`}
                        >
                          <CheckSquare className="h-3 w-3 text-emerald-400" />
                          <span>{task._count.subtasks}</span>
                        </div>
                      )}

                      {/* Labels */}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          <Tag className="h-3 w-3 text-slate-400" />
                          <span className="text-[10px] font-medium text-slate-300">
                            {task.labels.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={activeTaskId}
        workspaceId={selectedWorkspaceId}
        projectId={selectedProjectId}
        onClose={() => setActiveTaskId(null)}
      />

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onCreated={(newWorkspaceId) => setSelectedWorkspaceId(newWorkspaceId)}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        workspaceId={selectedWorkspaceId}
        onClose={() => setIsProjectModalOpen(false)}
        onCreated={(newProjectId) => setSelectedProjectId(newProjectId)}
      />
    </div>
  );
};

export default KanbanBoardPage;
