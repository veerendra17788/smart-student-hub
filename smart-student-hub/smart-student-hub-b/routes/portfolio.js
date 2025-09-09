const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const Student = require('../models/Student');
const Activity = require('../models/Activity');
const handlebars = require('handlebars');

// Register Handlebars helpers
handlebars.registerHelper('substring', function(str, start, length) {
  if (!str) return '';
  return str.substring(start, start + length);
});

handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
});

handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');

// Get user's portfolio data
router.get('/data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Portfolio API called with userId:', userId);
    
    // Clean up any existing portfolios with null studentId that might cause conflicts
    try {
      await Portfolio.deleteMany({ 
        $or: [
          { studentId: null },
          { studentId: { $exists: false } },
          { userId: null },
          { userId: { $exists: false } }
        ]
      });
      console.log('Cleaned up invalid portfolio records');
    } catch (cleanupError) {
      console.log('Cleanup warning:', cleanupError.message);
    }
    
    let student;
    let activities = [];
    
    // First try to find by rollNumber (if userId looks like a roll number)
    if (userId && typeof userId === 'string' && userId.length <= 20) {
      console.log('Searching by roll number:', userId.toUpperCase());
      student = await Student.findOne({ rollNumber: userId.toUpperCase() });
    }
    
    // If not found by roll number, try by ObjectId
    if (!student && mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Searching by ObjectId:', userId);
      student = await Student.findById(userId);
    }
    
    // If still not found, try by email
    if (!student && userId.includes('@')) {
      console.log('Searching by email:', userId.toLowerCase());
      student = await Student.findOne({ email: userId.toLowerCase() });
    }
    
    console.log('Student found:', student ? 'Yes' : 'No');
    
    // If no student found, return error
    if (!student) {
      console.log('No student found for userId:', userId);
      return res.status(404).json({ error: 'Student not found. Please provide valid roll number, email, or student ID.' });
    }
    
    // Get student's activities from Activity collection
    try {
      console.log('Fetching activities for student:', student._id);
      activities = await Activity.find({ 
        $or: [
          { userId: student._id },
          { rollNumber: student.rollNumber },
          { email: student.email }
        ]
      }).sort({ date: -1 });
      console.log('Activities from Activity collection:', activities.length);
    } catch (activityError) {
      console.log('Error fetching activities from Activity collection:', activityError.message);
      activities = [];
    }
    
    // Also include activities from student's own activities array
    try {
      const studentActivities = (student.activities || []).map(activity => ({
        title: activity.title || 'Untitled Activity',
        type: activity.type || 'other',
        date: activity.startDate || activity.endDate || new Date(),
        credits: 5, // Default credits for student activities
        description: activity.description || '',
        organization: activity.organization || '',
        status: activity.status || 'completed',
        skills: activity.skills || [],
        verified: false
      }));
      console.log('Activities from student record:', studentActivities.length);
      
      // Combine both activity sources
      activities = [...activities, ...studentActivities];
    } catch (studentActivityError) {
      console.log('Error processing student activities:', studentActivityError.message);
    }

    // Get existing portfolio or create default structure
    let portfolio = await Portfolio.findOne({ 
      $or: [
        { userId: student._id },
        { userId: student.rollNumber },
        { userId: userId },
        { studentId: student._id }, // Check for old studentId field
        { studentId: student.rollNumber }
      ]
    });
    
    if (!portfolio) {
      // Create portfolio data object first
      const portfolioData = {
        userId: student._id,
        personalInfo: {
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          rollNumber: student.rollNumber || '',
          department: student.department || '',
          year: student.year || '',
          section: student.section || '',
          cgpa: student.cgpa || 0,
          bio: `${student.department} student with ${student.cgpa} CGPA, passionate about technology and innovation.`,
          profileImage: student.profilePicture || '',
          location: student.fullAddress || '',
          age: student.age || '',
          gender: student.gender || '',
          bloodGroup: student.bloodGroup || '',
          overallAttendancePercentage: student.overallAttendancePercentage || 0
        },
        activities: activities,
        // Auto-extract skills from activities
        skills: {
          technical: extractSkillsFromActivities(activities, 'technical'),
          soft: extractSkillsFromActivities(activities, 'soft'),
          languages: extractSkillsFromActivities(activities, 'languages')
        },
        achievements: activities
          .filter(a => a.type === 'Achievement' || a.type === 'Award' || a.type === 'competition')
          .map(a => ({
            title: a.title,
            description: a.description,
            date: a.date,
            issuer: a.issuer || a.organization || 'Institution'
          })),
        certificates: activities
          .filter(a => a.type === 'Certification' || a.type === 'certification')
          .map(a => ({
            title: a.title,
            issuer: a.issuer || a.organization || 'Certification Body',
            issueDate: a.date,
            verified: a.verified || false
          })),
        education: {
          degree: `Bachelor of Technology in ${student.department || 'Engineering'}`,
          institution: 'University/College Name',
          year: student.year || 1,
          cgpa: student.cgpa || 0,
          semester: student.currentSemester || ((student.year || 1) * 2) - 1
        },
        projects: activities
          .filter(a => a.type === 'project')
          .map(a => ({
            title: a.title,
            description: a.description,
            date: a.date,
            organization: a.organization,
            skills: a.skills || []
          })),
        internships: activities
          .filter(a => a.type === 'internship')
          .map(a => ({
            title: a.title,
            description: a.description,
            organization: a.organization,
            startDate: a.startDate,
            endDate: a.endDate,
            status: a.status
          }))
      };
      
      // Create the portfolio instance
      console.log('Creating new portfolio for student:', student._id);
      try {
        portfolio = new Portfolio(portfolioData);
        await portfolio.save();
        console.log('Portfolio created successfully');
      } catch (saveError) {
        if (saveError.code === 11000) {
          console.log('Duplicate key error, trying to find existing portfolio...');
          // Try to find existing portfolio with different criteria
          portfolio = await Portfolio.findOne({}) // Find any existing portfolio
            .sort({ createdAt: -1 }); // Get the most recent one
          
          if (portfolio) {
            console.log('Found existing portfolio, updating it...');
            // Update the existing portfolio with new data
            Object.assign(portfolio, portfolioData);
            await portfolio.save();
          } else {
            // If still no portfolio found, create with upsert
            portfolio = await Portfolio.findOneAndUpdate(
              { userId: student._id },
              portfolioData,
              { upsert: true, new: true }
            );
          }
        } else {
          throw saveError;
        }
      }
    } else {
      // Update existing portfolio with latest student data
      portfolio.personalInfo = {
        ...portfolio.personalInfo,
        name: student.name || portfolio.personalInfo.name,
        email: student.email || portfolio.personalInfo.email,
        phone: student.phone || portfolio.personalInfo.phone,
        rollNumber: student.rollNumber || portfolio.personalInfo.rollNumber,
        department: student.department || portfolio.personalInfo.department,
        year: student.year || portfolio.personalInfo.year,
        section: student.section || portfolio.personalInfo.section,
        cgpa: student.cgpa || portfolio.personalInfo.cgpa,
        overallAttendancePercentage: student.overallAttendancePercentage || portfolio.personalInfo.overallAttendancePercentage
      };
      
      // Update activities with latest data
      portfolio.activities = activities;
      
      // Update skills
      portfolio.skills = {
        technical: [...new Set([...(portfolio.skills?.technical || []), ...extractSkillsFromActivities(activities, 'technical'), ...(student.skills || [])])],
        soft: [...new Set([...(portfolio.skills?.soft || []), ...extractSkillsFromActivities(activities, 'soft')])],
        languages: [...new Set([...(portfolio.skills?.languages || []), ...extractSkillsFromActivities(activities, 'languages')])]
      };
      
      await portfolio.save();
    }

    console.log('Returning portfolio data');
    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch portfolio data',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update portfolio
