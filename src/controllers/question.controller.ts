// controllers/question.controller.ts
import { Request, Response } from "express";
import Question from "../models/question.model";
import { AuthRequest } from "../types/AuthRequest"; // your custom request type with `user` object

// Create Question
export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { competency, level, questionText, options, correctAnswer } = req.body;

    const question = await Question.create({
      competency,
      level,
      questionText,
      options,
      correctAnswer,
      createdBy: req.user?.id as string
    });

    res.status(201).json({ success: true, data: question });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'An unknown error occurred' });
    }
  }
};

// Get paginated questions
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 12, level, competency } = req.query;

    const filter: any = {};
    if (level) filter.level = level;
    if (competency) filter.competency = { $regex: competency as string, $options: "i" };

    const questions = await Question.find(filter)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        total,
        page: +page,
        pages: Math.ceil(total / +limit)
      }
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'An unknown error occurred' });
    }
  }
};

// Get single question
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    res.status(200).json({ success: true, data: question });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'An unknown error occurred' });
    }
  }
};

// Update question
export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    res.status(200).json({ success: true, data: question });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'An unknown error occurred' });
    }
  }
};

// Delete question
export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    res.status(200).json({ success: true, message: "Question deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'An unknown error occurred' });
    }
  }
};
