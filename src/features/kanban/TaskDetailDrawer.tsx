import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Clock,
  User,
  AlertCircle,
  MessageSquare,
  History,
  Trash2,
  Send,
  Save,
  CheckSquare,
  Square,
  ListTodo,
  Link2,
  Plus,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { kanbanService, workspaceService } from '@/services';
import type { TaskStatus, TaskPriority, DependencyType, TaskDetail, TaskItem } from '@/types/kanban';
import { Button, Badge } from '@/components/ui';

interface TaskDetailDrawerProps {
  taskId: number | null;
  workspaceId: number;
  projectId: number;
  onClose: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  taskId,
  workspaceId,
  projectId,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined);

  // Subtasks inline creation state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskAssigneeId, setNewSubtaskAssigneeId] = useState<number | undefined>(undefined);

  // Dependency creation state
  const [newDepTargetId, setNewDepTargetId] = useState<number | undefined>(undefined);
  const [newDepType, setNewDepType] = useState<DependencyType>('BLOCKED_BY');

  // 1. Fetch Task Details (includes subtasks, comments, history, dependencies)
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => kanbanService.getTask(taskId!),
    enabled: !!taskId,
  });

  // Sync state once task data arrives
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId || undefined);
    }
  }, [task]);

  // 2. Fetch Workspace Members for Assignee selection
  const { data: members = [] } = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => workspaceService.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });

  // 3. Fetch all tasks in current project for linking dependencies
  const { data: projectTasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => kanbanService.listTasks(projectId),
    enabled: !!projectId,
  });

  // 4. Fetch Comments
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => kanbanService.listComments(taskId!),
    enabled: !!taskId,
  });

  // 5. Update Task Mutation
  const updateTaskMutation = useMutation({
    mutationFn: () =>
      kanbanService.updateTask(taskId!, {
        title,
        description: description || null,
        status,
        priority,
        assigneeId: assigneeId || null,
        version: task?.version || 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Task updated successfully!');
    },
    onError: () => toast.error('Failed to update task'),
  });

  // 6. Subtask Mutations
  const createSubtaskMutation = useMutation({
    mutationFn: (data: { title: string; assigneeId?: number }) =>
      kanbanService.createSubtask(taskId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setNewSubtaskTitle('');
      setNewSubtaskAssigneeId(undefined);
      toast.success('Subtask added');
    },
    onError: () => toast.error('Failed to create subtask'),
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, completed }: { subtaskId: number; completed?: boolean }) =>
      kanbanService.toggleTask(subtaskId, completed),
    onMutate: async ({ subtaskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['task', taskId] });
      const previousTask = queryClient.getQueryData<TaskDetail>(['task', taskId]);
      if (previousTask && previousTask.subtasks) {
        const nextSubtasks = previousTask.subtasks.map((s) => {
          if (s.id === subtaskId) {
            const nextDone = completed !== undefined ? completed : s.status !== 'DONE';
            return {
              ...s,
              status: (nextDone ? 'DONE' : 'TODO') as TaskStatus,
              completedAt: nextDone ? new Date().toISOString() : null,
            };
          }
          return s;
        });
        queryClient.setQueryData<TaskDetail>(['task', taskId], {
          ...previousTask,
          subtasks: nextSubtasks,
        });
      }
      return { previousTask };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['task', taskId], context.previousTask);
      }
      toast.error('Failed to toggle subtask');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: (subtaskId: number) => kanbanService.deleteTask(subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Subtask deleted');
    },
    onError: () => toast.error('Failed to delete subtask'),
  });

  // 7. Dependency Mutations
  const addDependencyMutation = useMutation({
    mutationFn: ({ targetTaskId, type }: { targetTaskId: number; type: DependencyType }) =>
      kanbanService.addDependency(taskId!, targetTaskId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setNewDepTargetId(undefined);
      toast.success('Dependency linked');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to link dependency');
    },
  });

  const removeDependencyMutation = useMutation({
    mutationFn: (dependencyId: number) => kanbanService.removeDependency(dependencyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Dependency unlinked');
    },
    onError: () => toast.error('Failed to unlink dependency'),
  });

  // 8. Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => kanbanService.addComment(taskId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setCommentContent('');
      toast.success('Comment added!');
    },
    onError: () => toast.error('Failed to post comment'),
  });

  // 9. Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: () => kanbanService.deleteTask(taskId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Task deleted');
      onClose();
    },
    onError: () => toast.error('Failed to delete task'),
  });

  if (!taskId) return null;

  // Subtasks Progress Calculation
  const subtasks = task?.subtasks || [];
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.status === 'DONE').length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Dependency filtering for dropdown (exclude current task and already linked tasks)
  const existingDepIds = new Set([
    taskId,
    ...(task?.dependencies?.map((d) => d.dependsOnTaskId) || []),
    ...(task?.dependentOn?.map((d) => d.taskId) || []),
  ]);
  const availableTargetTasks = projectTasks.filter((t: TaskItem) => !existingDepIds.has(t.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-slideLeft">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20">
              {task?.taskKey || 'TASK'}
            </span>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              v{task?.version || 1}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  deleteTaskMutation.mutate();
                }
              }}
              isLoading={deleteTaskMutation.isPending}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Loading task details...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-base font-semibold text-white focus:outline-none"
              />
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brand-400" /> Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="BACKLOG">Backlog</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" /> Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-400" /> Assignee
                </label>
                <select
                  value={assigneeId || ''}
                  onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this task..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Save Changes Button */}
            <Button
              onClick={() => updateTaskMutation.mutate()}
              isLoading={updateTaskMutation.isPending}
              leftIcon={<Save className="h-4 w-4" />}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-600/30"
            >
              Save Changes
            </Button>

            {/* ======================================================== */}
            {/* SUBTASKS CHECKLIST SECTION */}
            {/* ======================================================== */}
            <div className="pt-6 border-t border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-200">
                  <ListTodo className="h-4 w-4 text-brand-400" />
                  <span>Subtasks</span>
                  {totalSubtasks > 0 && (
                    <span className="text-xs font-normal text-slate-400">
                      ({completedSubtasks} of {totalSubtasks} completed)
                    </span>
                  )}
                </div>
                {totalSubtasks > 0 && (
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {progressPercent}%
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {totalSubtasks > 0 && (
                <div className="h-2 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Subtasks List */}
              <div className="space-y-2">
                {subtasks.map((subtask) => {
                  const isDone = subtask.status === 'DONE';

                  return (
                    <div
                      key={subtask.id}
                      className="group flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-800/90 bg-slate-950/60 hover:bg-slate-950/90 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() =>
                            toggleSubtaskMutation.mutate({
                              subtaskId: subtask.id,
                              completed: !isDone,
                            })
                          }
                          className="text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none shrink-0"
                          title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {isDone ? (
                            <CheckSquare className="h-4.5 w-4.5 text-emerald-400" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-slate-500 group-hover:text-slate-300" />
                          )}
                        </button>

                        {/* Subtask Key Pill */}
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          {subtask.taskKey}
                        </span>

                        {/* Title with strikethrough when done */}
                        <span
                          className={`text-sm truncate transition-colors ${
                            isDone ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </div>

                      {/* Right metadata & delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        {subtask.assignee && (
                          <span className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                            {subtask.assignee.name.split(' ')[0]}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteSubtaskMutation.mutate(subtask.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all rounded"
                          title="Delete subtask"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inline Add Subtask Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newSubtaskTitle.trim()) {
                    createSubtaskMutation.mutate({
                      title: newSubtaskTitle.trim(),
                      assigneeId: newSubtaskAssigneeId,
                    });
                  }
                }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  type="text"
                  placeholder="Add a subtask (press Enter)..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
                <select
                  value={newSubtaskAssigneeId || ''}
                  onChange={(e) =>
                    setNewSubtaskAssigneeId(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-400 focus:outline-none focus:border-brand-500 max-w-[130px] truncate cursor-pointer"
                  title="Assign subtask"
                >
                  <option value="">Assignee</option>
                  {members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name.split(' ')[0]}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newSubtaskTitle.trim()}
                  isLoading={createSubtaskMutation.isPending}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="bg-slate-800 hover:bg-slate-700 text-white shrink-0"
                >
                  Add
                </Button>
              </form>
            </div>

            {/* ======================================================== */}
            {/* DEPENDENCIES & BLOCKERS SECTION */}
            {/* ======================================================== */}
            <div className="pt-6 border-t border-slate-800 space-y-3.5">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-200">
                <Link2 className="h-4 w-4 text-indigo-400" />
                <span>Dependencies & Blockers</span>
              </div>

              {/* Blocked By List (Tasks preventing this task from progressing) */}
              {task?.dependencies && task.dependencies.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" /> Blocked By ({task.dependencies.length})
                  </span>
                  <div className="space-y-1.5">
                    {task.dependencies.map((dep) => (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-slate-200"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="font-mono text-rose-400 font-semibold shrink-0">
                            {dep.dependsOnTask?.taskKey}
                          </span>
                          <span className="truncate">{dep.dependsOnTask?.title}</span>
                          <Badge
                            variant={dep.dependsOnTask?.status === 'DONE' ? 'success' : 'danger'}
                            className="text-[10px]"
                          >
                            {dep.dependsOnTask?.status}
                          </Badge>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDependencyMutation.mutate(dep.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove blocker"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blocks List (Tasks that cannot start until this task completes) */}
              {task?.dependentOn && task.dependentOn.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5" /> Blocks ({task.dependentOn.length})
                  </span>
                  <div className="space-y-1.5">
                    {task.dependentOn.map((dep) => (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-slate-200"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="font-mono text-amber-400 font-semibold shrink-0">
                            {dep.task?.taskKey}
                          </span>
                          <span className="truncate">{dep.task?.title}</span>
                          <Badge variant="warning" className="text-[10px]">
                            {dep.task?.status}
                          </Badge>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDependencyMutation.mutate(dep.id)}
                          className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                          title="Remove dependency"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Dependency Inline Selector */}
              {availableTargetTasks.length > 0 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newDepTargetId) {
                      addDependencyMutation.mutate({
                        targetTaskId: newDepTargetId,
                        type: newDepType,
                      });
                    }
                  }}
                  className="flex items-center gap-2 pt-1"
                >
                  <select
                    value={newDepType}
                    onChange={(e) => setNewDepType(e.target.value as DependencyType)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="BLOCKED_BY">Blocked by</option>
                    <option value="BLOCKS">Blocks</option>
                    <option value="RELATES_TO">Relates to</option>
                  </select>

                  <select
                    value={newDepTargetId || ''}
                    onChange={(e) => setNewDepTargetId(e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Select target task in project...</option>
                    {availableTargetTasks.map((t: TaskItem) => (
                      <option key={t.id} value={t.id}>
                        {t.taskKey}: {t.title}
                      </option>
                    ))}
                  </select>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newDepTargetId}
                    isLoading={addDependencyMutation.isPending}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
                  >
                    Link
                  </Button>
                </form>
              )}
            </div>

            {/* Comments Section */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <MessageSquare className="h-4 w-4 text-brand-400" />
                <span>Discussion ({comments.length})</span>
              </div>

              {/* Add Comment Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (commentContent.trim()) addCommentMutation.mutate(commentContent.trim());
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  isLoading={addCommentMutation.isPending}
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                  className="bg-brand-600 hover:bg-brand-500 text-white"
                >
                  Post
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">{c.user.name}</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail / History */}
            {task?.history && task.history.length > 0 && (
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <History className="h-4 w-4 text-slate-500" />
                  <span>Activity History</span>
                </div>
                <div className="space-y-2">
                  {task.history.map((h) => (
                    <div key={h.id} className="text-xs text-slate-400 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/60">
                      <span className="text-slate-300 font-medium">Changed field &quot;{h.fieldName}&quot;</span> from{' '}
                      <span className="text-slate-400 line-through">{h.oldValue || 'none'}</span> to{' '}
                      <span className="text-emerald-400">{h.newValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailDrawer;
