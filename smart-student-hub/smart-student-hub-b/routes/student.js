const express = require("express");
const Student = require("../models/Student");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// GET /api/student/dashboard/:rollNo - Get student dashboard data
router.get("/dashboard/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;
    
    const student = await Student.findOne({ 
      rollNumber: rollNo.toUpperCase(),
      isActive: true 
    }).select('-__v');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Format response for frontend dashboard
    const dashboardData = {
      success: true,
      data: {
        profile: {
          rollNumber: student.rollNumber,
          name: student.name,
          email: student.email,
          phone: student.phone,
          department: student.department,
          year: student.year,
          section: student.section,
          profilePicture: student.profilePicture,
          bloodGroup: student.bloodGroup
        },
        academic: {
          cgpa: student.cgpa,
          currentSemester: student.currentSemester,
          semesterGrades: student.semesterGrades || []
        },
        attendance: {
          overall: student.overallAttendancePercentage,
          subjects: student.attendance || []
        },
        activities: student.activities || [],
        address: student.fullAddress,
        lastLogin: student.lastLogin,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// PUT /api/student/:rollNo/cgpa - Update student CGPA
router.put("/:rollNo/cgpa", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { cgpa } = req.body;

    // Validate CGPA
    if (cgpa === undefined || cgpa < 0 || cgpa > 10) {
      return res.status(400).json({
        success: false,
        message: "CGPA must be between 0 and 10"
      });
    }

    const student = await Student.findOneAndUpdate(
      { rollNumber: rollNo.toUpperCase(), isActive: true },
      { cgpa: parseFloat(cgpa) },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: "CGPA updated successfully",
      data: {
        rollNumber: student.rollNumber,
        cgpa: student.cgpa,
        updatedAt: student.updatedAt
      }
    });
  } catch (error) {
    console.error("CGPA update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// PUT /api/student/:rollNo/attendance - Update subject-wise attendance
router.put("/:rollNo/attendance", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { subjectCode, subjectName, totalClasses, attendedClasses } = req.body;

    // Validate input
    if (!subjectCode || !subjectName || totalClasses === undefined || attendedClasses === undefined) {
      return res.status(400).json({
        success: false,
        message: "subjectCode, subjectName, totalClasses, and attendedClasses are required"
      });
    }

    if (totalClasses < 0 || attendedClasses < 0 || attendedClasses > totalClasses) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance data"
      });
    }

    const student = await Student.findOne({ 
      rollNumber: rollNo.toUpperCase(),
      isActive: true 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Find existing subject or add new one
    const existingSubjectIndex = student.attendance.findIndex(
      att => att.subjectCode === subjectCode
    );

    if (existingSubjectIndex !== -1) {
      // Update existing subject
      student.attendance[existingSubjectIndex].subjectName = subjectName;
      student.attendance[existingSubjectIndex].totalClasses = totalClasses;
      student.attendance[existingSubjectIndex].attendedClasses = attendedClasses;
    } else {
      // Add new subject
      student.attendance.push({
        subjectCode,
        subjectName,
        totalClasses,
        attendedClasses
      });
    }

    await student.save(); // This will trigger pre-save middleware to calculate percentages

    res.json({
      success: true,
      message: "Attendance updated successfully",
      data: {
        rollNumber: student.rollNumber,
        attendance: student.attendance,
        overallAttendancePercentage: student.overallAttendancePercentage,
        updatedAt: student.updatedAt
      }
    });
  } catch (error) {
    console.error("Attendance update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/student/activities/:rollNo - Get student activities
router.get("/activities/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;
    
    const student = await Student.findOne({ 
      rollNumber: rollNo.toUpperCase(),
      isActive: true 
    }).select('rollNumber name activities');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      data: {
        rollNumber: student.rollNumber,
        name: student.name,
        activities: student.activities || [],
        totalActivities: student.activities ? student.activities.length : 0
      }
    });
  } catch (error) {
    console.error("Activities fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// POST /api/student/:rollNo/activity - Add new activity
router.post("/:rollNo/activity", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const activityData = req.body;

    // Validate required fields
    if (!activityData.type || !activityData.title) {
      return res.status(400).json({
        success: false,
        message: "Activity type and title are required"
      });
    }

    const student = await Student.findOne({ 
      rollNumber: rollNo.toUpperCase(),
      isActive: true 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    student.activities.push(activityData);
    await student.save();

    res.status(201).json({
      success: true,
      message: "Activity added successfully",
      data: {
        rollNumber: student.rollNumber,
        activity: student.activities[student.activities.length - 1],
        totalActivities: student.activities.length
      }
    });
  } catch (error) {
    console.error("Activity add error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/student/profile/:rollNo - Get detailed student profile
router.get("/profile/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;
    
    const student = await Student.findOne({ 
      rollNumber: rollNo.toUpperCase(),
      isActive: true 
    }).select('-__v');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// PUT /api/student/:rollNo/profile - Update student profile
router.put("/:rollNo/profile", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.rollNumber;
    delete updateData.cgpa;
    delete updateData.attendance;
    delete updateData.activities;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const student = await Student.findOneAndUpdate(
      { rollNumber: rollNo.toUpperCase(), isActive: true },
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: student
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});


// GET /api/student/:rollNo/attendance/calendar - Get daily attendance data for calendar view
router.get("/:rollNo/attendance/calendar", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { year, month } = req.query;
    
    const student = await Student.findOne({ 
      rollNumber: rollNo.toUpperCase(),
      isActive: true 
    }).select('dailyAttendance attendance');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    let attendanceData = student.dailyAttendance || [];
    
    // Filter by year and month if provided
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month), 1);
      const endDate = new Date(parseInt(year), parseInt(month) + 1, 0);
      
      attendanceData = attendanceData.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    res.json({
      success: true,
      data: {
        dailyAttendance: attendanceData,
        subjects: student.attendance || []
      }
    });

  } catch (error) {
    console.error("Error fetching calendar attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch calendar attendance data",
      error: error.message
    });
  }
});

// POST /api/student/:rollNo/attendance/daily - Add daily attendance record
router.post("/:rollNo/attendance/daily", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { date, subjectCode, subjectName, status, period, remarks } = req.body;
    
    if (!date || !subjectCode || !subjectName || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: date, subjectCode, subjectName, status"
      });
    }

    const student = await Student.findOne({ 
      rollNumber: rollNo.toUpperCase(),
      isActive: true 
    });
    

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }


    // Add daily attendance record
    const attendanceRecord = {
      date: new Date(date),
      subjectCode,
      subjectName,
      status,
      period,
      remarks
    };

    await student.addDailyAttendance(attendanceRecord);

    // Update overall attendance statistics
    const subjectAttendance = student.attendance.find(att => att.subjectCode === subjectCode);
    if (subjectAttendance) {
      subjectAttendance.totalClasses += 1;
      if (status === 'present' || status === 'late') {
        subjectAttendance.attendedClasses += 1;
      }
      await student.save();
    }

    res.json({
      success: true,
      message: "Daily attendance recorded successfully",
      data: {
        rollNumber: student.rollNumber,
        attendanceRecord
      }
    });

  } catch (error) {
    console.error("Error adding daily attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add daily attendance",

      error: error.message
    });
  }
});

module.exports = router;
