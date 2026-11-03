import { UserRepository } from './user.repository';
import { UpdateUserProfileInput, ListUsersQuery } from './user.validation';
import { NotFoundError } from '../../utils/apiError';

export class UserService {
  static async getProfile(userId: number) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  static async updateProfile(userId: number, input: UpdateUserProfileInput) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return UserRepository.update(userId, input);
  }

  static async listUsers(query: ListUsersQuery) {
    return UserRepository.findManyPaginated(query);
  }
}
