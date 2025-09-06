const express = require("express");
const Student = require("../models/Student");
const auth = require("../middleware/auth");

const router = express.Router();

// Middleware to check if user is faculty or admin
const checkFacultyRole = (req, res, next) => {
  if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Faculty or admin role required."
    });
  }
};

// GET /api/faculty/students - Get all students (with pagination and filters)
router.get("/students", auth, checkFacultyRole, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      department, 
      year, 
      section,
      search,
      sortBy = 'rollNumber',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);
    if (section) filter.section = section.toUpperCase();
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const students = await Student.find(filter)
      .select('rollNumber name email department year section cgpa overallAttendancePercentage')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalStudents: total,
          hasNext: skip + students.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error("Students fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/faculty/student/:rollNo - Get specific student details
router.get("/student/:rollNo", auth, checkFacultyRole, async (req, res) => {
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
    console.error("Student fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// PUT /api/faculty/student/:rollNo/cgpa - Faculty update student CGPA
router.put("/student/:rollNo/cgpa", auth, checkFacultyRole, async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { cgpa, remarks } = req.body;

    // Validate CGPA
    if (cgpa === undefined || cgpa < 0 || cgpa > 10) {
      return res.status(400).json({
        success: false,
        message: "CGPA must be between 0 and 10"
      });
    }

    const student = await Student.findOneAndUpdate(
      { rollNumber: rollNo.toUpperCase(), isActive: true },
      { 
        cgpa: parseFloat(cgpa),
        $push: {
          'academicHistory': {
            action: 'CGPA Update',
            previousValue: student?.cgpa || 0,
            newValue: parseFloat(cgpa),
            updatedBy: req.user.userId,
            remarks: remarks || '',
            timestamp: new Date()
          }
        }
      },
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
      message: "CGPA updated successfully by faculty",
      data: {
        rollNumber: student.rollNumber,
        name: student.name,
        cgpa: student.cgpa,
        updatedBy: req.user.userId,
        updatedAt: student.updatedAt
      }
    });
  } catch (error) {
    console.error("Faculty CGPA update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// PUT /api/faculty/student/:rollNo/attendance - Faculty update student attendance
router.put("/student/:rollNo/attendance", auth, checkFacultyRole, async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { subjectCode, subjectName, totalClasses, attendedClasses, remarks } = req.body;

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

    // Store previous attendance for history
    const existingSubjectIndex = student.attendance.findIndex(
      att => att.subjectCode === subjectCode
    );

    let previousAttendance = null;
    if (existingSubjectIndex !== -1) {
      previousAttendance = {
        totalClasses: student.attendance[existingSubjectIndex].totalClasses,
        attendedClasses: student.attendance[existingSubjectIndex].attendedClasses,
        percentage: student.attendance[existingSubjectIndex].attendancePercentage
      };
      
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
      message: "Attendance updated successfully by faculty",
      data: {
        rollNumber: student.rollNumber,
        name: student.name,
        subjectCode,
        subjectName,
        attendance: {
          totalClasses,
          attendedClasses,
          percentage: Math.round((attendedClasses / totalClasses) * 100)
        },
        overallAttendancePercentage: student.overallAttendancePercentage,
        updatedBy: req.user.userId,
        updatedAt: student.updatedAt
      }
    });
  } catch (error) {
    console.error("Faculty attendance update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// POST /api/faculty/student/:rollNo/semester-grades - Add semester grades
router.post("/student/:rollNo/semester-grades", auth, checkFacultyRole, async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { semester, subjects, sgpa } = req.body;

    // Validate input
    if (!semester || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Semester and subjects array are required"
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

    // Check if semester grades already exist
    const existingSemesterIndex = student.semesterGrades.findIndex(
      grade => grade.semester === semester
    );

    const semesterData = {
      semester,
      subjects,
      sgpa: sgpa || 0
    };

    if (existingSemesterIndex !== -1) {
      // Update existing semester
      student.semesterGrades[existingSemesterIndex] = semesterData;
    } else {
      // Add new semester
      student.semesterGrades.push(semesterData);
    }

    await student.save();

    res.json({
      success: true,
      message: "Semester grades added/updated successfully",
      data: {
        rollNumber: student.rollNumber,
        name: student.name,
        semester,
        sgpa: sgpa || 0,
        subjects: subjects.length,
        updatedBy: req.user.userId,
        updatedAt: student.updatedAt
      }
    });
  } catch (error) {
    console.error("Semester grades update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/faculty/analytics/attendance - Get attendance analytics
router.get("/analytics/attendance", auth, checkFacultyRole, async (req, res) => {
  try {
    const { department, year, threshold = 75 } = req.query;

    const filter = { isActive: true };
    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);

    // Get students with low attendance
    const lowAttendanceStudents = await Student.find({
      ...filter,
      overallAttendancePercentage: { $lt: parseInt(threshold) }
    }).select('rollNumber name department year section overallAttendancePercentage');

    // Get overall statistics
    const totalStudents = await Student.countDocuments(filter);
    const avgAttendance = await Student.aggregate([
      { $match: filter },
      { $group: { _id: null, avgAttendance: { $avg: "$overallAttendancePercentage" } } }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        lowAttendanceCount: lowAttendanceStudents.length,
        averageAttendance: avgAttendance[0]?.avgAttendance || 0,
        threshold: parseInt(threshold),
        lowAttendanceStudents
      }
    });
  } catch (error) {
    console.error("Attendance analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/faculty/analytics/performance - Get academic performance analytics
router.get("/analytics/performance", auth, checkFacultyRole, async (req, res) => {
  try {
    const { department, year } = req.query;

    const filter = { isActive: true };
    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);

    // Get CGPA distribution
    const cgpaDistribution = await Student.aggregate([
      { $match: filter },
      {
        $bucket: {
          groupBy: "$cgpa",
          boundaries: [0, 5, 6, 7, 8, 9, 10],
          default: "Other",
          output: {
            count: { $sum: 1 },
            students: { 
              $push: { 
                rollNumber: "$rollNumber", 
                name: "$name", 
                cgpa: "$cgpa" 
              } 
            }
          }
        }
      }
    ]);

    // Get top performers
    const topPerformers = await Student.find(filter)
      .sort({ cgpa: -1 })
      .limit(10)
      .select('rollNumber name department year cgpa');

    // Get average CGPA
    const avgCGPA = await Student.aggregate([
      { $match: filter },
      { $group: { _id: null, avgCGPA: { $avg: "$cgpa" } } }
    ]);

    res.json({
      success: true,
      data: {
        cgpaDistribution,
        topPerformers,
        averageCGPA: avgCGPA[0]?.avgCGPA || 0
      }
    });
  } catch (error) {
    console.error("Performance analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

module.exports = router;
