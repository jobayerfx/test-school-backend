import { Schema, model, Document, Types } from "mongoose";

export type TestSessionStatus =
  | 'in_progress'
  | 'submitted'
  | 'graded'
  | 'expired';

export interface ITestAnswer {
  questionId: Types.ObjectId;
  answer: { type: String, required: true },
  isCorrect: { type: Boolean, default: null },
}

export interface ITestQuestion {
  questionId: Types.ObjectId;
  competency: string;
  level: string;
}

export interface ITestSessionDocument extends Document {
  userId: Types.ObjectId;
  step: 1 | 2 | 3;
  questions: ITestQuestion[];
  answers: ITestAnswer[];
  status: TestSessionStatus;
  startTime: Date;
  endTime: Date;
  scorePercent?: number;
  awardedLevel?: string; // e.g., "A1", "A2"
  gradedAt?: Date;
}

// export interface ITestSessionDocument extends Document {
//   _id: string;
//   userId: Types.ObjectId;
//   testId: Types.ObjectId;
//   startedAt: Date;
//   expiresAt: Date;
//   submittedAt?: Date;
//   status: TestSessionStatus;
//   score?: number;
//   awardedLevel?: string;
//   answers: ITestAnswer[];
//   createdAt: Date;
//   updatedAt: Date;
// }

const TestSessionSchema = new Schema<ITestSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    step: { type: Number, required: true },
    questions: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        competency: { type: String, required: true },
        level: { type: String, required: true },
      },
    ],
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        selectedIndex: { type: Number },
        timeTakenSec: { type: Number },
      },
    ],
    status: {
      type: String,
      enum: ["in_progress", "submitted", "graded", "expired"],
      default: "in_progress",
      required: true,
    },
    startTime: { type: Date, default: () => Date.now() },
    endTime: { type: Date, required: true },
    scorePercent: { type: Number },
    awardedLevel: { type: String },
    gradedAt: { type: Date },
  },
  { timestamps: true }
);

TestSessionSchema.index({ userId: 1 });
TestSessionSchema.index({ status: 1, endTime: 1 });

export default model<ITestSessionDocument>("TestSession", TestSessionSchema);

