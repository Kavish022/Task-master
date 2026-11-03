import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { PaginatedResult } from '../../types/api.types';
import { ListUsersQuery } from './user.validation';

const safeUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  accountStatus: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type SafeUser = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;

export class UserRepository {
  static async findById(id: number): Promise<SafeUser | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: safeUserSelect,
    });
  }

  static async update(
    id: number,
    data: Prisma.UserUpdateInput
  ): Promise<SafeUser> {
    return prisma.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  }

  static async findManyPaginated(
    query: ListUsersQuery
  ): Promise<PaginatedResult<SafeUser>> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: safeUserSelect,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

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
}
