import Queue from "bull";
import { gradeAndFinalizeSession } from "../services/test.service";
import TestSession from "../models/TestSession.model";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const autoSubmitQueue = new Queue("auto-submit-queue", REDIS_URL);

/**
 * scheduleAutoSubmit(sessionId, endTime)
 * calculates delay and adds a job.
 */
export async function scheduleAutoSubmit(sessionId: string, endTime: Date) {
  const delay = Math.max(0, endTime.getTime() - Date.now());
  await autoSubmitQueue.add(
    "autoSubmit",
    { sessionId },
    {
      delay,
      attempts: 3, // retry a few times if failed
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}

// Processor
autoSubmitQueue.process("autoSubmit", async (job) => {
  const { sessionId } = job.data;
  console.log(`[AutoSubmit] processing session ${sessionId}`);

  const session = await TestSession.findById(sessionId);
  if (!session) {
    console.warn(`[AutoSubmit] session ${sessionId} not found`);
    return;
  }

  // If already submitted/graded -> idempotent
  if (session.status !== "in_progress") {
    console.log(`[AutoSubmit] session ${sessionId} status is ${session.status} -> skipping`);
    return;
  }

  try {
    const result = await gradeAndFinalizeSession(session);
    console.log(`[AutoSubmit] session ${sessionId} graded: `, result);
    // TODO: notify user via email/websocket
  } catch (err) {
    console.error(`[AutoSubmit] error grading session ${sessionId}:`, err);
    throw err; // let Bull retry if configured
  }
});
