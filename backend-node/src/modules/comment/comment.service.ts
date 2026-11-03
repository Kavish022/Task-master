import { prisma } from '../../config/db';
import { CommentRepository } from './comment.repository';
import { CreateCommentInput, UpdateCommentInput } from './comment.validation';
import { NotFoundError, ForbiddenError } from '../../utils/apiError';

export class CommentService {
  static async addComment(taskId: number, userId: number, input: CreateCommentInput) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return CommentRepository.create(taskId, userId, input);
  }

  static async listComments(taskId: number) {
    return CommentRepository.listByTaskId(taskId);
  }

  static async updateComment(commentId: number, userId: number, input: UpdateCommentInput) {
    const comment = await CommentRepository.findById(commentId);

    if (!comment || comment.deletedAt) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    return CommentRepository.update(commentId, input);
  }

  static async deleteComment(commentId: number, userId: number) {
    const comment = await CommentRepository.findById(commentId);

    if (!comment || comment.deletedAt) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await CommentRepository.softDelete(commentId);
  }
}
