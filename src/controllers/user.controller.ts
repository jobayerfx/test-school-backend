import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import ApiError from '../utils/ApiError';
import { IAuthenticatedRequest } from '../types';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Allow only admin or self
    if (!req.user || (req.user.role !== 'admin' && req.user._id !== id)) {
      throw new ApiError(403, 'Forbidden');
    }

    const user = await userService.getUserById(id);
    if (!user) throw new ApiError(404, 'User not found');

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Allow only admin or self
    const user = (req as any).user;
    if (!user || (user.role !== 'admin' && user._id !== id)) {
      throw new ApiError(403, 'Forbidden');
    }

    const updatedUser = await userService.updateUser(id, req.body);
    if (!updatedUser) throw new ApiError(404, 'User not found');

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const getUsersPaginated = async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ApiError(403, 'Forbidden');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await userService.getAllUsers(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
