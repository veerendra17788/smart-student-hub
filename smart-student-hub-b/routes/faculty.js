const express = require("express");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all activities for faculty (optionally filtered by status)
router.get("/activities", authMiddleware, async (req, res) => {
  try {
    // Only faculty can access this
    if (req.user.role !== "faculty") {
      return res.status(403).json({ message: "Access denied" });
    }

    const activities = await Activity.find().sort({ createdAt: -1 }).populate("studentId", "name rollNumber");
    res.json({ activities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching activities" });
  }
});

// Approve activity
router.post("/activities/:id/approve", authMiddleware, async (req, res) => {
  try {
    const facultyName = req.body.facultyName || "Faculty"; // optional
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { status: "approved", approvedBy: facultyName, approvedDate: new Date() },
      { new: true }
    );
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ activity });
  } catch (err) {
    console.error("❌ Error approving activity:", err.message);
    res.status(500).json({ message: "Error approving activity" });
  }
});

// Reject activity
router.post("/activities/:id/reject", authMiddleware, async (req, res) => {
  try {
    const { reason, facultyName } = req.body;
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectedBy: facultyName, rejectedDate: new Date(), reason },
      { new: true }
    );
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ activity });
  } catch (err) {
    console.error("❌ Error rejecting activity:", err.message);
    res.status(500).json({ message: "Error rejecting activity" });
  }
});

module.exports = router;
