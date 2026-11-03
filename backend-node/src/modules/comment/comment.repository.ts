import { prisma } from '../../config/db';
import { CreateCommentInput, UpdateCommentInput } from './comment.validation';

export class CommentRepository {
  static async findById(id: number) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  static async listByTaskId(taskId: number) {
    return prisma.comment.findMany({
      where: { taskId, deletedAt: null },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async create(taskId: number, userId: number, input: CreateCommentInput) {
    return prisma.comment.create({
      data: {
        taskId,
        userId,
        content: input.content,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  static async update(id: number, input: UpdateCommentInput) {
    return prisma.comment.update({
      where: { id },
      data: {
        content: input.content,
        isEdited: true,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  static async softDelete(id: number) {
    return prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
