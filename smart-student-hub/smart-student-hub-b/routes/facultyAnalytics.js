const express = require("express");
const Activity = require("../models/Activity");
const Student = require("../models/Student");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Middleware to check if user is faculty
const checkFacultyRole = (req, res, next) => {
  if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Faculty role required."
    });
  }
};

// GET /api/faculty/analytics/overview - Get comprehensive analytics overview
router.get("/overview", authMiddleware, checkFacultyRole, async (req, res) => {
  try {
    const { department, year, dateFrom, dateTo } = req.query;
    
    // Build filter for activities
    const activityFilter = {};
    const studentFilter = { isActive: true };
    
    if (department) {
      studentFilter.department = department;
    }
    if (year) {
      studentFilter.year = parseInt(year);
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      activityFilter.createdAt = {};
      if (dateFrom) activityFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) activityFilter.createdAt.$lte = new Date(dateTo);
    }

    // Get students matching criteria
    const students = await Student.find(studentFilter).select('_id');
    const studentIds = students.map(s => s._id);
    
    if (studentIds.length > 0) {
      activityFilter.studentId = { $in: studentIds };
    }

    // Activity statistics
    const totalActivities = await Activity.countDocuments(activityFilter);
    const approvedActivities = await Activity.countDocuments({ ...activityFilter, status: "approved" });
    const pendingActivities = await Activity.countDocuments({ ...activityFilter, status: { $in: ["pending", "ai-approved", "ai-rejected"] } });
    const rejectedActivities = await Activity.countDocuments({ ...activityFilter, status: "rejected" });

    // Credits statistics
    const creditsStats = await Activity.aggregate([
      { $match: { ...activityFilter, status: "approved" } },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: "$credits" },
          avgCredits: { $avg: "$credits" },
          maxCredits: { $max: "$credits" },
          minCredits: { $min: "$credits" }
        }
      }
    ]);

    // Activity type distribution
    const activityTypes = await Activity.aggregate([
      { $match: activityFilter },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $in: ["$status", ["pending", "ai-approved", "ai-rejected"]] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
          totalCredits: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$credits", 0] } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Monthly trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyTrends = await Activity.aggregate([
      { 
        $match: { 
          ...activityFilter,
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 },
          credits: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$credits", 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalActivities,
          approvedActivities,
          pendingActivities,
          rejectedActivities,
          approvalRate: totalActivities > 0 ? Math.round((approvedActivities / totalActivities) * 100) : 0
        },
        credits: creditsStats[0] || { totalCredits: 0, avgCredits: 0, maxCredits: 0, minCredits: 0 },
        activityTypes,
        monthlyTrends,
        filters: { department, year, dateFrom, dateTo }
      }
    });

  } catch (error) {
    console.error("Analytics overview error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/faculty/analytics/students - Get student performance analytics
router.get("/students", authMiddleware, checkFacultyRole, async (req, res) => {
  try {
    const { department, year, sortBy = 'totalCredits', sortOrder = 'desc', limit = 50 } = req.query;
    
    const matchFilter = { isActive: true };
    if (department) matchFilter.department = department;
    if (year) matchFilter.year = parseInt(year);

    // Get student performance data
    const studentPerformance = await Student.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: "activities",
          localField: "_id",
          foreignField: "studentId",
          as: "activities"
        }
      },
      {
        $addFields: {
          totalActivities: { $size: "$activities" },
          approvedActivities: {
            $size: {
              $filter: {
                input: "$activities",
                cond: { $eq: ["$$this.status", "approved"] }
              }
            }
          },
          pendingActivities: {
            $size: {
              $filter: {
                input: "$activities",
                cond: { $in: ["$$this.status", ["pending", "ai-approved", "ai-rejected"]] }
              }
            }
          },
          totalCredits: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$activities",
                    cond: { $eq: ["$$this.status", "approved"] }
                  }
                },
                as: "activity",
                in: "$$activity.credits"
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          rollNumber: 1,
          department: 1,
          year: 1,
          section: 1,
          cgpa: 1,
          overallAttendancePercentage: 1,
          totalActivities: 1,
          approvedActivities: 1,
          pendingActivities: 1,
          totalCredits: 1,
          avgCreditsPerActivity: {
            $cond: [
              { $gt: ["$approvedActivities", 0] },
              { $divide: ["$totalCredits", "$approvedActivities"] },
              0
            ]
          }
        }
      },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      { $limit: parseInt(limit) }
    ]);

    // Department-wise statistics
    const departmentStats = await Student.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: "activities",
          localField: "_id",
          foreignField: "studentId",
          as: "activities"
        }
      },
      {
        $group: {
          _id: "$department",
          studentCount: { $sum: 1 },
          avgCGPA: { $avg: "$cgpa" },
          avgAttendance: { $avg: "$overallAttendancePercentage" },
          totalActivities: { $sum: { $size: "$activities" } },
          avgActivitiesPerStudent: { $avg: { $size: "$activities" } }
        }
      },
      { $sort: { studentCount: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        students: studentPerformance,
        departmentStats,
        totalStudents: studentPerformance.length
      }
    });

  } catch (error) {
    console.error("Student analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/faculty/analytics/activities - Get detailed activity analytics
router.get("/activities", authMiddleware, checkFacultyRole, async (req, res) => {
  try {
    const { type, status, department, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    
    // Build activity filter
    const activityFilter = {};
    if (type) activityFilter.type = type;
    if (status) activityFilter.status = status;
    if (dateFrom || dateTo) {
      activityFilter.createdAt = {};
      if (dateFrom) activityFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) activityFilter.createdAt.$lte = new Date(dateTo);
    }

    // If department filter is specified, get students from that department
    if (department) {
      const students = await Student.find({ department, isActive: true }).select('_id');
      const studentIds = students.map(s => s._id);
      activityFilter.studentId = { $in: studentIds };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get activities with student details
    const activities = await Activity.find(activityFilter)
      .populate('studentId', 'name rollNumber department year section')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await Activity.countDocuments(activityFilter);

    // Activity statistics by status
    const statusStats = await Activity.aggregate([
      { $match: activityFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalCredits: { $sum: "$credits" },
          avgCredits: { $avg: "$credits" }
        }
      }
    ]);

    // Recent activity timeline
    const recentActivities = await Activity.find({
      ...activityFilter,
      $or: [
        { approvedBy: { $exists: true, $ne: null } },
        { rejectedBy: { $exists: true, $ne: null } }
      ]
    })
    .populate('studentId', 'name rollNumber')
    .sort({ updatedAt: -1 })
    .limit(10)
    .select('title type status approvedBy rejectedBy updatedAt studentId credits');

    res.json({
      success: true,
      data: {
        activities,
        statusStats,
        recentActivities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalActivities / parseInt(limit)),
          totalActivities,
          hasNext: skip + activities.length < totalActivities,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error("Activity analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/faculty/analytics/reports - Generate comprehensive reports
router.get("/reports", authMiddleware, checkFacultyRole, async (req, res) => {
  try {
    const { format = 'json', reportType = 'comprehensive' } = req.query;
    
    // Generate comprehensive report data
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastYear = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());

    // Overall statistics
    const overallStats = await Activity.aggregate([
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          approvedActivities: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          totalCredits: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$credits", 0] } },
          avgCredits: { $avg: { $cond: [{ $eq: ["$status", "approved"] }, "$credits", null] } }
        }
      }
    ]);

    // Monthly comparison
    const monthlyComparison = await Activity.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          credits: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$credits", 0] } }
        }
      }
    ]);

    // Department-wise breakdown
    const departmentBreakdown = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "activities",
          localField: "_id",
          foreignField: "studentId",
          as: "activities"
        }
      },
      {
        $group: {
          _id: "$department",
          studentCount: { $sum: 1 },
          totalActivities: { $sum: { $size: "$activities" } },
          approvedActivities: {
            $sum: {
              $size: {
                $filter: {
                  input: "$activities",
                  cond: { $eq: ["$$this.status", "approved"] }
                }
              }
            }
          },
          totalCredits: {
            $sum: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$activities",
                      cond: { $eq: ["$$this.status", "approved"] }
                    }
                  },
                  as: "activity",
                  in: "$$activity.credits"
                }
              }
            }
          }
        }
      }
    ]);

    // Top performers
    const topPerformers = await Activity.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$studentId",
          totalCredits: { $sum: "$credits" },
          activitiesCount: { $sum: 1 }
        }
      },
      { $sort: { totalCredits: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $project: {
          studentName: { $arrayElemAt: ["$student.name", 0] },
          rollNumber: { $arrayElemAt: ["$student.rollNumber", 0] },
          department: { $arrayElemAt: ["$student.department", 0] },
          totalCredits: 1,
          activitiesCount: 1
        }
      }
    ]);

    const reportData = {
      generatedAt: currentDate.toISOString(),
      reportType,
      period: {
        from: lastYear.toISOString(),
        to: currentDate.toISOString()
      },
      overallStats: overallStats[0] || {},
      monthlyComparison,
      departmentBreakdown,
      topPerformers,
      summary: {
        totalStudents: await Student.countDocuments({ isActive: true }),
        totalDepartments: departmentBreakdown.length,
        approvalRate: overallStats[0] ? Math.round((overallStats[0].approvedActivities / overallStats[0].totalActivities) * 100) : 0
      }
    };

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      let csv = "Report Type,Value\n";
      csv += `Total Activities,${reportData.overallStats.totalActivities || 0}\n`;
      csv += `Approved Activities,${reportData.overallStats.approvedActivities || 0}\n`;
      csv += `Total Credits,${reportData.overallStats.totalCredits || 0}\n`;
      csv += `Approval Rate,${reportData.summary.approvalRate}%\n`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="faculty-report-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: reportData
      });
    }

  } catch (error) {
    console.error("Reports generation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/faculty/analytics/filters - Get available filter options
router.get("/filters", authMiddleware, checkFacultyRole, async (req, res) => {
  try {
    // Get unique departments
    const departments = await Student.distinct("department", { isActive: true });
    
    // Get unique years
    const years = await Student.distinct("year", { isActive: true });
    
    // Get unique activity types
    const activityTypes = await Activity.distinct("type");
    
    // Get date range
    const dateRange = await Activity.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: "$createdAt" },
          maxDate: { $max: "$createdAt" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        departments: departments.sort(),
        years: years.sort(),
        activityTypes: activityTypes.sort(),
        dateRange: dateRange[0] || { minDate: null, maxDate: null }
      }
    });

  } catch (error) {
    console.error("Filters fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

module.exports = router;
