const mongoose = require("mongoose");
const Student = require("../models/Student");
const dotenv = require("dotenv");

dotenv.config();

// Create student record that matches the existing User data
const createStudentRecord = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");

    // Check if student record already exists
    const existingStudent = await Student.findOne({ rollNumber: "1234" });
    if (existingStudent) {
      console.log("✅ Student record already exists");
      return;
    }

    // Create comprehensive student record matching the User data
    const studentData = {
      rollNumber: "1234",
      name: "v",
      email: "vk@gmail.com",
      phone: "9876543210",
      gender: "Male",
      age: 20,
      department: "Computer Science and Engineering",
      year: 2,
      section: "A",
      address: {
        street: "123 College Street",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        pincode: "560001"
      },
      cgpa: 8.5,
      currentSemester: 4,
      overallAttendancePercentage: 85,
      bloodGroup: "B+",
      emergencyContact: {
        name: "Parent Name",
        phone: "9876543211",
        relation: "Father"
      },
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=v",
      activities: [
        {
          type: "project",
          title: "Web Development Project",
          description: "Built a full-stack web application",
          organization: "College",
          startDate: new Date("2024-01-15"),
          endDate: new Date("2024-05-15"),
          status: "completed",
          skills: ["JavaScript", "React", "Node.js", "MongoDB"]
        },
        {
          type: "certification",
          title: "Full Stack Development",
          description: "Completed certification in full stack development",
          organization: "Online Platform",
          startDate: new Date("2024-02-01"),
          endDate: new Date("2024-04-01"),
          status: "completed",
          skills: ["Full Stack Development", "Web Development"]
        }
      ],
      semesterGrades: [
        {
          semester: 1,
          sgpa: 8.2,
          subjects: [
            { subjectCode: "CS101", subjectName: "Programming Fundamentals", grade: "A", credits: 4, marks: 85 },
            { subjectCode: "MA101", subjectName: "Engineering Mathematics", grade: "A+", credits: 4, marks: 92 },
            { subjectCode: "PH101", subjectName: "Engineering Physics", grade: "B+", credits: 3, marks: 78 },
            { subjectCode: "CH101", subjectName: "Engineering Chemistry", grade: "A", credits: 3, marks: 88 }
          ]
        },
        {
          semester: 2,
          sgpa: 8.4,
          subjects: [
            { subjectCode: "CS102", subjectName: "Data Structures", grade: "A+", credits: 4, marks: 94 },
            { subjectCode: "MA102", subjectName: "Advanced Mathematics", grade: "A", credits: 4, marks: 86 },
            { subjectCode: "EE101", subjectName: "Basic Electrical Engineering", grade: "B+", credits: 3, marks: 79 },
            { subjectCode: "ME101", subjectName: "Engineering Mechanics", grade: "A", credits: 3, marks: 87 }
          ]
        },
        {
          semester: 3,
          sgpa: 8.8,
          subjects: [
            { subjectCode: "CS103", subjectName: "Computer Networks", grade: "A+", credits: 4, marks: 96 },
            { subjectCode: "CS104", subjectName: "Database Management", grade: "A", credits: 4, marks: 89 },
            { subjectCode: "CS105", subjectName: "Software Engineering", grade: "A+", credits: 4, marks: 93 },
            { subjectCode: "CS106", subjectName: "Operating Systems", grade: "A", credits: 3, marks: 85 }
          ]
        }
      ],
      attendance: [
        { subjectCode: "CS201", subjectName: "Advanced Programming", totalClasses: 45, attendedClasses: 40, attendancePercentage: 89 },
        { subjectCode: "CS202", subjectName: "Algorithms", totalClasses: 40, attendedClasses: 35, attendancePercentage: 88 },
        { subjectCode: "CS203", subjectName: "Web Technologies", totalClasses: 50, attendedClasses: 42, attendancePercentage: 84 },
        { subjectCode: "CS204", subjectName: "Machine Learning", totalClasses: 35, attendedClasses: 28, attendancePercentage: 80 }
      ],
      isActive: true
    };

    // Insert the student record
    const newStudent = new Student(studentData);
    await newStudent.save();

    console.log("✅ Student record created successfully!");
    console.log("📋 Student Details:");
    console.log(`   Roll Number: ${studentData.rollNumber}`);
    console.log(`   Name: ${studentData.name}`);
    console.log(`   Email: ${studentData.email}`);
    console.log(`   Department: ${studentData.department}`);
    console.log(`   CGPA: ${studentData.cgpa}`);

  } catch (error) {
    console.error("❌ Error creating student record:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔐 Database connection closed");
  }
};

// Run the script
if (require.main === module) {
  createStudentRecord();
}

module.exports = { createStudentRecord };
