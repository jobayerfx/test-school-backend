import { Request, Response } from 'express';
import { bulkUploadSchema } from '../validators/question.validator';
import Question from '../models/question.model';    
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';

// Expected Question Schema
// {
//   questionText: string,
//   options: string[],
//   correctOption: number,
//   category?: string,
//   difficulty?: string
// }

export const bulkUploadQuestions = async (req: Request, res: Response) => {
  // 1. Validate query param
  const { error, value } = bulkUploadSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { format } = value;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = path.join(__dirname, '../../uploads', req.file.filename);

  try {
    let questions: any[] = [];

    if (format === 'csv') {
      // Parse CSV file
      questions = await new Promise((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (data) => {
            results.push({
              questionText: data.questionText,
              options: [
                data.option1,
                data.option2,
                data.option3,
                data.option4,
              ],
              correctOption: Number(data.correctOption),
              category: data.category || undefined,
              difficulty: data.difficulty || undefined,
            });
          })
          .on('end', () => resolve(results))
          .on('error', reject);
      });
    } else if (format === 'json') {
      // Parse JSON file
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(fileData);

      if (!Array.isArray(parsed)) {
        return res.status(400).json({ message: 'JSON must be an array of questions' });
      }
      questions = parsed;
    }

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions found in file' });
    }

    // Insert into DB
    await Question.insertMany(questions);

    res.json({
      message: `${questions.length} questions uploaded successfully`,
    });
  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    // Remove uploaded file
    fs.unlink(filePath, () => {});
  }
};
