const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  // Basic Information
  facultyId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    enum: ['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.'],
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  alternatePhone: String,
  
  // Personal Details
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  nationality: {
    type: String,
    default: 'Indian'
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed']
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Professional Information
  department: {
    type: String,
    required: true,
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
      'English',
      'Management Studies',
      'Economics',
      'Psychology',
      'Architecture',
      'Design',
      'Liberal Arts'
    ]
  },
  designation: {
    type: String,
    required: true,
    enum: [
      'Professor',
      'Associate Professor',
      'Assistant Professor',
      'Senior Lecturer',
      'Lecturer',
      'Research Fellow',
      'Visiting Professor',
      'Emeritus Professor',
      'Head of Department',
      'Dean',
      'Director',
      'Principal'
    ]
  },
  employmentType: {
    type: String,
    enum: ['Permanent', 'Contract', 'Visiting', 'Adjunct', 'Part-time'],
    default: 'Permanent'
  },
  joiningDate: {
    type: Date,
    required: true
  },
  experience: {
    total: { type: Number, default: 0 }, // in years
    teaching: { type: Number, default: 0 },
    industry: { type: Number, default: 0 },
    research: { type: Number, default: 0 }
  },
  
  // Academic Qualifications
  qualifications: [{
    degree: {
      type: String,
      required: true,
      enum: ['Ph.D', 'M.Tech', 'M.E', 'M.S', 'M.Sc', 'M.A', 'MBA', 'B.Tech', 'B.E', 'B.Sc', 'B.A', 'Diploma', 'Certificate']
    },
    field: String,
    university: String,
    year: Number,
    grade: String,
    specialization: String
  }],
  
  // Research & Publications
  researchAreas: [String],
  publications: {
    journals: { type: Number, default: 0 },
    conferences: { type: Number, default: 0 },
    books: { type: Number, default: 0 },
    chapters: { type: Number, default: 0 },
    patents: { type: Number, default: 0 }
  },
  hIndex: { type: Number, default: 0 },
  citationCount: { type: Number, default: 0 },
  
  // Teaching Information
  subjectsTeaching: [String],
  coursesHandled: [{
    courseCode: String,
    courseName: String,
    semester: String,
    year: String,
    credits: Number
  }],
  teachingLoad: { type: Number, default: 0 }, // hours per week
  
  // Administrative Roles
  administrativeRoles: [{
    position: String,
    department: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false }
  }],
  
  // Professional Memberships
  professionalMemberships: [{
    organization: String,
    membershipType: String,
    membershipId: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: true }
  }],
  
  // Awards & Recognition
  awards: [{
    title: String,
    organization: String,
    year: Number,
    category: String,
    description: String
  }],
  
  // Projects & Grants
  projects: [{
    title: String,
    fundingAgency: String,
    amount: Number,
    duration: String,
    role: { type: String, enum: ['Principal Investigator', 'Co-Principal Investigator', 'Co-Investigator'] },
    status: { type: String, enum: ['Ongoing', 'Completed', 'Submitted', 'Approved'] },
    startDate: Date,
    endDate: Date
  }],
  
  // Consultancy & Industry Interaction
  consultancyProjects: [{
    company: String,
    project: String,
    amount: Number,
    duration: String,
    year: Number
  }],
  
  // Student Guidance
  studentsGuided: {
    phd: { type: Number, default: 0 },
    mtech: { type: Number, default: 0 },
    btech: { type: Number, default: 0 },
    ongoing: { type: Number, default: 0 },
    completed: { type: Number, default: 0 }
  },
  
  // Performance Metrics
  teachingRating: { type: Number, min: 1, max: 5, default: 4 },
  researchRating: { type: Number, min: 1, max: 5, default: 3 },
  serviceRating: { type: Number, min: 1, max: 5, default: 3 },
  
  // Financial Information
  salary: {
    basic: Number,
    allowances: Number,
    total: Number,
    payScale: String
  },
  
  // Leave & Attendance
  leaveBalance: {
    casual: { type: Number, default: 12 },
    earned: { type: Number, default: 30 },
    medical: { type: Number, default: 12 },
    maternity: { type: Number, default: 180 }
  },
  
  // Digital Presence
  profiles: {
    googleScholar: String,
    researchGate: String,
    linkedin: String,
    orcid: String,
    scopus: String
  },
  
  // System Information
  role: { type: String, default: 'faculty' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  profilePicture: String,
  bio: String,
  officeLocation: String,
  officeHours: String,
  passwordHash: String,
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Virtual for full name
facultySchema.virtual('fullName').get(function() {
  return `${this.title} ${this.firstName} ${this.lastName}`;
});

// Virtual for age
facultySchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    return Math.floor((Date.now() - this.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }
  return null;
});

// Virtual for total experience
facultySchema.virtual('totalExperience').get(function() {
  if (this.joiningDate) {
    return Math.floor((Date.now() - this.joiningDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }
  return 0;
});

// Index for better query performance
facultySchema.index({ facultyId: 1 });
facultySchema.index({ employeeId: 1 });
facultySchema.index({ email: 1 });
facultySchema.index({ department: 1 });
facultySchema.index({ designation: 1 });
facultySchema.index({ isActive: 1 });

// Pre-save middleware
facultySchema.pre('save', function(next) {
  // Calculate total experience
  if (this.joiningDate) {
    this.experience.total = Math.floor((Date.now() - this.joiningDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }
  
  // Calculate total salary if components are provided
  if (this.salary && this.salary.basic && this.salary.allowances) {
    this.salary.total = this.salary.basic + this.salary.allowances;
  }
  
  next();
});

module.exports = mongoose.model("Faculty", facultySchema);
