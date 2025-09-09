const mongoose = require('mongoose');
const AcademicCalendar = require('../models/AcademicCalendar');
require('dotenv').config();

// Sample academic events data
const academicEvents = [
  // Semester Events
  {
    title: "Spring Semester 2024 Begins",
    description: "First day of Spring Semester 2024. All students must report to their respective departments.",
    eventType: "semester_start",
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-15'),
    isAllDay: true,
    department: "All Departments",
    year: 2024,
    priority: "high",
    color: "#3B82F6",
    tags: ["semester", "important"]
  },
  {
    title: "Course Registration Deadline",
    description: "Last date for course registration and fee payment for Spring 2024.",
    eventType: "registration",
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-20'),
    isAllDay: true,
    year: 2024,
    priority: "urgent",
    color: "#DC2626",
    tags: ["registration", "deadline"]
  },
  {
    title: "Mid-Semester Examinations",
    description: "Mid-semester examinations for all courses. Check your exam schedule.",
    eventType: "exam",
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-22'),
    isAllDay: true,
    year: 2024,
    priority: "high",
    color: "#EF4444",
    tags: ["exam", "mid-semester"]
  },
  {
    title: "Spring Break",
    description: "Spring break holiday for all students and faculty.",
    eventType: "holiday",
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-04-07'),
    isAllDay: true,
    year: 2024,
    priority: "medium",
    color: "#10B981",
    tags: ["holiday", "break"]
  },
  {
    title: "Final Examinations",
    description: "Final semester examinations. Good luck to all students!",
    eventType: "exam",
    startDate: new Date('2024-05-10'),
    endDate: new Date('2024-05-25'),
    isAllDay: true,
    year: 2024,
    priority: "high",
    color: "#EF4444",
    tags: ["exam", "final"]
  },
  {
    title: "Spring Semester 2024 Ends",
    description: "Last day of Spring Semester 2024.",
    eventType: "semester_end",
    startDate: new Date('2024-05-30'),
    endDate: new Date('2024-05-30'),
    isAllDay: true,
    year: 2024,
    priority: "high",
    color: "#6366F1",
    tags: ["semester", "end"]
  },

  // Assignments and Deadlines
  {
    title: "Data Structures Assignment 1",
    description: "Implementation of linked lists and stacks. Submit via online portal.",
    eventType: "assignment",
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-02-15'),
    isAllDay: true,
    department: "Computer Science",
    semester: 3,
    year: 2024,
    priority: "medium",
    color: "#F59E0B",
    tags: ["assignment", "programming"]
  },
  {
    title: "Database Management System Project",
    description: "Design and implement a complete database system for a real-world application.",
    eventType: "assignment",
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-01'),
    isAllDay: true,
    department: "Computer Science",
    semester: 5,
    year: 2024,
    priority: "high",
    color: "#F59E0B",
    tags: ["project", "database"]
  },
  {
    title: "Machine Learning Research Paper",
    description: "Submit research paper on recent advances in machine learning.",
    eventType: "assignment",
    startDate: new Date('2024-04-15'),
    endDate: new Date('2024-04-15'),
    isAllDay: true,
    department: "Computer Science",
    semester: 7,
    year: 2024,
    priority: "high",
    color: "#F59E0B",
    tags: ["research", "ml"]
  },

  // Workshops and Seminars
  {
    title: "AI and Machine Learning Workshop",
    description: "Hands-on workshop on AI/ML fundamentals and applications.",
    eventType: "workshop",
    startDate: new Date('2024-02-20T10:00:00'),
    endDate: new Date('2024-02-20T16:00:00'),
    isAllDay: false,
    location: "Auditorium A",
    department: "Computer Science",
    year: 2024,
    priority: "medium",
    color: "#06B6D4",
    tags: ["workshop", "ai", "ml"]
  },
  {
    title: "Industry Expert Seminar: Software Development",
    description: "Industry professionals share insights on modern software development practices.",
    eventType: "seminar",
    startDate: new Date('2024-03-10T14:00:00'),
    endDate: new Date('2024-03-10T17:00:00'),
    isAllDay: false,
    location: "Conference Hall",
    year: 2024,
    priority: "medium",
    color: "#84CC16",
    tags: ["seminar", "industry", "software"]
  },
  {
    title: "Cybersecurity Awareness Workshop",
    description: "Learn about cybersecurity threats and best practices for protection.",
    eventType: "workshop",
    startDate: new Date('2024-04-05T09:00:00'),
    endDate: new Date('2024-04-05T12:00:00'),
    isAllDay: false,
    location: "Lab 201",
    department: "Computer Science",
    year: 2024,
    priority: "medium",
    color: "#06B6D4",
    tags: ["workshop", "cybersecurity"]
  },

  // Cultural and Sports Events
  {
    title: "Annual Tech Fest - TechnoVision 2024",
    description: "Three-day technical festival with competitions, exhibitions, and cultural programs.",
    eventType: "cultural",
    startDate: new Date('2024-03-25'),
    endDate: new Date('2024-03-27'),
    isAllDay: true,
    location: "Main Campus",
    year: 2024,
    priority: "medium",
    color: "#F97316",
    tags: ["festival", "tech", "cultural"]
  },
  {
    title: "Inter-College Cricket Tournament",
    description: "Annual cricket tournament between different colleges.",
    eventType: "sports",
    startDate: new Date('2024-02-10'),
    endDate: new Date('2024-02-12'),
    isAllDay: true,
    location: "Sports Ground",
    year: 2024,
    priority: "low",
    color: "#14B8A6",
    tags: ["sports", "cricket", "tournament"]
  },
  {
    title: "Cultural Night - Expressions 2024",
    description: "Evening of music, dance, and drama performances by students.",
    eventType: "cultural",
    startDate: new Date('2024-04-20T18:00:00'),
    endDate: new Date('2024-04-20T22:00:00'),
    isAllDay: false,
    location: "Open Air Theatre",
    year: 2024,
    priority: "medium",
    color: "#F97316",
    tags: ["cultural", "performance", "evening"]
  },

  // Fee Payment and Administrative
  {
    title: "Semester Fee Payment Deadline",
    description: "Last date for semester fee payment. Late fees will be applicable after this date.",
    eventType: "fee_payment",
    startDate: new Date('2024-01-25'),
    endDate: new Date('2024-01-25'),
    isAllDay: true,
    year: 2024,
    priority: "urgent",
    color: "#EC4899",
    tags: ["fee", "deadline", "payment"]
  },
  {
    title: "Scholarship Application Deadline",
    description: "Submit applications for merit and need-based scholarships.",
    eventType: "registration",
    startDate: new Date('2024-02-28'),
    endDate: new Date('2024-02-28'),
    isAllDay: true,
    year: 2024,
    priority: "high",
    color: "#8B5CF6",
    tags: ["scholarship", "application", "deadline"]
  },

  // Holidays
  {
    title: "Republic Day",
    description: "National holiday - Republic Day celebration.",
    eventType: "holiday",
    startDate: new Date('2024-01-26'),
    endDate: new Date('2024-01-26'),
    isAllDay: true,
    year: 2024,
    priority: "medium",
    color: "#10B981",
    tags: ["holiday", "national"]
  },
  {
    title: "Holi Festival",
    description: "Festival of colors - College holiday.",
    eventType: "holiday",
    startDate: new Date('2024-03-25'),
    endDate: new Date('2024-03-25'),
    isAllDay: true,
    year: 2024,
    priority: "medium",
    color: "#10B981",
    tags: ["holiday", "festival"]
  },

  // Future Events (for testing upcoming events)
  {
    title: "Summer Internship Fair",
    description: "Companies will be on campus for summer internship recruitment.",
    eventType: "other",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isAllDay: true,
    location: "Placement Cell",
    year: 2024,
    priority: "high",
    color: "#6B7280",
    tags: ["internship", "recruitment", "career"]
  },
  {
    title: "Guest Lecture: Blockchain Technology",
    description: "Expert talk on blockchain technology and its applications.",
    eventType: "seminar",
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isAllDay: false,
    location: "Seminar Hall",
    department: "Computer Science",
    year: 2024,
    priority: "medium",
    color: "#84CC16",
    tags: ["blockchain", "technology", "guest"]
  },
  {
    title: "Assignment Submission: Web Development",
    description: "Submit your web development project with complete documentation.",
    eventType: "assignment",
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isAllDay: true,
    department: "Computer Science",
    semester: 4,
    year: 2024,
    priority: "high",
    color: "#F59E0B",
    tags: ["assignment", "web", "development"]
  }
];

