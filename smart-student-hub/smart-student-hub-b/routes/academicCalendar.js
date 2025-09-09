const express = require('express');
const AcademicCalendar = require('../models/AcademicCalendar');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/academic-calendar - Get all academic events
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      eventType, 
      department, 
      semester, 
      year,
      limit = 50 
    } = req.query;

    let query = { isActive: true };
    
    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      query.$or = [
        { startDate: { $gte: start, $lte: end } },
        { endDate: { $gte: start, $lte: end } },
        { startDate: { $lte: start }, endDate: { $gte: end } }
      ];
    }

    // Additional filters
    if (eventType) query.eventType = eventType;
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (year) query.year = parseInt(year);

    const events = await AcademicCalendar.find(query)
      .sort({ startDate: 1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: events,
      count: events.length
    });

  } catch (error) {
    console.error('Error fetching academic calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch academic calendar events',
      error: error.message
    });
  }
});

// GET /api/academic-calendar/upcoming - Get upcoming events
router.get('/upcoming', authMiddleware, async (req, res) => {
  try {
    const { limit = 10, eventType, department, semester } = req.query;
    
    const filters = {};
    if (eventType) filters.eventType = eventType;
    if (department) filters.department = department;
    if (semester) filters.semester = parseInt(semester);

    const events = await AcademicCalendar.getUpcomingEvents(parseInt(limit), filters);

    res.json({
      success: true,
      data: events,
      count: events.length
    });

  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
      error: error.message
    });
  }
});

// GET /api/academic-calendar/month/:year/:month - Get events for specific month
router.get('/month/:year/:month', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.params;
    const { eventType, department, semester } = req.query;

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const filters = {};
    if (eventType) filters.eventType = eventType;
    if (department) filters.department = department;
    if (semester) filters.semester = parseInt(semester);

    const events = await AcademicCalendar.getEventsInRange(startDate, endDate, filters);

    res.json({
      success: true,
      data: events,
      count: events.length,
      month: {
        year: parseInt(year),
        month: parseInt(month),
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Error fetching monthly events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly events',
      error: error.message
    });
  }
});

// GET /api/academic-calendar/stats/summary - Get calendar statistics
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalEvents,
      upcomingEvents,
      monthlyEvents,
      eventsByType
    ] = await Promise.all([
      AcademicCalendar.countDocuments({ isActive: true }),
      AcademicCalendar.countDocuments({ 
        isActive: true, 
        startDate: { $gte: now } 
      }),
      AcademicCalendar.countDocuments({
        isActive: true,
        startDate: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      AcademicCalendar.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        monthlyEvents,
        eventsByType,
        currentMonth: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          name: now.toLocaleString('default', { month: 'long' })
        }
      }
    });

  } catch (error) {
    console.error('Error fetching calendar statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar statistics',
      error: error.message
    });
  }
});

// GET /api/academic-calendar/:id - Get specific event
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await AcademicCalendar.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'rollNumber name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
});

// POST /api/academic-calendar - Create new academic event (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      isAllDay,
      location,
      department,
      semester,
      year,
      priority,
      color,
      tags,
      reminderSettings
    } = req.body;

    // Validate required fields
    if (!title || !eventType || !startDate || !endDate || !year) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, eventType, startDate, endDate, year'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const newEvent = new AcademicCalendar({
      title,
      description,
      eventType,
      startDate: start,
      endDate: end,
      isAllDay: isAllDay !== undefined ? isAllDay : true,
      location,
      department,
      semester,
      year,
      priority: priority || 'medium',
      color: color || '#3B82F6',
      tags: tags || [],
      reminderSettings: reminderSettings || { enabled: true, reminderTime: 60 },
      createdBy: req.user.userId
    });

    await newEvent.save();

    const populatedEvent = await AcademicCalendar.findById(newEvent._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Academic event created successfully',
      data: populatedEvent
    });

  } catch (error) {
    console.error('Error creating academic event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create academic event',
      error: error.message
    });
  }
});

// PUT /api/academic-calendar/:id - Update academic event (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);
      
      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    const updatedEvent = await AcademicCalendar.findByIdAndUpdate(
      eventId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Academic event updated successfully',
      data: updatedEvent
    });

  } catch (error) {
    console.error('Error updating academic event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update academic event',
      error: error.message
    });
  }
});

// DELETE /api/academic-calendar/:id - Delete academic event (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;

    const deletedEvent = await AcademicCalendar.findByIdAndUpdate(
      eventId,
      { isActive: false },
      { new: true }
    );

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Academic event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting academic event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete academic event',
      error: error.message
    });
  }
});

module.exports = router;
