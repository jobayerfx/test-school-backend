import mongoose, { Types } from "mongoose";
import TestSession, { ITestSessionDocument, ITestAnswer } from "../models/TestSession.model";
import Question from "../models/question.model";
import { User } from "../models/user.model";
import { scheduleAutoSubmit } from "../jobs/autoSubmitQueue";

type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const LEVELS_BY_STEP: Record<number, Level[]> = {
  1: ["A1", "A2"],
  2: ["B1", "B2"],
  3: ["C1", "C2"],
};

const DEFAULT_MINUTES_PER_Q = 1; // configurable

// Determine certification mapping based on spec
export function determineAwardedLevel(step: number, scorePercent: number): { level: string; progressNext: boolean; failNoRetake?: boolean } {
  if (step === 1) {
    if (scorePercent < 25) return { level: "Fail", progressNext: false, failNoRetake: true };
    if (scorePercent < 50) return { level: "A1", progressNext: false };
    if (scorePercent < 75) return { level: "A2", progressNext: false };
    return { level: "A2", progressNext: true }; // >=75 => A2 and proceed to Step2
  }
  if (step === 2) {
    if (scorePercent < 25) return { level: "A2", progressNext: false }; // remain at A2
    if (scorePercent < 50) return { level: "B1", progressNext: false };
    if (scorePercent < 75) return { level: "B2", progressNext: false };
    return { level: "B2", progressNext: true }; // >=75 => B2 and proceed to Step3
  }
  if (step === 3) {
    if (scorePercent < 25) return { level: "B2", progressNext: false };
    if (scorePercent < 50) return { level: "C1", progressNext: false };
    return { level: "C2", progressNext: false };
  }
  return { level: "Unknown", progressNext: false };
}

/**
 * Start a test session:
 * - Check eligibility (Step1 blocked retake)
 * - Select 44 random questions from two levels
 * - Create session and schedule auto-submit
 */
export async function startTestSession(userId: string, step: 1 | 2 | 3, minutesPerQuestion = DEFAULT_MINUTES_PER_Q) {
  // Eligibility: if step === 1 and user is blockedFromRetakeStep1 => throw
  const user = await User.findById(userId).select("+blockedFromRetakeStep1").lean();
  if (!user) throw new Error("User not found");
  if (
    step === 1 &&
    (user as any).blockedFromRetakeStep1 // Type assertion to bypass TS error
  ) {
    const err: any = new Error("User is blocked from retaking Step 1");
    err.status = 403;
    throw err;
  }

  // Get levels for step
  const levels = LEVELS_BY_STEP[step];
  if (!levels) throw new Error("Invalid step");

  // Use aggregation $match + $sample to fetch exactly 44 random questions across the two levels.
  const countNeeded = 44;
  const questions = await Question.aggregate([
    { $match: { level: { $in: levels } } },
    { $sample: { size: countNeeded } },
  ]);

  if (!questions || questions.length < countNeeded) {
    const err: any = new Error("Not enough questions in pool for this step");
    err.status = 400;
    throw err;
  }

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + minutesPerQuestion * countNeeded * 60 * 1000);

  const sessionDoc = await TestSession.create({
    userId: new mongoose.Types.ObjectId(userId),
    step,
    questions: questions.map((q: any) => ({
      questionId: q._id,
      competency: q.competency,
      level: q.level,
    })),
    answers: [],
    startTime,
    endTime,
    status: "in_progress",
  });

  // schedule auto-submit job
  scheduleAutoSubmit((sessionDoc._id as mongoose.Types.ObjectId).toString(), endTime);

  // Return session id + question payload (without correctAnswer)
  const clientQuestions = questions.map((q: any) => ({
    id: q._id,
    competency: q.competency,
    level: q.level,
    text: q.questionText ?? q.text ?? q.questionText,
    options: q.options,
  }));

  return {
    sessionId: (sessionDoc._id as mongoose.Types.ObjectId).toString(),
    questions: clientQuestions,
    startTime,
    endTime,
  };
}

