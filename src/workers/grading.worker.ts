import { Worker } from 'bullmq';
import { gradeTestSession } from '../services/grading.service';

const gradingWorker = new Worker('grading', async job => {
  try {
    const testSessionId = job.data.testSessionId;
    await gradeTestSession(testSessionId);
    console.log(`Graded test session ${testSessionId}`);
  } catch (error) {
    console.error('Error grading test session:', error);
  }
});

export default gradingWorker;