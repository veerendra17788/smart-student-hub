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

// GET /api/faculty/dashboard/stats - Get dashboard statistics
router.get("/stats", authMiddleware, checkFacultyRole, async (req, res) => {
  try {
    // Get current date for filtering
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    // Get pending approvals count
    const pendingApprovals = await Activity.countDocuments({
      status: { $in: ["pending", "ai-approved", "ai-rejected"] }
    });

    // Get total students supervised (active students)
    const totalStudents = await Student.countDocuments({ isActive: true });

    // Get events/activities this month
    const eventsThisMonth = await Activity.countDocuments({
      createdAt: { $gte: currentMonth, $lt: nextMonth }
    });

    // Calculate approval rate
    const totalProcessed = await Activity.countDocuments({
      status: { $in: ["approved", "rejected"] }
    });
    const totalApproved = await Activity.countDocuments({ status: "approved" });
    const approvalRate = totalProcessed > 0 ? Math.round((totalApproved / totalProcessed) * 100) : 0;

    // Get recent activities (last 10 approved/rejected activities)
    const recentActivities = await Activity.find({
      status: { $in: ["approved", "rejected"] }
    })
    .populate("studentId", "name")
    .sort({ updatedAt: -1 })
    .limit(10)
    .select("title status approvedBy rejectedBy updatedAt studentId");

    // Format recent activities for display
    const formattedRecentActivities = recentActivities.map(activity => {
      const timeDiff = Date.now() - activity.updatedAt.getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const daysAgo = Math.floor(hoursAgo / 24);
      
      let timeString;
      if (daysAgo > 0) {
        timeString = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
      } else if (hoursAgo > 0) {
        timeString = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
      } else {
        timeString = "Less than an hour ago";
      }

      const action = activity.status === "approved" 
        ? `Approved ${activity.title} for ${activity.studentId?.name || 'Unknown Student'}`
        : `Rejected ${activity.title} for ${activity.studentId?.name || 'Unknown Student'}`;

      return {
        action,
        time: timeString,
        status: activity.status
      };
    });

    // Get department statistics
    const departmentStats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          avgCGPA: { $avg: "$cgpa" },
          avgAttendance: { $avg: "$overallAttendancePercentage" }
        }
      }
    ]);

    const stats = departmentStats[0] || {
      totalStudents: 0,
      avgCGPA: 0,
      avgAttendance: 0
    };

    // Get active students (students with recent activity)
    const activeStudents = await Activity.distinct("studentId", {
      createdAt: { $gte: currentMonth, $lt: nextMonth }
    });

    res.json({
      success: true,
      data: {
        stats: {
          pendingApprovals,
          totalStudents,
          eventsThisMonth,
          approvalRate
        },
        recentActivities: formattedRecentActivities,
        departmentStats: {
          totalStudents: stats.totalStudents,
          activeStudents: activeStudents.length,
          avgCredits: Math.round(stats.avgCGPA * 10) / 10, // Using CGPA as credits approximation
          approvalRate
        }
      }
    });

  } catch (error) {
    console.error("Faculty dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/faculty/dashboard/pending-approvals - Get pending approvals for dashboard
router.get("/pending-approvals", authMiddleware, checkFacultyRole, async (req, res) => {
  try {
    const pendingActivities = await Activity.find({
      status: { $in: ["pending", "ai-approved", "ai-rejected"] }
    })
    .populate("studentId", "name rollNumber")
    .sort({ createdAt: -1 })
    .limit(5) // Limit to 5 for dashboard display
    .select("title type date credits status aiDecision createdAt studentId");

    // Format activities for dashboard display
    const formattedActivities = pendingActivities.map(activity => {
      // Determine urgency based on creation date (older than 3 days is urgent)
      const daysSinceCreated = Math.floor((Date.now() - activity.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const urgent = daysSinceCreated > 3;

      return {
        id: activity._id,
        studentName: activity.studentId?.name || 'Unknown Student',
        activity: activity.title,
        type: activity.type,
        date: activity.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        credits: activity.credits,
        urgent,
        status: activity.status,
        aiDecision: activity.aiDecision
      };
    });

    res.json({
      success: true,
      data: formattedActivities
    });

  } catch (error) {
    console.error("Pending approvals fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/faculty/dashboard/analytics - Get analytics data for dashboard
router.get("/analytics", authMiddleware, checkFacultyRole, async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Activity type distribution
    const activityTypeStats = await Activity.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalCredits: { $sum: "$credits" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly activity trends
    const monthlyTrends = await Activity.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Top performing students (by approved credits)
    const topStudents = await Activity.aggregate([
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
          totalCredits: 1,
          activitiesCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        activityTypeStats,
        monthlyTrends,
        topStudents
      }
    });

  } catch (error) {
    console.error("Faculty analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/faculty/dashboard/recent-activities - Get recent faculty activities
router.get("/recent-activities", authMiddleware, checkFacultyRole, async (req, res) => {
  try {
    const recentActivities = await Activity.find({
      $or: [
        { approvedBy: { $exists: true, $ne: null } },
        { rejectedBy: { $exists: true, $ne: null } }
      ]
    })
    .populate("studentId", "name")
    .sort({ updatedAt: -1 })
    .limit(20)
    .select("title status approvedBy rejectedBy updatedAt studentId type");

    const formattedActivities = recentActivities.map(activity => {
      const timeDiff = Date.now() - activity.updatedAt.getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const daysAgo = Math.floor(hoursAgo / 24);
      
      let timeString;
      if (daysAgo > 0) {
        timeString = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
      } else if (hoursAgo > 0) {
        timeString = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
      } else {
        timeString = "Less than an hour ago";
      }

      const facultyName = activity.approvedBy || activity.rejectedBy || "Faculty";
      const action = activity.status === "approved" 
        ? `${facultyName} approved ${activity.type} for ${activity.studentId?.name || 'Unknown Student'}`
        : `${facultyName} rejected ${activity.type} for ${activity.studentId?.name || 'Unknown Student'}`;

      return {
        action,
        time: timeString,
        status: activity.status,
        type: activity.type
      };
    });

    res.json({
      success: true,
      data: formattedActivities
    });

  } catch (error) {
    console.error("Recent activities fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

module.exports = router;
