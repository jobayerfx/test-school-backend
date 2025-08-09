import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  static async perCompetency(req: Request, res: Response) {
    try {
      const data = await ReportService.getPerCompetency();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Error fetching competency report", error: err });
    }
  }

  static async userPerformance(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const data = await ReportService.getUserPerformance(userId as string);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Error fetching user performance", error: err });
    }
  }

  // Dashboard Controller Methods
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const data = await ReportService.getDashboardStats();
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: "Error fetching dashboard statistics", 
        error: err 
      });
    }
  }

  static async getTestTrends(req: Request, res: Response) {
    try {
      const data = await ReportService.getTestTrends();
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: "Error fetching test trends", 
        error: err 
      });
    }
  }

  static async getCompetencyAnalytics(req: Request, res: Response) {
    try {
      const data = await ReportService.getCompetencyAnalytics();
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: "Error fetching competency analytics", 
        error: err 
      });
    }
  }

  static async getUserDemographics(req: Request, res: Response) {
    try {
      const data = await ReportService.getUserDemographics();
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: "Error fetching user demographics", 
        error: err 
      });
    }
  }

  static async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const data = await ReportService.getPerformanceMetrics();
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: "Error fetching performance metrics", 
        error: err 
      });
    }
  }

  static async getTopPerformers(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;
      const data = await ReportService.getTopPerformers(Number(limit));
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: "Error fetching top performers", 
        error: err 
      });
    }
  }

  static async getCompleteDashboard(req: Request, res: Response) {
    try {
      const [
        dashboardStats,
        testTrends,
        competencyAnalytics,
        userDemographics,
        performanceMetrics,
        topPerformers
      ] = await Promise.all([
        ReportService.getDashboardStats(),
        ReportService.getTestTrends(),
        ReportService.getCompetencyAnalytics(),
        ReportService.getUserDemographics(),
        ReportService.getPerformanceMetrics(),
        ReportService.getTopPerformers(10)
      ]);

      res.json({
        success: true,
        data: {
          overview: dashboardStats,
          trends: testTrends,
          competencies: competencyAnalytics,
          demographics: userDemographics,
          performance: performanceMetrics,
          topPerformers
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: "Error fetching complete dashboard data", 
        error: err 
      });
    }
  }
}
