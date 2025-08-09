// src/routes/test.routes.ts
import { Router } from "express";
import { startTest, autosaveAnswers, submitTest, getSession, getTestHistory } from "../controllers/test.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/start", authenticate, startTest);
router.post("/:sessionId/answer", authenticate, autosaveAnswers);
router.post("/:sessionId/submit", authenticate, submitTest);
router.get("/:sessionId", authenticate, getSession);
router.get('/tests/history', authenticate, getTestHistory);

export default router;
