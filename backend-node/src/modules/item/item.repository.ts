import { Item, Prisma, ItemStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { CreateItemInput, UpdateItemInput, ListItemsQuery } from './item.validation';

const itemIncludeUser = Prisma.validator<Prisma.ItemInclude>()({
  user: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
});

export type ItemWithUser = Prisma.ItemGetPayload<{
  include: typeof itemIncludeUser;
}>;

export interface ItemStats {
  total: number;
  draft: number;
  inProgress: number;
  completed: number;
}

export class ItemRepository {
  static async create(data: CreateItemInput & { userId?: number }): Promise<ItemWithUser> {
    return prisma.item.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        status: data.status,
        priority: data.priority,
        userId: data.userId ?? null,
      },
      include: itemIncludeUser,
    });
  }

  static async findById(id: number): Promise<ItemWithUser | null> {
    return prisma.item.findUnique({
      where: { id },
      include: itemIncludeUser,
    });
  }

  static async findManyPaginated(query: ListItemsQuery, userId?: number) {
    const { page, limit, search, status, priority, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
      ...(userId ? { userId } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: itemIncludeUser,
      }),
      prisma.item.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async update(id: number, data: UpdateItemInput): Promise<ItemWithUser> {
    return prisma.item.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
      },
      include: itemIncludeUser,
    });
  }

  static async delete(id: number): Promise<Item> {
    return prisma.item.delete({
      where: { id },
    });
  }

  static async getStats(userId?: number): Promise<ItemStats> {
    const where: Prisma.ItemWhereInput = userId ? { userId } : {};

    const [total, draft, inProgress, completed] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.count({ where: { ...where, status: ItemStatus.draft } }),
      prisma.item.count({ where: { ...where, status: ItemStatus.in_progress } }),
      prisma.item.count({ where: { ...where, status: ItemStatus.completed } }),
    ]);

    return {
      total,
      draft,
      inProgress,
      completed,
    };
  }
}

