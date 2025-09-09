const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Student = require("../models/Student");
const Activity = require("../models/Activity");
const geminiService = require("../services/geminiService");

// Skill recommendations database based on department and performance
const skillRecommendations = {
  "Computer Science and Engineering": {
    high: ["Machine Learning", "Cloud Computing", "DevOps", "System Design", "Blockchain", "AI/ML", "Microservices"],
    medium: ["Full Stack Development", "Database Management", "API Development", "React/Angular", "Node.js", "Python"],
    low: ["Programming Fundamentals", "Data Structures", "Algorithms", "Basic Web Development", "Git/Version Control"]
  },
  "Information Technology": {
    high: ["Cybersecurity", "Cloud Architecture", "Data Analytics", "IT Project Management", "Enterprise Solutions"],
    medium: ["Network Administration", "Database Design", "Web Technologies", "Mobile Development", "Software Testing"],
    low: ["Basic Programming", "Computer Networks", "Operating Systems", "Database Basics", "Web Fundamentals"]
  },
  "Electronics and Communication Engineering": {
    high: ["IoT Development", "Embedded Systems", "Signal Processing", "VLSI Design", "5G Technology"],
    medium: ["Circuit Design", "Microcontrollers", "Communication Systems", "Digital Signal Processing"],
    low: ["Basic Electronics", "Circuit Analysis", "Digital Logic", "Analog Electronics", "Communication Basics"]
  },
  "Mechanical Engineering": {
    high: ["CAD/CAM", "Robotics", "Automation", "3D Printing", "Industry 4.0", "Finite Element Analysis"],
    medium: ["SolidWorks", "AutoCAD", "Manufacturing Processes", "Thermodynamics", "Fluid Mechanics"],
    low: ["Engineering Drawing", "Material Science", "Mechanics", "Basic Manufacturing", "Engineering Fundamentals"]
  },
  "Electrical Engineering": {
    high: ["Power Systems", "Renewable Energy", "Smart Grid", "Electric Vehicles", "Power Electronics"],
    medium: ["Control Systems", "Electrical Machines", "Power Generation", "Circuit Analysis"],
    low: ["Basic Electrical", "Circuit Theory", "Electrical Safety", "Measurement Techniques"]
  },
  "Civil Engineering": {
    high: ["BIM Technology", "Sustainable Construction", "Smart Cities", "Structural Analysis Software"],
    medium: ["AutoCAD", "Structural Design", "Construction Management", "Surveying"],
    low: ["Engineering Drawing", "Building Materials", "Construction Basics", "Surveying Fundamentals"]
  }
};

