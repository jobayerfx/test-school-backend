// models/Certificate.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificateDocument extends Document {
  userId: mongoose.Types.ObjectId;
  testSessionId: mongoose.Types.ObjectId;
  level: string;
  issuedAt: Date;
  filePath: string; // path to the PDF or file storage location
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificateDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    testSessionId: { type: Schema.Types.ObjectId, ref: 'TestSession', required: true },
    level: { type: String, required: true },
    issuedAt: { type: Date, required: true, default: Date.now },
    filePath: { type: String, required: true }, 
  },
  { timestamps: true }
);

certificateSchema.index({ userId: 1 });
certificateSchema.index({ testSessionId: 1 });

export const Certificate = mongoose.model<ICertificateDocument>('Certificate', certificateSchema);
