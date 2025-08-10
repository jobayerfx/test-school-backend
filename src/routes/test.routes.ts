// src/routes/test.routes.ts
import { Router } from "express";
import mongoose from 'mongoose';
import { startTest, autosaveAnswers, submitTest, getSession, getTestHistory } from "../controllers/test.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/start", authenticate, startTest);
router.post("/:sessionId([0-9a-fA-F]{24})/answer", authenticate, autosaveAnswers);
router.post("/:sessionId([0-9a-fA-F]{24})/submit", authenticate, submitTest);
router.get('/history', authenticate, getTestHistory);
router.get("/:sessionId([0-9a-fA-F]{24})", 
  authenticate,
  (req, res, next) => {
    const { sessionId } = req.params;
    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }
    req.params.sessionId = new mongoose.Types.ObjectId(sessionId).toString();
    next();
  }, 
  getSession
);

export default router;
