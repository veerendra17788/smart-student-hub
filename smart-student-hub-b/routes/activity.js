const express = require("express");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
// POST /api/activities → Add activity
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, type, date, credits, description, proofUrl} = req.body;

    // ✅ Validate required fields
    if (!title || !type || !date || !credits || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

     const newActivity = new Activity({
      title,
      type,
      date,
      credits,
      description,
      proofUrl: proofUrl || "", // optional
      studentId: req.user.userId, // from JWT
    });

    await newActivity.save();
    res.status(201).json({ message: "Activity submitted successfully", activity: newActivity });
  } catch (err) {
    console.error("❌ Error creating activity:", err.message);
    res.status(500).json({ message: "Error creating activity", error: err.message });
  }
});

// ✅ Get all activities (with optional filters)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ studentId: req.user.userId }).sort({ date: -1 });
    res.json({ activities });
  } catch (err) {
    console.error("❌ Error fetching activities:", err.message);
    res.status(500).json({ message: "Error fetching activities" });
  }
});

// ✅ Update activity
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch (err) {
    res.status(400).json({ message: "Error updating activity", error: err.message });
  }
});

// ✅ Delete activity
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      studentId: req.user.userId,
    });

    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting activity", error: err.message });
  }
});

module.exports = router;
