const mongoose = require("mongoose");
const Faculty = require("../models/Faculty");
const dotenv = require("dotenv");
const path = require("path");

// Load .env file from the parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function updateFacultyRoles() {
  try {
    console.log("🔄 Updating faculty roles...");
    
    // Update all faculty to have role: 'faculty'
    const updateResult = await Faculty.updateMany(
      {},
      { 
        $set: { 
          role: 'faculty'
        }
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} faculty members with role: 'faculty'`);
    
    // Verify the update
    const facultyCount = await Faculty.countDocuments({ role: 'faculty' });
    console.log(`🔍 Verification: ${facultyCount} faculty members now have role: 'faculty'`);
    
    // Show sample faculty with roles
    const sampleFaculty = await Faculty.find({}).limit(3).select('facultyId firstName lastName email role');
    
    console.log("\n📋 Sample Faculty with Roles:");
    console.log("=" .repeat(50));
    sampleFaculty.forEach(faculty => {
      console.log(`${faculty.firstName} ${faculty.lastName} - Role: ${faculty.role}`);
      console.log(`Email: ${faculty.email}`);
      console.log(`Faculty ID: ${faculty.facultyId}`);
      console.log("-".repeat(30));
    });
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error("❌ Error updating faculty roles:", error);
    mongoose.disconnect();
  }
}

// Run the script
updateFacultyRoles();