// Course recommendations based on performance and department
const courseRecommendations = {
  "Computer Science and Engineering": {
    high: [
      { title: "Advanced Machine Learning", platform: "Coursera", provider: "Stanford", duration: "12 weeks", level: "Advanced" },
      { title: "System Design Interview", platform: "Educative", provider: "Grokking", duration: "8 weeks", level: "Advanced" },
      { title: "AWS Solutions Architect", platform: "AWS", provider: "Amazon", duration: "16 weeks", level: "Professional" },
      { title: "Kubernetes for Developers", platform: "Udemy", provider: "Docker", duration: "10 weeks", level: "Advanced" }
    ],
    medium: [
      { title: "Full Stack Web Development", platform: "freeCodeCamp", provider: "freeCodeCamp", duration: "20 weeks", level: "Intermediate" },
      { title: "React - The Complete Guide", platform: "Udemy", provider: "Maximilian", duration: "12 weeks", level: "Intermediate" },
      { title: "Node.js Backend Development", platform: "Coursera", provider: "IBM", duration: "8 weeks", level: "Intermediate" },
      { title: "Database Design and SQL", platform: "edX", provider: "MIT", duration: "6 weeks", level: "Intermediate" }
    ],
    low: [
      { title: "Programming Fundamentals with Python", platform: "Coursera", provider: "University of Michigan", duration: "8 weeks", level: "Beginner" },
      { title: "Data Structures and Algorithms", platform: "Udacity", provider: "Google", duration: "12 weeks", level: "Beginner" },
      { title: "Introduction to Web Development", platform: "freeCodeCamp", provider: "freeCodeCamp", duration: "10 weeks", level: "Beginner" },
      { title: "Git and GitHub Essentials", platform: "Udemy", provider: "Colt Steele", duration: "4 weeks", level: "Beginner" }
    ]
  },
  "Information Technology": {
    high: [
      { title: "Cybersecurity Specialization", platform: "Coursera", provider: "University of Maryland", duration: "16 weeks", level: "Advanced" },
      { title: "AWS Cloud Practitioner", platform: "AWS", provider: "Amazon", duration: "8 weeks", level: "Professional" },
      { title: "Data Science and Analytics", platform: "edX", provider: "Harvard", duration: "12 weeks", level: "Advanced" }
    ],
    medium: [
      { title: "Network Administration", platform: "Cisco", provider: "Cisco Networking Academy", duration: "10 weeks", level: "Intermediate" },
      { title: "Database Administration", platform: "Oracle", provider: "Oracle University", duration: "8 weeks", level: "Intermediate" },
      { title: "Mobile App Development", platform: "Udacity", provider: "Google", duration: "12 weeks", level: "Intermediate" }
    ],
    low: [
      { title: "IT Fundamentals", platform: "CompTIA", provider: "CompTIA", duration: "6 weeks", level: "Beginner" },
      { title: "Basic Networking", platform: "Cisco", provider: "Cisco", duration: "8 weeks", level: "Beginner" },
      { title: "Introduction to Databases", platform: "Coursera", provider: "Stanford", duration: "6 weeks", level: "Beginner" }
    ]
  }
};

// Activity-based skill extraction
const activitySkillMapping = {
  "competition": ["Problem Solving", "Competitive Programming", "Analytical Thinking", "Time Management"],
  "certification": ["Professional Development", "Industry Knowledge", "Skill Validation"],
  "internship": ["Industry Experience", "Professional Skills", "Real-world Application", "Team Collaboration"],
  "research": ["Research Methodology", "Critical Thinking", "Innovation", "Academic Writing"],
  "workshop": ["Continuous Learning", "Skill Enhancement", "Networking"],
  "volunteering": ["Leadership", "Social Responsibility", "Communication", "Team Work"]
};

// Performance level calculation
function calculatePerformanceLevel(cgpa, attendancePercentage) {
  const cgpaScore = cgpa >= 8.5 ? 3 : cgpa >= 7.0 ? 2 : 1;
  const attendanceScore = attendancePercentage >= 85 ? 3 : attendancePercentage >= 75 ? 2 : 1;
  const averageScore = (cgpaScore + attendanceScore) / 2;
  
  if (averageScore >= 2.5) return "high";
  if (averageScore >= 1.5) return "medium";
  return "low";
}

// Analyze weak subjects from semester grades
function analyzeWeakSubjects(semesterGrades) {
  const weakSubjects = [];
  const subjectPerformance = {};
  
  semesterGrades.forEach(semester => {
    semester.subjects.forEach(subject => {
      const gradePoints = {
        'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0, 'AB': 0
      };
      
      const points = gradePoints[subject.grade] || 0;
      if (!subjectPerformance[subject.subjectName]) {
        subjectPerformance[subject.subjectName] = [];
      }
      subjectPerformance[subject.subjectName].push(points);
    });
  });
  
  // Find subjects with consistently low performance
  Object.keys(subjectPerformance).forEach(subject => {
    const avgGrade = subjectPerformance[subject].reduce((a, b) => a + b, 0) / subjectPerformance[subject].length;
    if (avgGrade < 6) {
      weakSubjects.push({
        subject: subject,
        averageGrade: avgGrade,
        improvement: avgGrade < 4 ? "Critical" : avgGrade < 6 ? "Moderate" : "Minor"
      });
    }
  });
  
  return weakSubjects.sort((a, b) => a.averageGrade - b.averageGrade);
}

