import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/user.model';
import { IAuthenticatedRequest } from '../types';

export const authenticate = async (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'No token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'Invalid token'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid access token',
      error: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
};

export const requireEmailVerification = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'User not authenticated'
    });
    return;
  }

  if (!req.user.isEmailVerified) {
    res.status(403).json({
      success: false,
      message: 'Email verification required',
      error: 'Please verify your email address before accessing this resource'
    });
    return;
  }

  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};

// Specific role middleware functions
export const requireAdmin = requireRole(['admin']);
export const requireTeacher = requireRole(['admin', 'teacher']);
export const requireStudent = requireRole(['admin', 'teacher', 'student']); 