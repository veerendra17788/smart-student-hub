const mongoose = require('mongoose');

const academicEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: [
      'exam',
      'assignment',
      'holiday',
      'semester_start',
      'semester_end',
      'registration',
      'fee_payment',
      'workshop',
      'seminar',
      'cultural',
      'sports',
      'other'
    ],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isAllDay: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  year: {
    type: Number,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  reminderSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: Number, // minutes before event
      default: 60
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
academicEventSchema.index({ startDate: 1, endDate: 1 });
academicEventSchema.index({ eventType: 1 });
academicEventSchema.index({ department: 1, semester: 1 });
academicEventSchema.index({ year: 1 });

// Virtual for duration
academicEventSchema.virtual('duration').get(function() {
  return this.endDate - this.startDate;
});

// Instance method to check if event is ongoing
academicEventSchema.methods.isOngoing = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Instance method to check if event is upcoming
academicEventSchema.methods.isUpcoming = function() {
  const now = new Date();
  return this.startDate > now;
};

// Static method to get events for a specific date range
academicEventSchema.statics.getEventsInRange = function(startDate, endDate, filters = {}) {
  const query = {
    isActive: true,
    $or: [
      {
        startDate: { $gte: startDate, $lte: endDate }
      },
      {
        endDate: { $gte: startDate, $lte: endDate }
      },
      {
        startDate: { $lte: startDate },
        endDate: { $gte: endDate }
      }
    ]
  };

  // Apply additional filters
  if (filters.eventType) {
    query.eventType = filters.eventType;
  }
  if (filters.department) {
    query.department = filters.department;
  }
  if (filters.semester) {
    query.semester = filters.semester;
  }
  if (filters.year) {
    query.year = filters.year;
  }

  return this.find(query).sort({ startDate: 1 });
};

// Static method to get upcoming events
academicEventSchema.statics.getUpcomingEvents = function(limit = 10, filters = {}) {
  const now = new Date();
  const query = {
    isActive: true,
    startDate: { $gte: now },
    ...filters
  };

  return this.find(query)
    .sort({ startDate: 1 })
    .limit(limit);
};

module.exports = mongoose.model('AcademicCalendar', academicEventSchema);