async function generateAcademicCalendarData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing academic calendar data
    console.log('🗑️ Clearing existing academic calendar data...');
    await AcademicCalendar.deleteMany({});

    // Create a default admin user ID (you might need to adjust this)
    const defaultAdminId = new mongoose.Types.ObjectId();

    console.log('📅 Generating academic calendar events...');
    
    const eventsToInsert = academicEvents.map(event => ({
      ...event,
      createdBy: defaultAdminId,
      reminderSettings: {
        enabled: true,
        reminderTime: event.priority === 'urgent' ? 30 : 60 // 30 min for urgent, 60 min for others
      }
    }));

    // Insert events
    const insertedEvents = await AcademicCalendar.insertMany(eventsToInsert);
    console.log(`✅ Successfully created ${insertedEvents.length} academic calendar events`);

    // Display summary
    const eventsByType = await AcademicCalendar.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Events Summary:');
    eventsByType.forEach(type => {
      console.log(`   ${type._id}: ${type.count} events`);
    });

    const upcomingEvents = await AcademicCalendar.countDocuments({
      startDate: { $gte: new Date() }
    });
    console.log(`\n🔮 Upcoming events: ${upcomingEvents}`);

    console.log('\n🎉 Academic calendar data generation completed successfully!');

  } catch (error) {
    console.error('❌ Error generating academic calendar data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
if (require.main === module) {
  generateAcademicCalendarData();
}

module.exports = { generateAcademicCalendarData, academicEvents };
