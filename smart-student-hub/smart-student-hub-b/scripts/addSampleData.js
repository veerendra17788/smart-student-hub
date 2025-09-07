const mongoose = require("mongoose");
const Event = require("../models/Event");
const Activity = require("../models/Activity");
require("dotenv").config();

// Sample events data
const sampleEvents = [
  {
    title: "AI & Machine Learning Workshop",
    type: "Workshop",
    date: new Date("2024-12-15T10:00:00Z"),
    time: "10:00 AM - 4:00 PM",
    location: "Computer Science Lab",
    capacity: 50,
    credits: 2,
    department: "Computer Science",
    description: "Hands-on workshop covering fundamentals of AI and ML with practical projects.",
    status: "active"
  },
  {
    title: "Web Development Bootcamp",
    type: "Workshop",
    date: new Date("2024-12-20T09:00:00Z"),
    time: "9:00 AM - 5:00 PM",
    location: "IT Lab 1",
    capacity: 40,
    credits: 3,
    department: "Information Technology",
    description: "Complete web development bootcamp covering HTML, CSS, JavaScript, and React.",
    status: "active"
  },
  {
    title: "Cybersecurity Seminar",
    type: "Seminar",
    date: new Date("2024-12-18T14:00:00Z"),
    time: "2:00 PM - 4:00 PM",
    location: "Auditorium",
    capacity: 200,
    credits: 1,
    department: "all",
    description: "Learn about latest cybersecurity threats and protection strategies.",
    status: "active"
  }
];

// Sample activities data
const sampleActivities = [
  {
    title: "React.js Certification",
    type: "certification",
    date: new Date("2024-11-01"),
    credits: 5,
    description: "Completed React.js certification from Meta",
    studentId: "sample_student_1",
    status: "approved",
    proofUrl: "https://example.com/cert1"
  },
  {
    title: "Hackathon Winner",
    type: "competition",
    date: new Date("2024-10-15"),
    credits: 10,
    description: "Won first place in university hackathon",
    studentId: "sample_student_1",
    status: "approved",
    proofUrl: "https://example.com/cert2"
  },
  {
    title: "Python Workshop",
    type: "workshop",
    date: new Date("2024-11-20"),
    credits: 3,
    description: "Attended Python programming workshop",
    studentId: "sample_student_1",
    status: "pending",
    proofUrl: "https://example.com/cert3"
  }
];

async function addSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Add sample events
    const existingEvents = await Event.countDocuments();
    if (existingEvents === 0) {
      await Event.insertMany(sampleEvents);
      console.log(`✅ Added ${sampleEvents.length} sample events`);
    } else {
      console.log(`ℹ️ ${existingEvents} events already exist, skipping event creation`);
    }

    // Add sample activities
    const existingActivities = await Activity.countDocuments();
    if (existingActivities === 0) {
      await Activity.insertMany(sampleActivities);
      console.log(`✅ Added ${sampleActivities.length} sample activities`);
    } else {
      console.log(`ℹ️ ${existingActivities} activities already exist, skipping activity creation`);
    }

    console.log("\n📊 Database Summary:");
    console.log(`- Total Events: ${await Event.countDocuments()}`);
    console.log(`- Total Activities: ${await Activity.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding sample data:", error);
    process.exit(1);
  }
}

addSampleData();
