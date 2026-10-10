import { UserModel } from './users.model.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export const usersService = {
  async getById(userId: string) {
    const user = await UserModel.findById(userId).select('-passwordHash');
    if (!user) throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    return user;
  },

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string }) {
    const user = await UserModel.findByIdAndUpdate(userId, data, { new: true }).select('-passwordHash');
    return user;
  }
};
