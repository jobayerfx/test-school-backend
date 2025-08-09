import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
  validateRequest,
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  sendOTPSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  logoutSchema
} from '../middlewares/validation';

const router = Router();

// POST /auth/register
router.post('/register', validateRequest(registerSchema), AuthController.register);

// POST /auth/verify-email
router.post('/verify-email', validateRequest(verifyEmailSchema), AuthController.verifyEmail);

// POST /auth/login
router.post('/login', validateRequest(loginSchema), AuthController.login);

// GET /auth/me - Get current user and validate token
router.get('/me', authenticate, AuthController.getCurrentUser);

// POST /auth/refresh
router.post('/refresh', validateRequest(refreshTokenSchema), AuthController.refresh);

// POST /auth/logout
router.post('/logout', authenticate, validateRequest(logoutSchema), AuthController.logout);

// POST /auth/send-otp
router.post('/send-otp', validateRequest(sendOTPSchema), AuthController.sendOTP);

// POST /auth/reset-password
router.post('/reset-password', validateRequest(resetPasswordSchema), AuthController.resetPassword);

export default router; 