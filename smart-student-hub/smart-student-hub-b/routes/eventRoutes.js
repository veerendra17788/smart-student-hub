const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// ✅ Create new event (faculty only)
router.post("/", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get single event by ID
router.get("/:id", async (req, res) => {
  try {
    let event;
    
    // Try to find by MongoDB ObjectId first
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(req.params.id);
    } else {
      // If not ObjectId, try to find by numeric id field
      event = await Event.findOne({ id: parseInt(req.params.id) });
    }
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all events (with filters: upcoming/past)
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    let filter = {};
    const now = new Date();

    if (type === "upcoming") {
      filter.date = { $gte: now };
    } else if (type === "past") {
      filter.date = { $lt: now };
    }

    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Register student for event
router.post("/:id/register", async (req, res) => {
  try {
    const { studentId, name, email, department, year, phone } = req.body;
    let event;
    
    // Try to find by MongoDB ObjectId first
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(req.params.id);
    } else {
      // If not ObjectId, try to find by numeric id field
      event = await Event.findOne({ id: parseInt(req.params.id) });
    }

    if (!event) return res.status(404).json({ error: "Event not found" });

    // Initialize registrations array if it doesn't exist
    if (!event.registrations) {
      event.registrations = [];
    }

    // Check if student is already registered
    const alreadyRegistered = event.registrations.some(reg => reg.studentId === studentId);
    if (alreadyRegistered) {
      return res.status(400).json({ error: "Already registered" });
    }

    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({ error: "Event is full" });
    }

    // Add registration with full student data
    const registration = {
      studentId,
      name,
      email,
      department,
      year,
      phone,
      registeredAt: new Date()
    };

    event.registrations.push(registration);
    await event.save();

    res.json({ 
      message: "Registered successfully", 
      registration,
      event: {
        id: event.id || event._id,
        title: event.title,
        registeredCount: event.registrations.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add feedback after event
router.post("/:id/feedback", async (req, res) => {
  try {
    const { studentId, rating, comment } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ error: "Event not found" });

    event.feedback.push({ studentId, rating, comment });
    await event.save();

    res.json({ message: "Feedback submitted", event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update event (faculty only)
router.put("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete event (faculty only)
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get event registrations (faculty only)
router.get("/:id/registrations", async (req, res) => {
  try {
    let event;
    
    // Try to find by MongoDB ObjectId first
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(req.params.id);
    } else {
      // If not ObjectId, try to find by numeric id field
      event = await Event.findOne({ id: parseInt(req.params.id) });
    }
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Return the registrations array directly (contains full student data)
    const registrations = event.registrations || [];
    
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Analytics
router.get("/analytics/summary", async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalAttendees = (await Event.aggregate([
      { $project: { count: { $size: "$registered" } } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]))[0]?.total || 0;

    const avgRating = (await Event.aggregate([
      { $unwind: "$feedback" },
      { $group: { _id: null, avg: { $avg: "$feedback.rating" } } }
    ]))[0]?.avg || 0;

    const pastEvents = await Event.find({ date: { $lt: new Date() } });
    const attendanceRate = pastEvents.length > 0
      ? Math.round((pastEvents.reduce((sum, e) => sum + e.registered.length, 0) /
        pastEvents.reduce((sum, e) => sum + e.capacity, 0)) * 100)
      : 0;

    res.json({
      totalEvents,
      totalAttendees,
      avgRating: avgRating.toFixed(1),
      attendanceRate: `${attendanceRate}%`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
