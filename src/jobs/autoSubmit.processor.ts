// jobs/autoSubmit.processor.ts
import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { gradeSession } from '../utils/grading';

export const autoSubmitWorker = new Worker(
  'autoSubmit',
  async job => {
    const { testSessionId } = job.data;
    await gradeSession(testSessionId);
  },
  { connection: redisConnection }
);
