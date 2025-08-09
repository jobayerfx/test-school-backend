import { Request, Response } from 'express';
import { User, IUserDocument } from '../models/user.model';
import { OTP, IOTPDocument } from '../models/OTP.model';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { createOTP, validateOTP, markOTPAsUsed } from '../utils/otp';
import { emailService } from '../services/email.service';
import { IApiResponse, IAuthenticatedRequest } from '../types';

export class AuthController {
  // POST /auth/register
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const response: IApiResponse = {
          success: false,
          message: 'User already exists',
          error: 'Email is already registered'
        };
        res.status(409).json(response);
        return;
      }

      // Create new user
      const user = new User({
        name,
        email,
        password
      });

      await user.save();

      // Generate OTP for email verification
      const otpDocument = await createOTP(email, 'email_verification');
      
      // Send verification email
      await emailService.sendOTP(email, otpDocument.otp, 'email_verification');

      // Send welcome email
      await emailService.sendWelcomeEmail(email, name);

      const response: IApiResponse = {
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          userId: user._id.toString(),
          email: user.email,
          name: user.name
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // POST /auth/verify-email
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      // Validate OTP
      const otpDocument = await validateOTP(email, otp, 'email_verification');
      if (!otpDocument) {
        const response: IApiResponse = {
          success: false,
          message: 'Invalid or expired OTP',
          error: 'Please request a new verification code'
        };
        res.status(400).json(response);
        return;
      }

      // Mark OTP as used
      await markOTPAsUsed(otpDocument._id.toString());

      // Update user verification status
      const user = await User.findOneAndUpdate(
        { email },
        { isEmailVerified: true },
        { new: true }
      );

      if (!user) {
        const response: IApiResponse = {
          success: false,
          message: 'User not found',
          error: 'Invalid email address'
        };
        res.status(404).json(response);
        return;
      }

      const response: IApiResponse = {
        success: true,
        message: 'Email verified successfully',
        data: {
          userId: user._id.toString(),
          email: user.email,
          isEmailVerified: user.isEmailVerified
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Email verification error:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Email verification failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // POST /auth/login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user with password
      const user = await User.findOne({ email }).select('+password') as IUserDocument;
      if (!user) {
        const response: IApiResponse = {
          success: false,
          message: 'Invalid credentials',
          error: 'Email or password is incorrect'
        };
        res.status(401).json(response);
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        const response: IApiResponse = {
          success: false,
          message: 'Invalid credentials',
          error: 'Email or password is incorrect'
        };
        res.status(401).json(response);
        return;
      }

      // Generate tokens
      const tokens = generateTokens(user._id.toString(), user.email, user.role);

      // Add refresh token to user
      user.addRefreshToken(tokens.refreshToken);
      user.lastLoginAt = new Date();
      await user.save();

      const response: IApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
          tokens
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // GET /auth/me
  static async getCurrentUser(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: IApiResponse = {
          success: false,
          message: 'Authentication required',
          error: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      // Get fresh user data from database
      const user = await User.findById(req.user._id).select('-password -refreshTokens');
      
      if (!user) {
        const response: IApiResponse = {
          success: false,
          message: 'User not found',
          error: 'User account no longer exists'
        };
        res.status(404).json(response);
        return;
      }

      // Check if user is still active
      if (!user.isActive) {
        const response: IApiResponse = {
          success: false,
          message: 'Account deactivated',
          error: 'Your account has been deactivated'
        };
        res.status(403).json(response);
        return;
      }

      const response: IApiResponse = {
        success: true,
        message: 'Token is valid',
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            profileImage: user.profileImage,
            phone: user.phone,
            address: user.address,
            totalTestsTaken: user.totalTestsTaken,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          tokenValid: true,
          timestamp: new Date().toISOString()
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get current user error:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to validate token',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // POST /auth/refresh
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const response: IApiResponse = {
          success: false,
          message: 'Refresh token is required',
          error: 'No refresh token provided'
        };
        res.status(400).json(response);
        return;
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId).select('+refreshTokens') as IUserDocument;
      if (!user) {
        const response: IApiResponse = {
          success: false,
          message: 'Invalid refresh token',
          error: 'User not found'
        };
        res.status(401).json(response);
        return;
      }

      // Check if refresh token exists in user's tokens
      if (!user.hasRefreshToken(refreshToken)) {
        const response: IApiResponse = {
          success: false,
          message: 'Invalid refresh token',
          error: 'Token not found in user session'
        };
        res.status(401).json(response);
        return;
      }

      // Generate new tokens
      const newTokens = generateTokens(user._id.toString(), user.email, user.role);

      // Remove old refresh token and add new one
      user.removeRefreshToken(refreshToken);
      user.addRefreshToken(newTokens.refreshToken);
      await user.save();

      const response: IApiResponse = {
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
          tokens: newTokens
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Token refresh error:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Token refresh failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(401).json(response);
    }
  }

  // POST /auth/logout
  static async logout(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!req.user) {
        const response: IApiResponse = {
          success: false,
          message: 'Authentication required',
          error: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      // Remove refresh token from user
      const user = await User.findById(req.user._id).select('+refreshTokens') as IUserDocument;
      if (user && refreshToken) {
        user.removeRefreshToken(refreshToken);
        await user.save();
      }

      const response: IApiResponse = {
        success: true,
        message: 'Logged out successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Logout error:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // POST /auth/send-otp
  static async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, phone, type } = req.body;

      if (type === 'email' && !email) {
        const response: IApiResponse = {
          success: false,
          message: 'Email is required for email OTP',
          error: 'Email field is missing'
        };
        res.status(400).json(response);
        return;
      }

      if (type === 'phone' && !phone) {
        const response: IApiResponse = {
          success: false,
          message: 'Phone is required for phone OTP',
          error: 'Phone field is missing'
        };
        res.status(400).json(response);
        return;
      }

      // Check if user exists (for password reset)
      if (email) {
        const user = await User.findOne({ email });
        if (!user) {
          const response: IApiResponse = {
            success: false,
            message: 'User not found',
            error: 'No account found with this email'
          };
          res.status(404).json(response);
          return;
        }
      }

      // Create OTP
      const purpose = email ? 'password_reset' : 'email_verification';
      const otpDocument = await createOTP(email || phone!, purpose, type);

      // Send OTP
      if (type === 'email' && email) {
        await emailService.sendOTP(email, otpDocument.otp, purpose);
      }

      const response: IApiResponse = {
        success: true,
        message: `OTP sent successfully to your ${type}`,
        data: {
          type,
          purpose
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Send OTP error:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to send OTP',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // POST /auth/reset-password
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;

      // Validate OTP
      const otpDocument = await validateOTP(email, otp, 'password_reset');
      if (!otpDocument) {
        const response: IApiResponse = {
          success: false,
          message: 'Invalid or expired OTP',
          error: 'Please request a new password reset code'
        };
        res.status(400).json(response);
        return;
      }

      // Mark OTP as used
      await markOTPAsUsed(otpDocument._id.toString());

      // Update user password
      const user = await User.findOne({ email }).select('+password') as IUserDocument;
      if (!user) {
        const response: IApiResponse = {
          success: false,
          message: 'User not found',
          error: 'Invalid email address'
        };
        res.status(404).json(response);
        return;
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Clear all refresh tokens (force re-login)
      user.refreshTokens = [];
      await user.save();

      const response: IApiResponse = {
        success: true,
        message: 'Password reset successfully',
        data: {
          userId: user._id.toString(),
          email: user.email
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Password reset error:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Password reset failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }
  
} 