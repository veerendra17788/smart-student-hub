const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Activity = require("../models/Activity");
const Event = require("../models/Event");

const router = express.Router();

// Get student dashboard data
router.get("/student/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get activities statistics
    const activities = await Activity.find({ studentId: userId });
    const totalActivities = activities.length;
    const approvedActivities = activities.filter(a => a.status === "approved" || a.status === "ai-approved").length;
    const pendingActivities = activities.filter(a => a.status === "pending").length;
    const rejectedActivities = activities.filter(a => a.status === "rejected" || a.status === "ai-rejected").length;
    const totalCredits = activities
      .filter(a => a.status === "approved" || a.status === "ai-approved")
      .reduce((sum, a) => sum + (a.credits || 0), 0);

    // Get recent activities (last 5)
    const recentActivities = await Activity.find({ studentId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status credits createdAt type description');

    // Get upcoming events (registered events)
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() },
      'registrations.studentId': userId
    })
    .sort({ date: 1 })
    .limit(5)
    .select('title date time location type');

    // Get past events (for attendance tracking)
    const pastEvents = await Event.find({
      date: { $lt: new Date() },
      'registrations.studentId': userId
    });

    // Calculate semester progress (assuming 100 credits target)
    const semesterTarget = 100;
    const creditsProgress = Math.min((totalCredits / semesterTarget) * 100, 100);
    
    // Calculate events attendance
    const totalRegisteredEvents = await Event.countDocuments({
      'registrations.studentId': userId
    });
    const eventsProgress = totalRegisteredEvents > 0 ? 
      Math.min((pastEvents.length / totalRegisteredEvents) * 100, 100) : 0;

    res.json({
      stats: {
        totalActivities,
        approvedActivities,
        pendingActivities,
        rejectedActivities,
        totalCredits
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity._id,
        title: activity.title,
        status: activity.status,
        credits: activity.credits,
        date: activity.createdAt,
        category: activity.category
      })),
      upcomingEvents: upcomingEvents.map(event => ({
        id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        type: event.type
      })),
      progress: {
        credits: {
          current: totalCredits,
          target: semesterTarget,
          percentage: creditsProgress
        },
        events: {
          attended: pastEvents.length,
          registered: totalRegisteredEvents,
          percentage: eventsProgress
        }
      }
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get general dashboard info (for authenticated user)
router.get("/", authMiddleware, (req, res) => {
  res.json({
    message: `Welcome ${req.user.role}!`,
    userId: req.user.userId,
    role: req.user.role,
  });
});

module.exports = router;
