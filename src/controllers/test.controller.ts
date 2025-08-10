import { Response } from "express";
import { AuthRequest } from "../types/AuthRequest";
import * as testService from "../services/test.service";
import TestSession from "../models/TestSession.model";
import { testHistoryQuerySchema } from '../validators/test.validator';
import { Queue } from 'bullmq';
const gradingQueue = new Queue('grading');


/**
 * POST /api/tests/start
 * body: { step: 1|2|3, minutesPerQuestion?: number }
 */
export async function startTest(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const step = parseInt(req.body.step, 10) as 1 | 2 | 3;
    const minutesPerQuestion = req.body.minutesPerQuestion ? Number(req.body.minutesPerQuestion) : undefined;

    if (![1, 2, 3].includes(step)) return res.status(400).json({ message: "Invalid step" });

    const result = await testService.startTestSession(req.user.id, step, minutesPerQuestion);
    return res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    console.error("startTest error:", err);
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message ?? "Server error" });
  }
}

/**
 * POST /api/tests/:sessionId/answer (autosave)
 * body: { answers: [{ questionId, answer, isCorrect }] }
 */
export async function autosaveAnswers(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { sessionId } = req.params;
    const answers = req.body.answers;
    // console.log({answers, sessionId});
    const session = await TestSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (!session.userId.equals(req.user.id)) return res.status(403).json({ message: "Forbidden" });

    // Merge/save partial answers - simplistic replacement here
    session.answers = answers;
    await session.save();

    return res.json({ success: true, message: "Answers saved" });
  } catch (err) {
    console.error("autosaveAnswers error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * POST /api/tests/:sessionId/submit
 * body: { answers: [...] } // optional if already autosaved
 */
export async function submitTest(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { sessionId } = req.params;
    const answers = req.body.answers;

    // If answers provided, include them
    if (answers) {
      // call submitTestSession which sets status to submitted and triggers grading
      const result = await testService.submitTestSession(req.user.id, sessionId, answers);
      return res.json({ success: true, data: result });
    } else {
      // If no answers in body - try to grade existing
      const session = await TestSession.findById(sessionId);
      if (!session) return res.status(404).json({ message: "Session not found" });
      if (!session.userId.equals(req.user.id)) return res.status(403).json({ message: "Forbidden" });

      // If already submitted/graded, respond idempotently
      if (session.status !== "in_progress") {
        return res.json({
          success: true,
          data: {
            sessionId: session._id,
            scorePercent: session.scorePercent,
            awardedLevel: session.awardedLevel,
          },
        });
      }

      // Otherwise grade & finalize
      const result = await testService.gradeAndFinalizeSession(session);
      
      await gradingQueue.add('gradeTest', { testSessionId: session._id });

      return res.json({ success: true, data: result });
    }
  } catch (err: any) {
    console.error("submitTest error:", err);
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message ?? "Server error" });
  }
}

/**
 * GET /api/tests/:sessionId
 */
export async function getSession(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { sessionId } = req.params;
    const session = await TestSession.findById(sessionId).populate("questions.questionId", "-__v -createdBy");
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (!session.userId.equals(req.user.id) && req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    // For security, ensure correct answers not exposed
    // questions.questionId population excludes correctAnswer above
    return res.json({ success: true, data: session });
  } catch (err) {
    console.error("getSession error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}


export const getTestHistory = async (req: AuthRequest, res: Response) => {
    // Validate query params
    const { error, value } = testHistoryQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { page, limit } = value;
  
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const filter = {
        userId: req.user.id,
        status: { $in: ['submitted', 'graded'] },
      };
  
      const total = await TestSession.countDocuments(filter);
  
      const history = await TestSession.find(filter)
        .populate('testId', 'title duration') // only fetch test title & duration
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
  
      res.json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: history,
      });
    } catch (err) {
      console.error('Error fetching test history:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
