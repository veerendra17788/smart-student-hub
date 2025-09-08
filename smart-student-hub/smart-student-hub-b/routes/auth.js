const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const { generateTokens, verifyRefreshToken } = require("../middleware/auth");

const router = express.Router();


// Signup disabled - Only authorized college data allowed
router.post("/signup", async (req, res) => {
  return res.status(403).json({ 
    message: "Registration is disabled. Only authorized college accounts can access this system. Please contact your administrator." 
  });
});


// Login - Supporting both Students and Faculty authentication
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let user = null;
    let userType = null;

    // First try to find in Students collection
    const student = await Student.findOne({ email: email.toLowerCase(), isActive: true });
    if (student) {
      user = student;
      userType = 'student';
    } else {
      // If not found in students, try Faculty collection
      const faculty = await Faculty.findOne({ email: email.toLowerCase(), isActive: true });
      if (faculty) {
        user = faculty;
        userType = 'faculty';
      }
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials. Please contact your administrator for access." });
    }

    // For faculty, we need to set a default password if not exists
    if (userType === 'faculty' && !user.passwordHash) {
      // Default password: faculty123 (should be changed on first login)
      const defaultPassword = 'faculty123';
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(defaultPassword, salt);
      await user.save();
    }

    // Check if user has password set
    if (!user.passwordHash) {
      return res.status(400).json({ message: "Account not properly configured. Please contact your administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials. Please contact your administrator for access." });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate access and refresh tokens with appropriate payload
    const payload = userType === 'student' ? {
      userId: user._id,
      role: user.role || 'student',
      rollNumber: user.rollNumber,
      email: user.email,
      userType: 'student'
    } : {
      userId: user._id,
      role: user.role || 'faculty',
      facultyId: user.facultyId,
      email: user.email,
      userType: 'faculty'
    };
    
    const { accessToken, refreshToken } = generateTokens(payload);

    // Return appropriate user data for frontend
    const userData = userType === 'student' ? {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'student',
      rollNumber: user.rollNumber,
      department: user.department,
      avatar: user.profilePicture,
      userType: 'student'
    } : {
      id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role || 'faculty',
      facultyId: user.facultyId,
      department: user.department,
      designation: user.designation,
      avatar: user.profilePicture,
      userType: 'faculty'
    };

    res.json({
      message: "Login successful",
      token: accessToken,
      refreshToken,
      user: userData
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Refresh token endpoint
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        message: "Refresh token required",
        code: "NO_REFRESH_TOKEN"
      });
    }

    const decoded = await verifyRefreshToken(refreshToken);
    let user = null;
    let userType = decoded.userType || 'student';

    // Find user based on type
    if (userType === 'faculty') {
      user = await Faculty.findById(decoded.userId).select('-passwordHash');
    } else {
      user = await Student.findById(decoded.userId).select('-passwordHash');
    }
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Generate new tokens with appropriate payload
    const payload = userType === 'student' ? {
      userId: user._id,
      role: user.role || 'student',
      rollNumber: user.rollNumber,
      email: user.email,
      userType: 'student'
    } : {
      userId: user._id,
      role: user.role || 'faculty',
      facultyId: user.facultyId,
      email: user.email,
      userType: 'faculty'
    };
    
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);

    // Return appropriate user data
    const userData = userType === 'student' ? {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'student',
      rollNumber: user.rollNumber,
      department: user.department,
      avatar: user.profilePicture,
      userType: 'student'
    } : {
      id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role || 'faculty',
      facultyId: user.facultyId,
      department: user.department,
      designation: user.designation,
      avatar: user.profilePicture,
      userType: 'faculty'
    };

    res.json({
      message: "Token refreshed successfully",
      token: accessToken,
      refreshToken: newRefreshToken,
      user: userData
    });
  } catch (err) {
    console.error("Token refresh error:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Refresh token expired, please login again",
        code: "REFRESH_TOKEN_EXPIRED"
      });
    }
    res.status(403).json({ 
      message: "Invalid refresh token",
      code: "INVALID_REFRESH_TOKEN"
    });
  }
});

// Get current user profile data
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: "No token provided",
        code: "NO_TOKEN"
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ 
            message: "Token expired, please refresh or login again",
            code: "TOKEN_EXPIRED",
            expiredAt: err.expiredAt
          });
        }
        return res.status(403).json({ 
          message: "Invalid token",
          code: "INVALID_TOKEN"
        });
      }

      try {
        let user = null;
        let userType = decoded.userType || 'student';

        // Find user based on type
        if (userType === 'faculty') {
          user = await Faculty.findById(decoded.userId).select('-passwordHash');
        } else {
          user = await Student.findById(decoded.userId).select('-passwordHash');
        }
        
        if (!user) {
          return res.status(404).json({ 
            message: "User not found",
            code: "USER_NOT_FOUND"
          });
        }

        // Return appropriate user data
        const userData = userType === 'student' ? {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'student',
          rollNumber: user.rollNumber,
          department: user.department,
          avatar: user.profilePicture,
          userType: 'student'
        } : {
          id: user._id,
          name: user.fullName,
          email: user.email,
          role: user.role || 'faculty',
          facultyId: user.facultyId,
          department: user.department,
          designation: user.designation,
          avatar: user.profilePicture,
          userType: 'faculty'
        };

        res.json({
          success: true,
          user: userData
        });
      } catch (dbErr) {
        console.error("Database error:", dbErr);
        res.status(500).json({ 
          message: "Database error",
          code: "DB_ERROR"
        });
      }
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ 
      message: "Server error",
      code: "SERVER_ERROR"
    });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  // In a production app, you might want to blacklist the token
  res.json({ 
    message: "Logged out successfully",
    code: "LOGOUT_SUCCESS"
  });
});

module.exports = router;
