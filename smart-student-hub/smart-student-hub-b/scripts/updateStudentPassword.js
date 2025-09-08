const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const dotenv = require("dotenv");
const path = require("path");

// Load .env file from the parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Update existing student record with password
const updateStudentPassword = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");

    // Find the existing student with rollNumber "1234"
    const student = await Student.findOne({ rollNumber: "1234" });
    
    if (!student) {
      console.log("❌ Student with rollNumber '1234' not found");
      return;
    }

    console.log(`📋 Found student: ${student.name} (${student.email})`);

    // Set a default password for the student
    const defaultPassword = "student123"; // You can change this
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    // Update the student record with password, role, and profile picture
    student.passwordHash = passwordHash;
    student.role = "student";
    
    // Add profile picture if not already set
    if (!student.profilePicture) {
      student.profilePicture = `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`;
    }
    
    await student.save();

    console.log("✅ Student record updated successfully!");
    console.log("📋 Login Credentials:");
    console.log(`   Email: ${student.email}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log(`   Roll Number: ${student.rollNumber}`);
    console.log(`   Name: ${student.name}`);

  } catch (error) {
    console.error("❌ Error updating student record:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔐 Database connection closed");
  }
};

// Run the script
if (require.main === module) {
  updateStudentPassword();
}

module.exports = { updateStudentPassword };
