const mongoose = require("mongoose");

// Schema for semester-wise grades
const semesterGradeSchema = new mongoose.Schema({
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  subjects: [{
    subjectCode: {
      type: String,
      required: true
    },
    subjectName: {
      type: String,
      required: true
    },
    grade: {
      type: String,
      enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F', 'AB'],
      required: true
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    },
    marks: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  sgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  }
}, { _id: false });

// Schema for attendance tracking
const attendanceSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  totalClasses: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  attendedClasses: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  attendancePercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { _id: false });

// Schema for activities
const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['competition', 'certification', 'internship', 'project', 'workshop', 'seminar'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  organization: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['completed', 'ongoing', 'planned'],
    default: 'completed'
  },
  certificateUrl: {
    type: String
  },
  skills: [String]
}, { _id: false });

// Main Student Schema
const studentSchema = new mongoose.Schema({
  // Basic Information
  rollNumber: {
    type: String,
    required: [true, "Roll number is required"],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address"
    ]
  },
  passwordHash: {
    type: String,
    required: [true, "Password is required"]
  },
  role: {
    type: String,
    enum: ["student", "faculty", "admin"],
    default: "student"
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"]
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, "Gender is required"]
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: 16,
    max: 35
  },
  
  // Academic Information
  department: {
    type: String,
    required: [true, "Department is required"],
    enum: [
      'Computer Science and Engineering',
      'Information Technology',
      'Electronics and Communication Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Biotechnology',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Business Administration',
      'Commerce',
      'Economics'
    ]
  },
  year: {
    type: Number,
    required: [true, "Academic year is required"],
    min: 1,
    max: 4
  },
  section: {
    type: String,
    required: [true, "Section is required"],
    uppercase: true,
    match: [/^[A-Z]$/, "Section must be a single uppercase letter"]
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      required: [true, "Street address is required"]
    },
    city: {
      type: String,
      required: [true, "City is required"]
    },
    state: {
      type: String,
      required: [true, "State is required"]
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      default: "India"
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"]
    }
  },
  
  // Academic Performance
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 10;
      },
      message: 'CGPA must be between 0 and 10'
    }
  },
  semesterGrades: [semesterGradeSchema],
  
  // Attendance
  attendance: [attendanceSchema],
  overallAttendancePercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Activities
  activities: [activitySchema],
  
  // Skills
  skills: [{
    type: String,
    trim: true
  }],
  
  // Additional Information
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profilePicture: {
    type: String // URL to profile picture
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
studentSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state}, ${this.address.country} - ${this.address.pincode}`;
});

// Virtual for current semester based on year
studentSchema.virtual('currentSemester').get(function() {
  return (this.year * 2) - 1; // Assuming odd semester for current calculation
});

// Pre-save middleware to calculate attendance percentage
studentSchema.pre('save', function(next) {
  // Calculate individual subject attendance percentages
  this.attendance.forEach(subject => {
    if (subject.totalClasses > 0) {
      subject.attendancePercentage = Math.round((subject.attendedClasses / subject.totalClasses) * 100);
    }
  });
  
  // Calculate overall attendance percentage
  if (this.attendance.length > 0) {
    const totalClasses = this.attendance.reduce((sum, subject) => sum + subject.totalClasses, 0);
    const totalAttended = this.attendance.reduce((sum, subject) => sum + subject.attendedClasses, 0);
    
    if (totalClasses > 0) {
      this.overallAttendancePercentage = Math.round((totalAttended / totalClasses) * 100);
    }
  }
  
  next();
});

// Instance method to add attendance for a subject
studentSchema.methods.updateAttendance = function(subjectCode, totalClasses, attendedClasses) {
  const existingSubject = this.attendance.find(att => att.subjectCode === subjectCode);
  
  if (existingSubject) {
    existingSubject.totalClasses = totalClasses;
    existingSubject.attendedClasses = attendedClasses;
  } else {
    this.attendance.push({
      subjectCode,
      totalClasses,
      attendedClasses
    });
  }
  
  return this.save();
};

// Instance method to add activity
studentSchema.methods.addActivity = function(activityData) {
  this.activities.push(activityData);
  return this.save();
};

// Static method to find students by department and year
studentSchema.statics.findByDepartmentAndYear = function(department, year) {
  return this.find({ department, year, isActive: true });
};

// Static method to get students with low attendance
studentSchema.statics.findLowAttendanceStudents = function(threshold = 75) {
  return this.find({ 
    overallAttendancePercentage: { $lt: threshold },
    isActive: true 
  });
};

// Indexes for better query performance
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ department: 1, year: 1 });
studentSchema.index({ cgpa: -1 });
studentSchema.index({ overallAttendancePercentage: 1 });

module.exports = mongoose.model("Student", studentSchema);
