import TestSession from '../models/TestSession.model';
import { User } from '../models/user.model';
import mongoose from 'mongoose';

export class ReportService {
  static async getPerCompetency() {
    return await TestSession.aggregate([
      { $match: { completedAt: { $ne: null } } },
      {
        $group: {
          _id: "$competencyId",
          competencyName: { $first: "$competencyName" },
          totalTests: { $sum: 1 },
          averageScore: { $avg: "$score" },
          passRate: { $avg: { $cond: ["$passed", 1, 0] } }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);
  }

  static async getUserPerformance(userId: string) {
    const objectId = new mongoose.Types.ObjectId(userId);

    const breakdown = await TestSession.aggregate([
      { $match: { userId: objectId, completedAt: { $ne: null } } },
      {
        $group: {
          _id: "$competencyId",
          competencyName: { $first: "$competencyName" },
          testsTaken: { $sum: 1 },
          averageScore: { $avg: "$score" },
          bestScore: { $max: "$score" },
          lastAttempt: { $max: "$completedAt" }
        }
      }
    ]);

    const totalStats = await TestSession.aggregate([
      { $match: { userId: objectId, completedAt: { $ne: null } } },
      {
        $group: {
          _id: null,
          overallAverage: { $avg: "$score" },
          totalTestsTaken: { $sum: 1 }
        }
      }
    ]);

    return {
      userId,
      overallAverage: totalStats[0]?.overallAverage || 0,
      totalTestsTaken: totalStats[0]?.totalTestsTaken || 0,
      competencyBreakdown: breakdown
    };
  }

  // Dashboard Statistics Methods
  static async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total users and active users
    const totalUsers = await User.countDocuments({ isActive: true });
    const activeUsers = await User.countDocuments({ 
      isActive: true, 
      lastLoginAt: { $gte: sevenDaysAgo } 
    });

    // Test session statistics
    const totalTestSessions = await TestSession.countDocuments({ status: { $in: ['submitted', 'graded'] } });
    const completedTests = await TestSession.countDocuments({ status: 'graded' });
    const averageScore = await TestSession.aggregate([
      { $match: { status: 'graded', scorePercent: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$scorePercent' } } }
    ]);

    // Recent activity (last 30 days)
    const recentTests = await TestSession.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: { $in: ['submitted', 'graded'] }
    });

    // User growth (last 30 days)
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalTestSessions,
        completedTests,
        averageScore: averageScore[0]?.avgScore || 0,
        completionRate: totalTestSessions > 0 ? (completedTests / totalTestSessions) * 100 : 0
      },
      recentActivity: {
        recentTests,
        newUsers,
        period: '30 days'
      }
    };
  }

  static async getTestTrends() {
    const now = new Date();
    const days = 30;
    const dailyStats = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dayStats = await TestSession.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['submitted', 'graded'] }
          }
        },
        {
          $group: {
            _id: null,
            testsTaken: { $sum: 1 },
            averageScore: { $avg: '$scorePercent' },
            completedTests: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } }
          }
        }
      ]);

      dailyStats.push({
        date: startOfDay.toISOString().split('T')[0],
        testsTaken: dayStats[0]?.testsTaken || 0,
        averageScore: dayStats[0]?.averageScore || 0,
        completedTests: dayStats[0]?.completedTests || 0
      });
    }

    return dailyStats;
  }

  static async getCompetencyAnalytics() {
    const competencyStats = await TestSession.aggregate([
      { $match: { status: 'graded', scorePercent: { $exists: true } } },
      {
        $group: {
          _id: '$questions.competency',
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$scorePercent' },
          passRate: { $avg: { $cond: [{ $gte: ['$scorePercent', 70] }, 1, 0] } },
          minScore: { $min: '$scorePercent' },
          maxScore: { $max: '$scorePercent' }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    return competencyStats;
  }

  static async getUserDemographics() {
    const userStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          avgTestsTaken: { $avg: '$totalTestsTaken' }
        }
      }
    ]);

    const recentActivity = await User.aggregate([
      { $match: { isActive: true, lastLoginAt: { $exists: true } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$lastLoginAt" }
          },
          activeUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    return {
      roleDistribution: userStats,
      recentActivity
    };
  }

  static async getPerformanceMetrics() {
    const scoreDistribution = await TestSession.aggregate([
      { $match: { status: 'graded', scorePercent: { $exists: true } } },
      {
        $bucket: {
          groupBy: '$scorePercent',
          boundaries: [0, 25, 50, 75, 90, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            tests: { $push: '$$ROOT' }
          }
        }
      }
    ]);

    const timeAnalysis = await TestSession.aggregate([
      { $match: { status: 'graded', startTime: { $exists: true }, endTime: { $exists: true } } },
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ['$endTime', '$startTime'] },
              1000 * 60 // Convert to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' }
        }
      }
    ]);

    return {
      scoreDistribution,
      timeAnalysis: timeAnalysis[0] || { avgDuration: 0, minDuration: 0, maxDuration: 0 }
    };
  }

  static async getTopPerformers(limit: number = 10) {
    return await TestSession.aggregate([
      { $match: { status: 'graded', scorePercent: { $exists: true } } },
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$scorePercent' },
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$scorePercent' },
          lastTestDate: { $max: '$createdAt' }
        }
      },
      { $sort: { bestScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          userId: '$_id',
          name: { $arrayElemAt: ['$user.name', 0] },
          email: { $arrayElemAt: ['$user.email', 0] },
          bestScore: 1,
          totalTests: 1,
          averageScore: 1,
          lastTestDate: 1
        }
      }
    ]);
  }
}
