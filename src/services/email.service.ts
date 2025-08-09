import nodemailer from 'nodemailer';
import { IApiResponse } from '../types';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTP(email: string, otp: string, purpose: 'email_verification' | 'password_reset'): Promise<IApiResponse> {
    try {
      const subject = purpose === 'email_verification' 
        ? 'Verify Your Email Address' 
        : 'Reset Your Password';

      const html = this.getOTPEmailTemplate(otp, purpose);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        data: { messageId: info.messageId }
      };
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getOTPEmailTemplate(otp: string, purpose: 'email_verification' | 'password_reset'): string {
    const title = purpose === 'email_verification' 
      ? 'Verify Your Email Address' 
      : 'Reset Your Password';
    
    const message = purpose === 'email_verification'
      ? 'Please use the following OTP to verify your email address:'
      : 'Please use the following OTP to reset your password:';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .otp { font-size: 32px; font-weight: bold; text-align: center; color: #4CAF50; padding: 20px; background-color: white; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>${message}</p>
            <div class="otp">${otp}</div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(email: string, name: string): Promise<IApiResponse> {
    try {
      const html = this.getWelcomeEmailTemplate(name);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Test School Backend!',
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        message: 'Welcome email sent successfully',
        data: { messageId: info.messageId }
      };
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        message: 'Failed to send welcome email',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Test School Backend</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Test School Backend!</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Welcome to Test School Backend! Your account has been created successfully.</p>
            <p>Please verify your email address to complete the registration process.</p>
            <p>Thank you for choosing our platform!</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService(); 