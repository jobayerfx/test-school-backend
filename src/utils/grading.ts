import TestSession, { ITestSessionDocument } from "../models/TestSession.model";
import Question from "../models/question.model";



export const gradeSession = async (session: ITestSessionDocument) => {
  const questions = await Question.find({
    _id: { $in: session.questions.map((q) => q.questionId) },
  });

  let correctCount = 0;
  questions.forEach((q) => {
    const answer = session.answers.find((a) => {
      // Ensure both IDs are ObjectId for comparison
      // @ts-ignore
      return String(a.questionId) === String(q._id);
    });
    // Compare as strings to avoid type mismatch (string vs number)
    // @ts-ignore
    if (answer && String(answer?.answer) === String(q.correctAnswer)) {
      correctCount++;
    }
  });

  const scorePercent = (correctCount / session.questions.length) * 100;
  let levelAwarded = "";

  // Step-based certification rules
  const stepRules: Record<number, (score: number) => string> = {
    1: (score) => {
      if (score < 25) return "Fail";
      if (score < 50) return "A1";
      if (score < 75) return "A2";
      return "A2+Next";
    },
    2: (score) => {
      if (score < 25) return "A2";
      if (score < 50) return "B1";
      if (score < 75) return "B2";
      return "B2+Next";
    },
    3: (score) => {
      if (score < 25) return "B2";
      if (score < 50) return "C1";
      return "C2";
    },
  };

  levelAwarded = stepRules[session.step](scorePercent);

  return {
    score: parseFloat(scorePercent.toFixed(2)),
    levelAwarded,
  };
};

// Helper example (replace with your real logic)
export async function calculateScoreAndLevel(testSession: any): Promise<{ score: number; awardedLevel: string }> {
    // TODO: implement your grading & level logic based on answers
    // This is a placeholder
    const score = 80;
    const awardedLevel = 'A2'; // Example awarded level
    return { score, awardedLevel };
  }
  
  export function isCertifiableLevel(level: string): boolean {
    // Define your certifiable levels
    const certifiableLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return certifiableLevels.includes(level);
  }