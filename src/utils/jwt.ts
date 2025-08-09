import jwt from 'jsonwebtoken';
import { IJWTPayload, IAuthTokens, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

// Access token expires in 15 minutes
const ACCESS_TOKEN_EXPIRES_IN = '15m';
// Refresh token expires in 7 days
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export const generateAccessToken = (userId: string, email: string, role: UserRole): string => {
  const payload: IJWTPayload = {
    userId,
    email,
    role,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
};

export const generateRefreshToken = (userId: string, email: string, role: UserRole): string => {
  const payload: IJWTPayload = {
    userId,
    email,
    role,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
};

export const generateTokens = (userId: string, email: string, role: UserRole): IAuthTokens => {
  const accessToken = generateAccessToken(userId, email, role);
  const refreshToken = generateRefreshToken(userId, email, role);

  return {
    accessToken,
    refreshToken
  };
};

export const verifyAccessToken = (token: string): IJWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IJWTPayload;
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): IJWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as IJWTPayload;
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const decodeToken = (token: string): IJWTPayload => {
  return jwt.decode(token) as IJWTPayload;
}; 