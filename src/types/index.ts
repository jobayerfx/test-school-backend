import { Request } from 'express';

// User related types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  role: UserRole;
  refreshTokens: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

// Authentication types
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface IVerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ISendOTPRequest {
  email?: string;
  phone?: string;
  type: 'email' | 'phone';
}

export interface IResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

// JWT Payload
export interface IJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

// Extended Request with user
export interface IAuthenticatedRequest extends Request {
  user?: IUser;
}

// OTP types
export interface IOTP {
  _id: string;
  email?: string;
  phone?: string;
  otp: string;
  type: 'email' | 'phone';
  purpose: 'email_verification' | 'password_reset';
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

// API Response types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Rate limiting types
export interface IRateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
} 