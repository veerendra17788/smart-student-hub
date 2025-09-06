const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
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
    // For demo purposes, create a mock user if userId is "user123"
    let user;
    let activities = [];
    
    if (userId == 'user123') {
      // Mock user data for testing
      user = {
        _id: userId,
        name: 'Alex Johnson',
        email: 'alex@university.edu',
        phone: '+91 9876543210',
        bio: 'Computer Science student passionate about AI and full-stack development',
        department: 'Computer Science & Engineering'
      };
      
      // Mock activities data
      activities = [
        {
          title: 'Hackathon Winner - TechFest 2024',
          type: 'Competition',
          date: new Date('2024-03-15'),
          credits: 15,
          description: 'Won first place in 48-hour hackathon building an AI-powered healthcare app',
          verified: true
        },
        {
          title: 'AWS Cloud Practitioner Certification',
          type: 'Certification',
          date: new Date('2024-03-10'),
          credits: 10,
          description: 'Completed comprehensive AWS cloud fundamentals certification',
          verified: true
        },
        {
          title: 'Internship at Microsoft',
          type: 'Internship',
          date: new Date('2024-02-28'),
          credits: 25,
          description: '3-month software development internship in Azure team',
          verified: false
        }
      ];
    } else {
      // Check if userId is a valid ObjectId before querying
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      
      // Try to find real user by ObjectId
      try {
        user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        // Get user's activities
        activities = await Activity.find({ userId }).sort({ date: -1 });
      } catch (error) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
    }

    // Get existing portfolio or create default structure
    let portfolio = await Portfolio.findOne({ userId });
    
    if (!portfolio) {
      // Create portfolio data object first
      const portfolioData = {
        userId,
        personalInfo: {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          profileImage: user.profileImage || '',
          location: user.location || '',
          website: user.website || '',
          linkedin: user.linkedin || '',
          github: user.github || ''
        },
        activities: activities,
        // Auto-extract skills from activities
        skills: {
          technical: extractSkillsFromActivities(activities, 'technical'),
          soft: extractSkillsFromActivities(activities, 'soft'),
          languages: extractSkillsFromActivities(activities, 'languages')
        },
        achievements: activities
          .filter(a => a.type === 'Achievement' || a.type === 'Award')
          .map(a => ({
            title: a.title,
            description: a.description,
            date: a.date,
            issuer: a.issuer || 'Institution'
          })),
        certificates: activities
          .filter(a => a.type === 'Certification')
          .map(a => ({
            title: a.title,
            issuer: a.issuer || 'Certification Body',
            issueDate: a.date,
            verified: a.verified || false
          }))
      };
      
      // Create the portfolio instance
      portfolio = new Portfolio(portfolioData);
      await portfolio.save();
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// Update portfolio
router.put('/update/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    let portfolio = await Portfolio.findOne({ userId: userId });
    
    if (!portfolio) {
      portfolio = new Portfolio({ userId, ...updateData });
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
    
    const portfolio = await Portfolio.findOne({ userId });
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
    
    const portfolio = await Portfolio.findOne({ userId });
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
    
    const portfolio = await Portfolio.findOne({ userId });
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
    
    const portfolio = await Portfolio.findOne({ userId });
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
    
    const portfolio = await Portfolio.findOne({ userId });
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
    
    const portfolio = await Portfolio.findOne({ userId });
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
    technical: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'SQL', 'AWS', 'Docker', 'Git', 'HTML', 'CSS', 'Java', 'C++', 'Machine Learning', 'AI', 'Data Science'],
    soft: ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Project Management', 'Public Speaking', 'Mentoring'],
    languages: ['English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese']
  };

  const skills = new Set();
  const keywords = skillKeywords[type] || [];

  activities.forEach(activity => {
    const text = `${activity.title} ${activity.description}`.toLowerCase();
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

module.exports = router;
