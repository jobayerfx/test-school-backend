import mongoose, { Document, Schema } from 'mongoose';

export interface IOTPDocument extends Document {
  _id: string;
  email?: string;
  phone?: string;
  otp: string;
  type: 'email' | 'phone';
  purpose: 'email_verification' | 'password_reset';
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  isValid(): boolean;
  markAsUsed(): void;
}

const otpSchema = new Schema<IOTPDocument>({
  email: {
    type: String,
    required: function(this: IOTPDocument) {
      return this.type === 'email';
    },
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: function(this: IOTPDocument) {
      return this.type === 'phone';
    },
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: [6, 'OTP must be exactly 6 characters']
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    required: true
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index to auto-delete expired OTPs
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
otpSchema.index({ email: 1, purpose: 1, createdAt: -1 });
otpSchema.index({ phone: 1, purpose: 1, createdAt: -1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if OTP is valid
otpSchema.methods.isValid = function(): boolean {
  return !this.isUsed && new Date() < this.expiresAt;
};

// Method to mark OTP as used
otpSchema.methods.markAsUsed = function(): void {
  this.isUsed = true;
};

export const OTP = mongoose.model<IOTPDocument>('OTP', otpSchema); 