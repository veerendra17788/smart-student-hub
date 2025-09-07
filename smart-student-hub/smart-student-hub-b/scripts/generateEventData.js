const mongoose = require("mongoose");
const Event = require("../models/Event");
require("dotenv").config();

// Sample event data
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
  },
  {
    title: "Hackathon 2024",
    type: "Hackathon",
    date: new Date("2025-01-10T08:00:00Z"),
    time: "8:00 AM - 8:00 PM",
    location: "Main Campus",
    capacity: 100,
    credits: 5,
    department: "all",
    description: "24-hour hackathon to build innovative solutions for real-world problems.",
    status: "active"
  },
  {
    title: "Data Science Conference",
    type: "Conference",
    date: new Date("2025-01-25T09:00:00Z"),
    time: "9:00 AM - 6:00 PM",
    location: "Conference Hall",
    capacity: 300,
    credits: 3,
    department: "all",
    description: "Industry experts sharing insights on data science trends and applications.",
    status: "active"
  },
  {
    title: "Mobile App Development Workshop",
    type: "Workshop",
    date: new Date("2024-12-22T10:00:00Z"),
    time: "10:00 AM - 3:00 PM",
    location: "Mobile Lab",
    capacity: 30,
    credits: 2,
    department: "Computer Science",
    description: "Learn to build mobile apps using React Native and Flutter.",
    status: "active"
  },
  {
    title: "Digital Marketing Seminar",
    type: "Seminar",
    date: new Date("2025-01-05T11:00:00Z"),
    time: "11:00 AM - 1:00 PM",
    location: "Business Hall",
    capacity: 80,
    credits: 1,
    department: "Business Administration",
    description: "Strategies for effective digital marketing in the modern era.",
    status: "active"
  },
  {
    title: "Robotics Competition",
    type: "Competition",
    date: new Date("2025-02-15T09:00:00Z"),
    time: "9:00 AM - 5:00 PM",
    location: "Engineering Lab",
    capacity: 60,
    credits: 4,
    department: "Mechanical Engineering",
    description: "Build and program robots to compete in various challenges.",
    status: "active"
  },
  // Past events for testing
  {
    title: "Python Programming Workshop",
    type: "Workshop",
    date: new Date("2024-11-15T10:00:00Z"),
    time: "10:00 AM - 4:00 PM",
    location: "Computer Lab 2",
    capacity: 45,
    credits: 2,
    department: "Computer Science",
    description: "Introduction to Python programming for beginners.",
    status: "completed"
  },
  {
    title: "Entrepreneurship Seminar",
    type: "Seminar",
    date: new Date("2024-10-20T14:00:00Z"),
    time: "2:00 PM - 5:00 PM",
    location: "Business Center",
    capacity: 100,
    credits: 1,
    department: "all",
    description: "Learn from successful entrepreneurs about starting your own business.",
    status: "completed"
  }
];

async function generateEventData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing events
    await Event.deleteMany({});
    console.log("🗑️ Cleared existing events");

    // Insert sample events
    const events = await Event.insertMany(sampleEvents);
    console.log(`✅ Created ${events.length} sample events`);

    // Add some sample registrations to a few events
    const eventToUpdate = await Event.findOne({ title: "AI & Machine Learning Workshop" });
    if (eventToUpdate) {
      eventToUpdate.registrations = [
        {
          studentId: "student123",
          name: "John Doe",
          email: "john.doe@university.edu",
          department: "Computer Science",
          year: "3rd Year",
          phone: "1234567890",
          registeredAt: new Date()
        },
        {
          studentId: "student456",
          name: "Jane Smith",
          email: "jane.smith@university.edu",
          department: "Information Technology",
          year: "2nd Year",
          phone: "0987654321",
          registeredAt: new Date()
        }
      ];
      await eventToUpdate.save();
      console.log("✅ Added sample registrations");
    }

    console.log("\n📊 Event Summary:");
    console.log(`- Total Events: ${events.length}`);
    console.log(`- Upcoming Events: ${events.filter(e => new Date(e.date) >= new Date()).length}`);
    console.log(`- Past Events: ${events.filter(e => new Date(e.date) < new Date()).length}`);
    console.log(`- Workshops: ${events.filter(e => e.type === "Workshop").length}`);
    console.log(`- Seminars: ${events.filter(e => e.type === "Seminar").length}`);
    console.log(`- Competitions: ${events.filter(e => e.type === "Competition").length}`);
    console.log(`- Hackathons: ${events.filter(e => e.type === "Hackathon").length}`);
    console.log(`- Conferences: ${events.filter(e => e.type === "Conference").length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error generating event data:", error);
    process.exit(1);
  }
}

generateEventData();
