// validators/user.validator.ts
import Joi from 'joi';
import { UserRole } from '../types';

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  avatar: Joi.string().uri().optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  organizationId: Joi.string().hex().length(24).optional()
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().optional(),
  avatar: Joi.string().uri().optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional()
});