router.put('/update/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    let portfolio = await Portfolio.findOne({ 
      $or: [
        { userId: userId },
        { userId: mongoose.Types.ObjectId.isValid(userId) ? userId : null }
      ]
    });
    
    if (!portfolio) {
      // Find student to get proper userId
      let student = await Student.findOne({ rollNumber: userId.toUpperCase() }) || 
                   await Student.findById(userId) || 
                   await Student.findOne({ email: userId.toLowerCase() });
      
      if (student) {
        portfolio = new Portfolio({ userId: student._id, ...updateData });
      } else {
        portfolio = new Portfolio({ userId, ...updateData });
      }
    } else {
      Object.assign(portfolio, updateData);
    }

    await portfolio.save();
    res.json(portfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
});

// Generate portfolio HTML with template
router.get('/generate/:userId/:template', async (req, res) => {
  try {
    const { userId, template } = req.params;
    
    const portfolio = await Portfolio.findOne({ 
      $or: [
        { userId: userId },
        { userId: mongoose.Types.ObjectId.isValid(userId) ? userId : null }
      ]
    });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const templatePath = path.join(__dirname, '..', 'templates', `${template}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf8');
    
    const compiledTemplate = handlebars.compile(templateContent);
    const html = compiledTemplate({
      ...portfolio.toObject(),
      colors: portfolio.customization.colors,
      fonts: portfolio.customization.fonts,
      sections: portfolio.customization.sections
    });

    res.send(html);
  } catch (error) {
    console.error('Error generating portfolio:', error);
    res.status(500).json({ error: 'Failed to generate portfolio' });
  }
});

// Generate portfolio HTML with default template
router.get('/generate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const template = 'modern'; // default template
    
    const portfolio = await Portfolio.findOne({ 
      $or: [
        { userId: userId },
        { userId: mongoose.Types.ObjectId.isValid(userId) ? userId : null }
      ]
    });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const templatePath = path.join(__dirname, '..', 'templates', `${template}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf8');
    
    const compiledTemplate = handlebars.compile(templateContent);
    const html = compiledTemplate({
      ...portfolio.toObject(),
      colors: portfolio.customization.colors,
      fonts: portfolio.customization.fonts,
      sections: portfolio.customization.sections
    });

    res.send(html);
  } catch (error) {
    console.error('Error generating portfolio:', error);
    res.status(500).json({ error: 'Failed to generate portfolio' });
  }
});

// Generate and download PDF with default template
router.get('/pdf/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const template = 'modern'; // default template
    
    const portfolio = await Portfolio.findOne({ 
      $or: [
        { userId: userId },
        { userId: mongoose.Types.ObjectId.isValid(userId) ? userId : null }
      ]
    });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const templatePath = path.join(__dirname, '..', 'templates', `${template}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf8');
    
    const compiledTemplate = handlebars.compile(templateContent);
    const html = compiledTemplate({
      ...portfolio.toObject(),
      colors: portfolio.customization.colors,
      fonts: portfolio.customization.fonts,
      sections: portfolio.customization.sections,
      isPDF: true
    });

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });

    await browser.close();

    // Update download count
    portfolio.analytics.downloads += 1;
    await portfolio.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${portfolio.personalInfo.name}_Portfolio.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Generate and download PDF with template
router.get('/pdf/:userId/:template', async (req, res) => {
  try {
    const { userId, template } = req.params;
    
    const portfolio = await Portfolio.findOne({ 
      $or: [
        { userId: userId },
        { userId: mongoose.Types.ObjectId.isValid(userId) ? userId : null }
      ]
    });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const templatePath = path.join(__dirname, '..', 'templates', `${template}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf8');
    
    const compiledTemplate = handlebars.compile(templateContent);
    const html = compiledTemplate({
      ...portfolio.toObject(),
      colors: portfolio.customization.colors,
      fonts: portfolio.customization.fonts,
      sections: portfolio.customization.sections,
      isPDF: true
    });

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });

    await browser.close();

    // Update download count
    portfolio.analytics.downloads += 1;
    await portfolio.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${portfolio.personalInfo.name}_Portfolio.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Get public portfolio
router.get('/public/:publicUrl', async (req, res) => {
  try {
    const { publicUrl } = req.params;
    
    const portfolio = await Portfolio.findOne({ 
      'settings.publicUrl': publicUrl,
      'settings.isPublic': true 
    });
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found or not public' });
    }

    // Update view count
    portfolio.analytics.views += 1;
    portfolio.analytics.lastViewed = new Date();
    await portfolio.save();

    const template = portfolio.customization.template;
    const templatePath = path.join(__dirname, '..', 'templates', `${template}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf8');
    
    const compiledTemplate = handlebars.compile(templateContent);
    const html = compiledTemplate({
      ...portfolio.toObject(),
      colors: portfolio.customization.colors,
      fonts: portfolio.customization.fonts,
      sections: portfolio.customization.sections,
      isPublic: true
    });

    res.send(html);
  } catch (error) {
    console.error('Error fetching public portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Toggle public sharing
router.post('/toggle-public/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const portfolio = await Portfolio.findOne({ 
      $or: [
        { userId: userId },
        { userId: mongoose.Types.ObjectId.isValid(userId) ? userId : null }
      ]
    });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    portfolio.settings.isPublic = !portfolio.settings.isPublic;
    
    if (portfolio.settings.isPublic && !portfolio.settings.publicUrl) {
      portfolio.settings.publicUrl = generateUniqueId();
    }

    await portfolio.save();
    res.json({ 
      isPublic: portfolio.settings.isPublic,
      publicUrl: portfolio.settings.publicUrl 
    });
  } catch (error) {
    console.error('Error toggling public sharing:', error);
    res.status(500).json({ error: 'Failed to toggle sharing' });
  }
});

// Get portfolio analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const portfolio = await Portfolio.findOne({ 
      $or: [
        { userId: userId },
        { userId: mongoose.Types.ObjectId.isValid(userId) ? userId : null }
      ]
    });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json(portfolio.analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Helper function to extract skills from activities
function extractSkillsFromActivities(activities, type) {
  const skillKeywords = {
    technical: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'SQL', 'AWS', 'Docker', 'Git', 'HTML', 'CSS', 'Java', 'C++', 'Machine Learning', 'AI', 'Data Science', 'Angular', 'Vue', 'TypeScript', 'PHP', 'Laravel', 'Django', 'Flask', 'Spring Boot', 'Kubernetes', 'Jenkins', 'Linux', 'Windows', 'Android', 'iOS', 'Flutter', 'React Native', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Blockchain', 'Ethereum', 'Solidity', 'GraphQL', 'REST API', 'Microservices', 'DevOps', 'CI/CD', 'Agile', 'Scrum'],
    soft: ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Project Management', 'Public Speaking', 'Mentoring', 'Time Management', 'Critical Thinking', 'Adaptability', 'Creativity', 'Collaboration', 'Analytical Thinking', 'Decision Making', 'Conflict Resolution'],
    languages: ['English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Arabic', 'Portuguese', 'Russian', 'Italian', 'Korean', 'Dutch', 'Swedish', 'Norwegian']
  };

  const skills = new Set();
  const keywords = skillKeywords[type] || [];

  activities.forEach(activity => {
    // Check activity skills array first
    if (activity.skills && Array.isArray(activity.skills)) {
      activity.skills.forEach(skill => {
        if (keywords.some(keyword => keyword.toLowerCase() === skill.toLowerCase())) {
          skills.add(skill);
        }
      });
    }
    
    // Then check title and description
    const text = `${activity.title || ''} ${activity.description || ''}`.toLowerCase();
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        skills.add(keyword);
      }
    });
  });

  return Array.from(skills);
}

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Test endpoint to check if students exist
router.get('/test/students', async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const sampleStudents = await Student.find().limit(3).select('name rollNumber email department');
    
    res.json({
      totalStudents: studentCount,
      sampleStudents: sampleStudents,
      message: studentCount > 0 ? 'Students found in database' : 'No students found in database'
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