// Generate personalized recommendations
router.get("/recommendations/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, using fallback demo data");
      return res.json(getFallbackRecommendationData(studentId));
    }
    
    // Try to find student by MongoDB ObjectId first, then by rollNumber
    let student = null;
    try {
      student = await Student.findById(studentId).timeout(5000);
    } catch (error) {
      // If not a valid ObjectId, try finding by rollNumber
      try {
        student = await Student.findOne({ rollNumber: studentId }).timeout(5000);
      } catch (timeoutError) {
        console.log("Database query timeout, using fallback data");
        return res.json(getFallbackRecommendationData(studentId));
      }
    }
    
    if (!student) {
      console.log("Student not found, using fallback data");
      return res.json(getFallbackRecommendationData(studentId));
    }
    
    // Fetch student activities using the actual MongoDB _id
    let activities = [];
    try {
      activities = await Activity.find({ studentId: student._id, status: "approved" }).timeout(5000);
    } catch (error) {
      console.log("Activity query timeout, using empty activities array");
      activities = [];
    }
    
    // Calculate performance level
    const performanceLevel = calculatePerformanceLevel(student.cgpa, student.overallAttendancePercentage);
    
    // Get AI-powered skill recommendations from Gemini
    let geminiSkillData = {};
    try {
      geminiSkillData = await geminiService.generateSkillRecommendations({
        name: student.name,
        department: student.department,
        year: student.year,
        cgpa: student.cgpa,
        overallAttendancePercentage: student.overallAttendancePercentage,
        skills: student.skills,
        activities: activities
      });
    } catch (error) {
      console.log("Gemini skill recommendations failed, using fallback");
      geminiSkillData = {};
    }
    
    // Extract skills from Gemini response or fallback to static recommendations
    let recommendedSkills = [];
    if (geminiSkillData.recommendedSkills && geminiSkillData.recommendedSkills.length > 0) {
      recommendedSkills = geminiSkillData.recommendedSkills.map(item => item.skill);
    } else {
      const departmentSkills = skillRecommendations[student.department] || skillRecommendations["Computer Science and Engineering"];
      recommendedSkills = departmentSkills[performanceLevel] || departmentSkills["medium"];
    }
    
    // Get existing skills from activities
    const existingSkills = new Set();
    student.skills.forEach(skill => existingSkills.add(skill.toLowerCase()));
    activities.forEach(activity => {
      if (activitySkillMapping[activity.type]) {
        activitySkillMapping[activity.type].forEach(skill => existingSkills.add(skill.toLowerCase()));
      }
    });
    
    // Filter out existing skills
    const newSkillRecommendations = recommendedSkills.filter(skill => 
      !existingSkills.has(skill.toLowerCase())
    );
    
    // Get AI-powered course recommendations from Gemini
    let geminiCourseData = {};
    try {
      geminiCourseData = await geminiService.generateCourseRecommendations({
        name: student.name,
        department: student.department,
        year: student.year,
        cgpa: student.cgpa,
        overallAttendancePercentage: student.overallAttendancePercentage,
        skills: student.skills,
        activities: activities
      });
    } catch (error) {
      console.log("Gemini course recommendations failed, using fallback");
      geminiCourseData = {};
    }
    
    const recommendedCourses = geminiCourseData.courses || [];
    
    // Fallback to static recommendations if Gemini fails
    if (recommendedCourses.length === 0) {
      const departmentCourses = courseRecommendations[student.department] || courseRecommendations["Computer Science and Engineering"];
      const fallbackCourses = departmentCourses[performanceLevel] || departmentCourses["medium"];
      recommendedCourses.push(...fallbackCourses);
    }
    
    // Analyze weak subjects
    const weakSubjects = analyzeWeakSubjects(student.semesterGrades);
    
    // Generate improvement suggestions based on CGPA and attendance
    const improvementSuggestions = [];
    
    if (student.cgpa < 7.0) {
      improvementSuggestions.push({
        area: "Academic Performance",
        priority: "High",
        suggestion: "Focus on improving grades in core subjects. Consider forming study groups and seeking help from faculty.",
        actionItems: ["Attend extra classes", "Form study groups", "Seek faculty guidance", "Practice more problems"]
      });
    }
    
    if (student.overallAttendancePercentage < 75) {
      improvementSuggestions.push({
        area: "Attendance",
        priority: "Critical",
        suggestion: "Improve attendance to meet minimum requirements. Regular attendance is crucial for academic success.",
        actionItems: ["Set daily reminders", "Plan schedule better", "Avoid unnecessary absences", "Catch up on missed classes"]
      });
    }
    
    if (activities.length < 3) {
      improvementSuggestions.push({
        area: "Extracurricular Activities",
        priority: "Medium",
        suggestion: "Participate in more activities to enhance your profile and gain practical experience.",
        actionItems: ["Join competitions", "Attend workshops", "Pursue certifications", "Engage in projects"]
      });
    }
    
    // Activity-based recommendations
    const activityRecommendations = [];
    const activityTypes = activities.map(a => a.type);
    const missingActivityTypes = ["competition", "certification", "internship", "research", "workshop"].filter(
      type => !activityTypes.includes(type)
    );
    
    missingActivityTypes.forEach(type => {
      const recommendations = {
        "competition": "Participate in coding competitions to improve problem-solving skills",
        "certification": "Pursue industry certifications to validate your skills",
        "internship": "Apply for internships to gain real-world experience",
        "research": "Engage in research projects to develop analytical thinking",
        "workshop": "Attend workshops to learn new technologies and network"
      };
      
      activityRecommendations.push({
        type: type,
        recommendation: recommendations[type],
        priority: type === "internship" ? "High" : "Medium"
      });
    });
    
    const response = {
      studentInfo: {
        name: student.name,
        department: student.department,
        year: student.year,
        cgpa: student.cgpa,
        attendancePercentage: student.overallAttendancePercentage,
        performanceLevel: performanceLevel
      },
      skillRecommendations: {
        newSkills: newSkillRecommendations.slice(0, 8),
        existingSkills: Array.from(existingSkills).slice(0, 10),
        skillGaps: newSkillRecommendations.length
      },
      courseRecommendations: recommendedCourses.slice(0, 8),
      geminiInsights: {
        courseReasoning: geminiCourseData.reasoning || "AI-powered recommendations based on your profile",
        skillGuidance: geminiSkillData.careerFocus || "Focus on building relevant skills for your field"
      },
      weakSubjects: weakSubjects.slice(0, 5),
      improvementSuggestions: improvementSuggestions,
      activityRecommendations: activityRecommendations.slice(0, 3),
      careerGuidance: {
        level: performanceLevel,
        focus: performanceLevel === "high" ? "Advanced specialization and leadership roles" :
               performanceLevel === "medium" ? "Skill enhancement and practical experience" :
               "Foundation building and academic improvement",
        nextSteps: performanceLevel === "high" ? 
          ["Pursue advanced certifications", "Lead projects", "Mentor juniors", "Prepare for competitive exams"] :
          performanceLevel === "medium" ?
          ["Complete relevant courses", "Gain practical experience", "Build portfolio", "Network with professionals"] :
          ["Improve academic performance", "Build strong fundamentals", "Seek academic support", "Focus on core subjects"]
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// Get skill trends and analytics
router.get("/analytics/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, using fallback analytics data");
      return res.json(getFallbackAnalyticsData());
    }
    
    // Try to find student by MongoDB ObjectId first, then by rollNumber
    let student = null;
    try {
      student = await Student.findById(studentId).timeout(5000);
    } catch (error) {
      try {
        student = await Student.findOne({ rollNumber: studentId }).timeout(5000);
      } catch (timeoutError) {
        console.log("Database query timeout for analytics, using fallback data");
        return res.json(getFallbackAnalyticsData());
      }
    }
    
    if (!student) {
      console.log("Student not found for analytics, using fallback data");
      return res.json(getFallbackAnalyticsData());
    }
    
    let activities = [];
    try {
      activities = await Activity.find({ studentId: student._id, status: "approved" }).timeout(5000);
    } catch (error) {
      console.log("Activity query timeout for analytics, using empty activities array");
      activities = [];
    }
    
    // Calculate skill progression over time
    const skillProgression = {};
    activities.forEach(activity => {
      const month = new Date(activity.date).toISOString().slice(0, 7);
      if (!skillProgression[month]) {
        skillProgression[month] = new Set();
      }
      if (activitySkillMapping[activity.type]) {
        activitySkillMapping[activity.type].forEach(skill => {
          skillProgression[month].add(skill);
        });
      }
    });
    
    // Convert sets to arrays and calculate cumulative skills
    const progressionData = Object.keys(skillProgression)
      .sort()
      .map(month => ({
        month,
        newSkills: Array.from(skillProgression[month]),
        skillCount: skillProgression[month].size
      }));
    
    // Calculate performance trends
    const performanceTrends = student.semesterGrades?.map(semester => ({
      semester: semester.semester,
      sgpa: semester.sgpa,
      subjects: semester.subjects.length,
      averageMarks: semester.subjects.reduce((sum, sub) => sum + (sub.marks || 0), 0) / semester.subjects.length
    })) || [];
    
    res.json({
      skillProgression: progressionData,
      performanceTrends: performanceTrends,
      activityDistribution: activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {}),
      totalActivities: activities.length,
      averageCredits: activities.reduce((sum, act) => sum + act.credits, 0) / activities.length || 0
    });
    
  } catch (error) {
    console.error("Error generating analytics:", error);
    return res.json(getFallbackAnalyticsData());
  }
});

