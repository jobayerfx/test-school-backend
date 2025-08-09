import { OTP, IOTPDocument } from '../models/OTP.model';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOTP = async (
  email: string,
  purpose: 'email_verification' | 'password_reset',
  type: 'email' | 'phone' = 'email'
): Promise<IOTPDocument> => {
  // Delete any existing unused OTPs for this email and purpose
  await OTP.deleteMany({
    email,
    purpose,
    isUsed: false
  });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const otpDocument = new OTP({
    email,
    otp,
    type,
    purpose,
    expiresAt
  });

  return await otpDocument.save();
};

export const validateOTP = async (
  email: string,
  otp: string,
  purpose: 'email_verification' | 'password_reset'
): Promise<IOTPDocument | null> => {
  const otpDocument = await OTP.findOne({
    email,
    otp,
    purpose,
    isUsed: false
  });

  if (!otpDocument || !otpDocument.isValid()) {
    return null;
  }

  return otpDocument;
};

export const markOTPAsUsed = async (otpId: string): Promise<void> => {
  await OTP.findByIdAndUpdate(otpId, { isUsed: true });
}; 