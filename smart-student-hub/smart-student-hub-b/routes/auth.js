const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const router = express.Router();


// Signup disabled - Only authorized college data allowed
router.post("/signup", async (req, res) => {
  return res.status(403).json({ 
    message: "Registration is disabled. Only authorized college accounts can access this system. Please contact your administrator." 
  });
});


// Login - Using Students collection for authentication
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find student by email in Students collection
    const student = await Student.findOne({ email: email.toLowerCase(), isActive: true });
    if (!student) {
      return res.status(400).json({ message: "Invalid credentials. Please contact your administrator for access." });
    }

    // Check if student has password set
    if (!student.passwordHash) {
      return res.status(400).json({ message: "Account not properly configured. Please contact your administrator." });
    }

    const isMatch = await bcrypt.compare(password, student.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials. Please contact your administrator for access." });
    }

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    const token = jwt.sign(
      { userId: student._id, role: student.role, rollNumber: student.rollNumber },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return comprehensive student data for frontend
    res.json({
      message: "Login successful",
      token,
      user: { 
        id: student._id, 
        name: student.name, 
        email: student.email,
        role: student.role,
        rollNumber: student.rollNumber,
        department: student.department,
        avatar: student.profilePicture
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get current user profile data
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.userId).select('-passwordHash');
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      success: true,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        rollNumber: student.rollNumber,
        department: student.department,
        avatar: student.profilePicture
      }
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
