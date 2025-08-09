import { User, IUserDocument } from '../models/user.model';
import mongoose from 'mongoose';

export const getUserById = async (id: string): Promise<IUserDocument | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return User.findById(id).select('-password');
};

export const updateUser = async (id: string, data: Partial<IUserDocument>): Promise<IUserDocument | null> => {
  return User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};

export const getAllUsers = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const users = await User.find().select('-password').skip(skip).limit(limit);
  const total = await User.countDocuments();
  return { users, total, page, totalPages: Math.ceil(total / limit) };
};

export const createUser = async (data: IUserDocument): Promise<IUserDocument> => {
  return User.create(data);
};