/**
 * Save partial answers (autosave) or final submit via submitTestSession.
 * For manual submit, answers param will be used to grade.
 */
export async function submitTestSession(userId: string, sessionId: string, answers: ITestAnswer[]) {
  const session = await TestSession.findById(sessionId);
  if (!session) {
    const err: any = new Error("Session not found");
    err.status = 404;
    throw err;
  }
  if (!session.userId.equals(new mongoose.Types.ObjectId(userId))) {
    const err: any = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  // If already graded/submitted, return idempotent response
  if (session.status !== "in_progress") {
    return { alreadySubmitted: true, sessionId: (session._id as mongoose.Types.ObjectId).toString() };
  }

  // Save answers
  session.answers = answers;
  session.status = "submitted";
  await session.save();

  // Grade
  const result = await gradeAndFinalizeSession(session);

  return result;
}

/**
 * Grade a session: idempotent (checks session.status).
 * This function updates session document and also updates the user's currentLevel / blockedFromRetakeStep1.
 */
export async function gradeAndFinalizeSession(session: ITestSessionDocument) {
  // Refetch fresh session
  const s = await TestSession.findById(session._id);
  if (!s) throw new Error("Session not found for grading");

  // If already graded (status submitted/auto-submitted and gradedAt exists) -> return current results
  if (s.status !== "in_progress" && s.gradedAt) {
    return {
      sessionId: (s._id as mongoose.Types.ObjectId).toString(),
      scorePercent: s.scorePercent,
      awardedLevel: s.awardedLevel,
      alreadyGraded: true,
    };
  }

  // Fetch questions and build map of correct indices
  const qIds = s.questions.map((q) => q.questionId);
  const questions = await Question.find({ _id: { $in: qIds } }).lean();

  const questionMap = new Map<string, any>();
  for (const q of questions) {
    // expected: q.correctAnswer is index (number)
    questionMap.set(q._id.toString(), q);
  }

  // Count correct answers
  let correctCount = 0;
  for (const ans of s.answers) {
    const q = questionMap.get(ans.questionId.toString());
    if (!q) continue;
    if (typeof ans.answer === "number" && ans.answer === q.correctAnswer) {
      correctCount++;
    }
  }

  const total = s.questions.length || 1;
  const scorePercent = parseFloat(((correctCount / total) * 100).toFixed(2));

  // Determine level and progressNext
  const { level, progressNext, failNoRetake } = determineAwardedLevel(s.step, scorePercent);

  // Update session
  s.scorePercent = scorePercent;
  s.awardedLevel = level;
  s.gradedAt = new Date();
  // If this grading is triggered by timeout auto-submit, status should be 'auto_submitted'; if manual, 'submitted' likely already set
  if (s.status === "in_progress") s.status = "auto_submitted" as typeof s.status;
  await s.save();

  // Update user record (atomic update)
  const user = await User.findById(s.userId);
  if (!user) throw new Error("Associated user not found");

  // If Step1 fail and failNoRetake flag => block user from retaking step1
  if (s.step === 1 && failNoRetake) {
    // blockedFromRetakeStep1 may not be in the User schema typings, but we set it anyway
    (user as any).set('blockedFromRetakeStep1', true);
  }

  // Update user's currentLevel only if awarded level is a real level (not Fail)
  if (level && level !== "Fail" && level !== "A2+Next" && level !== "B2+Next") {
    // mapping for 'A2+Next' return 'A2' as the actual level, similarly 'B2+Next' -> 'B2'
    const normalized = level.endsWith("+Next") ? (level.split("+")[0] as Level) : (level as Level);
    user.set('currentLevel', normalized);
  } else if (level === "A1" || level === "A2" || level === "B1" || level === "B2" || level === "C1" || level === "C2") {
    user.set('currentLevel', level as Level);
  }

  await user.save();

  // Optionally: If progressNext === true, return that client may start next step
  return {
    sessionId: (s._id as mongoose.Types.ObjectId).toString(),
    scorePercent,
    awardedLevel: s.awardedLevel,
    proceedToNextStep: progressNext,
  };
}