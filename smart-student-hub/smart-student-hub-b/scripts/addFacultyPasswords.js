const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Faculty = require("../models/Faculty");
const dotenv = require("dotenv");
require("dotenv").config();
const path = require("path");

// Load .env file from the parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function addPasswordsToFaculty() {
  try {
    console.log("🔐 Adding default passwords to faculty members...");
    
    // Find all faculty without passwords
    const facultyWithoutPasswords = await Faculty.find({ 
      $or: [
        { passwordHash: { $exists: false } },
        { passwordHash: null },
        { passwordHash: "" }
      ]
    });
    
    console.log(`📊 Found ${facultyWithoutPasswords.length} faculty members without passwords`);
    
    // Default password for all faculty
    const defaultPassword = 'faculty123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    
    // Update all faculty with the hashed password
    const updateResult = await Faculty.updateMany(
      { 
        $or: [
          { passwordHash: { $exists: false } },
          { passwordHash: null },
          { passwordHash: "" }
        ]
      },
      { 
        $set: { 
          passwordHash: hashedPassword,
          lastLogin: null // Reset last login
        }
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} faculty members with default password`);
    console.log(`🔑 Default password for all faculty: ${defaultPassword}`);
    console.log("📝 Faculty can now login using their email and the default password");
    
    // Display some sample faculty login credentials
    const sampleFaculty = await Faculty.find({}).limit(5).select('email facultyId firstName lastName department');
    
    console.log("\n📋 Sample Faculty Login Credentials:");
    console.log("=" .repeat(60));
    sampleFaculty.forEach(faculty => {
      console.log(`Email: ${faculty.email}`);
      console.log(`Password: ${defaultPassword}`);
      console.log(`Name: ${faculty.firstName} ${faculty.lastName}`);
      console.log(`Department: ${faculty.department}`);
      console.log(`Faculty ID: ${faculty.facultyId}`);
      console.log("-".repeat(40));
    });
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error("❌ Error adding passwords to faculty:", error);
    mongoose.disconnect();
  }
}

// Run the script
addPasswordsToFaculty();