// Get department-wise skill comparison
router.get("/department-comparison/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, using fallback comparison data");
      return res.json(getFallbackComparisonData());
    }
    
    // Try to find student by MongoDB ObjectId first, then by rollNumber
    let student = null;
    try {
      student = await Student.findById(studentId).timeout(5000);
    } catch (error) {
      try {
        student = await Student.findOne({ rollNumber: studentId }).timeout(5000);
      } catch (timeoutError) {
        console.log("Database query timeout for comparison, using fallback data");
        return res.json(getFallbackComparisonData());
      }
    }
    
    if (!student) {
      console.log("Student not found for comparison, using fallback data");
      return res.json(getFallbackComparisonData());
    }
    
    // Get all students from same department and year
    let peers = [];
    try {
      peers = await Student.find({
        department: student.department,
        year: student.year,
        isActive: true
      }).select('cgpa overallAttendancePercentage activities skills').timeout(5000);
    } catch (error) {
      console.log("Peer query timeout for comparison, using fallback data");
      return res.json(getFallbackComparisonData());
    }
    
    if (peers.length === 0) {
      return res.json(getFallbackComparisonData());
    }
    
    // Calculate department averages
    const departmentStats = {
      averageCGPA: peers.reduce((sum, peer) => sum + peer.cgpa, 0) / peers.length,
      averageAttendance: peers.reduce((sum, peer) => sum + peer.overallAttendancePercentage, 0) / peers.length,
      totalStudents: peers.length
    };
    
    // Calculate student's percentile
    const cgpaPercentile = (peers.filter(peer => peer.cgpa < student.cgpa).length / peers.length) * 100;
    const attendancePercentile = (peers.filter(peer => peer.overallAttendancePercentage < student.overallAttendancePercentage).length / peers.length) * 100;
    
    res.json({
      studentPerformance: {
        cgpa: student.cgpa,
        attendance: student.overallAttendancePercentage,
        cgpaPercentile: Math.round(cgpaPercentile),
        attendancePercentile: Math.round(attendancePercentile)
      },
      departmentStats,
      comparison: {
        cgpaStatus: student.cgpa > departmentStats.averageCGPA ? "Above Average" : "Below Average",
        attendanceStatus: student.overallAttendancePercentage > departmentStats.averageAttendance ? "Above Average" : "Below Average"
      }
    });
    
  } catch (error) {
    console.error("Error generating department comparison:", error);
    return res.json(getFallbackComparisonData());
  }
});

