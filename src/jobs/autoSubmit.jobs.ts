import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import TestSession from "../models/TestSession.model";
import { gradeSession } from "../utils/grading";

export const autoSubmitQueue = new Queue('autoSubmit', {
    connection: redisConnection
});

// Schedule job
export const scheduleAutoSubmitJob = (sessionId: string, endTime: Date) => {
  const delay = endTime.getTime() - Date.now();
  autoSubmitQueue.add('autoSubmit', { sessionId }, { delay, attempts: 1 });
};

// Job processor
(autoSubmitQueue as any).process(async (job: any) => {
  const { sessionId } = job.data;
  console.log(`Auto-submitting test session: ${sessionId}`);

  const session = await TestSession.findById(sessionId);
  if (!session || session.status !== "in_progress") return;

  // Grade the session
  const scoreData = await gradeSession(session);
  session.status = "auto_submitted" as any; // Fix type error by casting to any
  // Assign score and levelAwarded if they exist on the session schema
  (session as any).score = scoreData.score;
  (session as any).levelAwarded = scoreData.levelAwarded;
  await session.save();
});