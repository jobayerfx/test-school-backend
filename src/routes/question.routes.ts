import { Router } from "express";
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from "../controllers/question.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import multer from 'multer';
import path from 'path';
import { bulkUploadQuestions } from '../controllers/questionBulkUpload.controller';

const router = Router();

// Admin-only routes
router.post("/", authenticate, authorize("admin"), createQuestion);
router.get("/", authenticate, authorize("admin"), getQuestions);
router.get("/:id", authenticate, authorize("admin"), getQuestionById);
router.put("/:id", authenticate, authorize("admin"), updateQuestion);
router.delete("/:id", authenticate, authorize("admin"), deleteQuestion);

// Configure multer for file upload
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post(
  '/bulk-upload',
  authenticate,
  authorize("admin"),
  upload.single('file'),
  bulkUploadQuestions
);


export default router;
