const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String
    required: true,
    unique: true
  },
  personalInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    rollNumber: String,
    department: String,
    year: Number,
    section: String,
    cgpa: Number,
    age: Number,
    gender: String,
    bloodGroup: String,
    overallAttendancePercentage: Number,
    bio: String,
    profileImage: String,
    location: String,
    website: String,
    linkedin: String,
    github: String
  },
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    grade: String,
    description: String
  }],
  experience: [{
    company: String,
    position: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
    technologies: [String]
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    startDate: Date,
    endDate: Date,
    githubUrl: String,
    liveUrl: String,
    images: [String]
  }],
  skills: {
    technical: [String],
    soft: [String],
    languages: [String]
  },
  achievements: [{
    title: String,
    description: String,
    date: Date,
    issuer: String,
    credentialUrl: String
  }],
  activities: [{
    title: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    credits: { type: Number, default: 0 },
    description: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    organization: String,
    status: String,
    skills: [String]
  }],
  certificates: [{
    title: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String,
    verified: { type: Boolean, default: false }
  }],
  customization: {
    template: {
      type: String,
      enum: ['classic', 'modern', 'creative'],
      default: 'modern'
    },
    colors: {
      primary: { type: String, default: '#3B82F6' },
      secondary: { type: String, default: '#64748B' },
      accent: { type: String, default: '#10B981' }
    },
    fonts: {
      heading: { type: String, default: 'Inter' },
      body: { type: String, default: 'Inter' }
    },
    sections: {
      personalInfo: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      activities: { type: Boolean, default: true },
      certificates: { type: Boolean, default: true }
    }
  },
  settings: {
    isPublic: { type: Boolean, default: false },
    publicUrl: { type: String, unique: true, sparse: true },
    allowDownload: { type: Boolean, default: true },
    showContact: { type: Boolean, default: true }
  },
  analytics: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    lastViewed: Date
  }
}, {
  timestamps: true
});

// Generate unique public URL before saving
portfolioSchema.pre('save', function(next) {
  if (this.settings.isPublic && !this.settings.publicUrl) {
    this.settings.publicUrl = generateUniqueId();
  }
  next();
});

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = mongoose.model('Portfolio', portfolioSchema);