// Fallback recommendation data function
function getFallbackRecommendationData(studentId) {
  return {
    studentInfo: {
      name: "Demo Student",
      department: "Computer Science and Engineering",
      year: 3,
      cgpa: 7.5,
      attendancePercentage: 85,
      performanceLevel: "medium"
    },
    skillRecommendations: {
      newSkills: ["Full Stack Development", "Database Management", "API Development", "React/Angular", "Node.js", "Python"],
      existingSkills: ["Programming Fundamentals", "Data Structures", "Web Development"],
      skillGaps: 6
    },
    courseRecommendations: [
      {
        title: "Full Stack Web Development",
        platform: "freeCodeCamp",
        provider: "freeCodeCamp",
        duration: "20 weeks",
        level: "Intermediate",
        relevance: "Essential for modern web development careers",
        skills: ["React", "Node.js", "MongoDB", "Express"]
      },
      {
        title: "React - The Complete Guide",
        platform: "Udemy",
        provider: "Maximilian",
        duration: "12 weeks",
        level: "Intermediate",
        relevance: "Popular frontend framework with high demand",
        skills: ["React", "JavaScript", "Redux", "Hooks"]
      },
      {
        title: "Node.js Backend Development",
        platform: "Coursera",
        provider: "IBM",
        duration: "8 weeks",
        level: "Intermediate",
        relevance: "Server-side development skills",
        skills: ["Node.js", "Express", "APIs", "Backend"]
      }
    ],
    geminiInsights: {
      courseReasoning: "Fallback recommendations based on Computer Science curriculum and industry trends",
      skillGuidance: "Focus on building full-stack development skills for better career prospects"
    },
    weakSubjects: [
      {
        subject: "Database Management Systems",
        averageGrade: 5.5,
        improvement: "Moderate"
      }
    ],
    improvementSuggestions: [
      {
        area: "Technical Skills",
        priority: "High",
        suggestion: "Focus on practical programming projects to strengthen technical foundation",
        actionItems: ["Build portfolio projects", "Practice coding daily", "Contribute to open source", "Take online courses"]
      }
    ],
    activityRecommendations: [
      {
        type: "internship",
        recommendation: "Apply for internships to gain real-world experience",
        priority: "High"
      },
      {
        type: "competition",
        recommendation: "Participate in coding competitions to improve problem-solving skills",
        priority: "Medium"
      }
    ],
    careerGuidance: {
      level: "medium",
      focus: "Skill enhancement and practical experience",
      nextSteps: ["Complete relevant courses", "Gain practical experience", "Build portfolio", "Network with professionals"]
    }
  };
}

