import TestSession, { ITestSessionDocument } from "../models/TestSession.model";
import Question from "../models/question.model";
import { generateCertificatePDF, saveCertificatePDFToFile } from '../services/certificate.service';
import { Certificate } from '../models/certificate.model';
import { User } from '../models/user.model';
import { calculateScoreAndLevel, isCertifiableLevel } from '../utils/grading';

export async function gradeTestSession(testSessionId: string) {
    // Fetch the test session and populate user
    const testSession = await TestSession.findById(testSessionId).populate('userId');
    if (!testSession) throw new Error('Test session not found');
  
    if (!testSession.userId) throw new Error('User data missing in test session');
  
    // Calculate score and awarded level based on your grading logic
    const { score, awardedLevel } = await calculateScoreAndLevel(testSession);

    // Update test session grading fields using set to avoid TS property errors
    testSession.set({
      score,
      awardedLevel,
      status: 'graded',
      submittedAt: new Date(),
    });
    await testSession.save();
  
    // Generate certificate if awarded level is certifiable
    if (awardedLevel && isCertifiableLevel(awardedLevel)) {
      // testSession.userId is populated (User document), but TypeScript doesn't know it
      const user = testSession.userId as any;

      // Use a fixed test title or customize if stored in testSession (ignore TS error if needed)
      const testTitle = (testSession as any).testTitle || 'Digital Competency Assessment';
      // Generate the PDF buffer
      const pdfBuffer = await generateCertificatePDF({
        userName: user.name,
        level: awardedLevel,
        testTitle,
        issuedAt: new Date(),
      });

      // Save PDF file to disk and get the path
      const userId = (user as any)._id?.toString() || (testSession.userId as any)._id?.toString();
      const filename = `certificate_${userId}_${Date.now()}.pdf`;
      const filePath = await saveCertificatePDFToFile(pdfBuffer, filename);

      // Create a Certificate document in DB
      await Certificate.create({
        userId: user._id,
        testSessionId: testSession._id,
        level: awardedLevel,
        issuedAt: new Date(),
        filePath,
      });
    }
  
    return testSession;
  }