const mongoose = require("mongoose");
const Faculty = require("../models/Faculty");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/smart-student-hub");

async function checkFacultyData() {
  try {
    console.log("🔍 Checking Faculty data in database...");
    
    // Count total faculty
    const totalFaculty = await Faculty.countDocuments();
    console.log(`📊 Total Faculty in database: ${totalFaculty}`);
    
    if (totalFaculty === 0) {
      console.log("❌ No faculty data found in database!");
      mongoose.disconnect();
      return;
    }
    
    // Get sample faculty data
    const sampleFaculty = await Faculty.find({}).limit(5).select('facultyId firstName lastName email department isActive passwordHash');
    
    console.log("\n📋 Sample Faculty Records:");
    console.log("=" .repeat(60));
    sampleFaculty.forEach(faculty => {
      console.log(`Faculty ID: ${faculty.facultyId}`);
      console.log(`Name: ${faculty.firstName} ${faculty.lastName}`);
      console.log(`Email: ${faculty.email}`);
      console.log(`Department: ${faculty.department}`);
      console.log(`Active: ${faculty.isActive}`);
      console.log(`Has Password: ${faculty.passwordHash ? 'Yes' : 'No'}`);
      console.log("-".repeat(40));
    });
    
    // Check department distribution
    const deptStats = await Faculty.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log("\n📈 Department Distribution:");
    deptStats.forEach(dept => {
      console.log(`   ${dept._id}: ${dept.count} faculty`);
    });
    
    // Check faculty with passwords
    const facultyWithPasswords = await Faculty.countDocuments({ passwordHash: { $exists: true, $ne: null } });
    console.log(`\n🔐 Faculty with passwords: ${facultyWithPasswords}/${totalFaculty}`);
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error("❌ Error checking faculty data:", error);
    mongoose.disconnect();
  }
}

// Run the check
checkFacultyData();
