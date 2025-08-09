import { Schema, model, Document } from "mongoose";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface IQuestion extends Document {
  competency: string; // e.g., "Digital Communication"
  level: Level;
  questionText: string;
  options: string[];
  correctAnswer: number; // index of correct answer in options array
  createdBy: string; // Admin user ID
}

const QuestionSchema = new Schema<IQuestion>(
  {
    competency: { type: String, required: true, trim: true },
    level: { type: String, enum: ["A1", "A2", "B1", "B2", "C1", "C2"], required: true },
    questionText: { type: String, required: true, trim: true },
    options: { type: [String], required: true, validate: [(arr: string[]) => arr.length >= 2, 'At least two options are required.'] },
    correctAnswer: { type: Number, required: true, min: 0 },
    createdBy: { type: String, ref: "User", required: true }
  },
  { timestamps: true }
);

export default model<IQuestion>("Question", QuestionSchema);
