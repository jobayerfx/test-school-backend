import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';

const router = Router();

// Existing report routes
router.get('/per-competency', ReportController.perCompetency);
router.get('/user-performance', ReportController.userPerformance);

// Dashboard API routes
router.get('/dashboard/stats', ReportController.getDashboardStats);
router.get('/dashboard/trends', ReportController.getTestTrends);
router.get('/dashboard/competencies', ReportController.getCompetencyAnalytics);
router.get('/dashboard/demographics', ReportController.getUserDemographics);
router.get('/dashboard/performance', ReportController.getPerformanceMetrics);
router.get('/dashboard/top-performers', ReportController.getTopPerformers);
router.get('/dashboard/complete', ReportController.getCompleteDashboard);

export default router;