// Fallback analytics data function
function getFallbackAnalyticsData() {
  return {
    skillProgression: [
      { month: '2024-01', newSkills: ['JavaScript', 'HTML'], skillCount: 2 },
      { month: '2024-02', newSkills: ['React', 'CSS'], skillCount: 2 },
      { month: '2024-03', newSkills: ['Node.js'], skillCount: 1 }
    ],
    performanceTrends: [
      { semester: 1, sgpa: 7.2, subjects: 6, averageMarks: 72 },
      { semester: 2, sgpa: 7.5, subjects: 6, averageMarks: 75 },
      { semester: 3, sgpa: 7.8, subjects: 7, averageMarks: 78 }
    ],
    activityDistribution: { competition: 2, certification: 3, internship: 1, workshop: 4 },
    totalActivities: 10,
    averageCredits: 2.5
  };
}

// Fallback comparison data function
function getFallbackComparisonData() {
  return {
    studentPerformance: {
      cgpa: 7.5,
      attendance: 85,
      cgpaPercentile: 65,
      attendancePercentile: 70
    },
    departmentStats: {
      averageCGPA: 7.2,
      averageAttendance: 82,
      totalStudents: 120
    },
    comparison: {
      cgpaStatus: "Above Average",
      attendanceStatus: "Above Average"
    }
  };
}

module.exports = router;
