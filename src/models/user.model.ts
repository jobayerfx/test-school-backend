import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole } from "../types"; // Ensure this includes: 'admin' | 'student' | 'supervisor'

export interface IUserDocument extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  role: UserRole;
  refreshTokens: string[];
  lastLoginAt?: Date;
  profileImage?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdBy?: string; // admin ID if created by admin
  currentTestSessionId?: string; // active test session
  totalTestsTaken: number;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string): void;
  removeRefreshToken(token: string): void;
  hasRefreshToken(token: string): boolean;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    profileImage: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    currentTestSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestSession",
      default: null,
    },
    totalTestsTaken: {
      type: Number,
      default: 0,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Refresh token management
userSchema.methods.addRefreshToken = function (token: string): void {
  if (!this.refreshTokens) this.refreshTokens = [];
  if (!this.refreshTokens.includes(token)) {
    this.refreshTokens.push(token);
  }
};

userSchema.methods.removeRefreshToken = function (token: string): void {
  if (!this.refreshTokens) this.refreshTokens = [];
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token);
};

userSchema.methods.hasRefreshToken = function (token: string): boolean {
  return Array.isArray(this.refreshTokens) && this.refreshTokens.includes(token);
};

export const User = mongoose.model<IUserDocument>("User", userSchema);
