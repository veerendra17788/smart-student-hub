const mongoose = require("mongoose");
const Student = require("../models/Student");
const dotenv = require("dotenv");

dotenv.config();

// Sample data arrays
const departments = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology'
];

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
  'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Rishabh', 'Aryan',
  'Kabir', 'Ansh', 'Kiaan', 'Rudra', 'Priya', 'Ananya', 'Fatima', 'Aadhya',
  'Vaani', 'Anika', 'Myra', 'Sara', 'Diya', 'Pihu', 'Riya', 'Anvi',
  'Kavya', 'Navya', 'Saanvi', 'Avni', 'Pari', 'Khushi', 'Angel', 'Ishita',
  'Tanvi', 'Tara', 'Aditi', 'Siya', 'Kiara', 'Shanaya', 'Palak', 'Janvi'
];

const lastNames = [
  'Sharma', 'Verma', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Jain', 'Bansal',
  'Mittal', 'Goel', 'Aggarwal', 'Saxena', 'Srivastava', 'Tiwari', 'Mishra', 'Pandey',
  'Yadav', 'Chauhan', 'Joshi', 'Mehta', 'Shah', 'Patel', 'Desai', 'Modi',
  'Reddy', 'Rao', 'Krishna', 'Prasad', 'Nair', 'Menon', 'Pillai', 'Kumar',
  'Das', 'Roy', 'Ghosh', 'Mukherjee', 'Chatterjee', 'Banerjee', 'Sen', 'Bose'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Coimbatore', 'Madurai', 'Vijayawada'
];

const states = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal',
  'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh',
  'Bihar', 'Punjab', 'Haryana', 'Kerala', 'Odisha', 'Jharkhand', 'Assam'
];

const subjects = [
  { code: 'CS101', name: 'Programming Fundamentals' },
  { code: 'CS102', name: 'Data Structures' },
  { code: 'CS103', name: 'Computer Networks' },
  { code: 'CS104', name: 'Database Management' },
  { code: 'CS105', name: 'Software Engineering' },
  { code: 'MA101', name: 'Engineering Mathematics' },
  { code: 'PH101', name: 'Engineering Physics' },
  { code: 'CH101', name: 'Engineering Chemistry' },
  { code: 'EE101', name: 'Basic Electrical Engineering' },
  { code: 'ME101', name: 'Engineering Mechanics' }
];

const activityTypes = ['competition', 'certification', 'internship', 'project', 'workshop', 'seminar'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female'];
const sections = ['A', 'B', 'C', 'D'];

// Helper functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max, decimals = 2) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

const generateRollNumber = (year, department, index) => {
  const deptCode = {
    'Computer Science and Engineering': 'CSE',
    'Information Technology': 'IT',
    'Electronics and Communication Engineering': 'ECE',
    'Electrical Engineering': 'EEE',
    'Mechanical Engineering': 'ME',
    'Civil Engineering': 'CE',
    'Chemical Engineering': 'CHE',
    'Biotechnology': 'BT'
  };
  
  const yearCode = `2${4 - year}`; // 2024 for 1st year, 2023 for 2nd year, etc.
  return `${yearCode}${deptCode[department]}${String(index).padStart(3, '0')}`;
};

const generateEmail = (firstName, lastName, rollNumber) => {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rollNumber.slice(-3)}@university.edu`;
};

const generatePhone = () => {
  return `${getRandomNumber(7, 9)}${getRandomNumber(100000000, 999999999)}`;
};

const generateAddress = () => {
  const city = getRandomElement(cities);
  const state = getRandomElement(states);
  return {
    street: `${getRandomNumber(1, 999)} ${getRandomElement(['MG Road', 'Park Street', 'Gandhi Nagar', 'Nehru Place', 'Sector', 'Colony'])}`,
    city,
    state,
    country: 'India',
    pincode: String(getRandomNumber(100000, 999999))
  };
};

const generateAttendance = () => {
  const attendance = [];
  const numSubjects = getRandomNumber(5, 8);
  const selectedSubjects = subjects.sort(() => 0.5 - Math.random()).slice(0, numSubjects);
  
  selectedSubjects.forEach(subject => {
    const totalClasses = getRandomNumber(40, 80);
    const attendedClasses = getRandomNumber(Math.floor(totalClasses * 0.5), totalClasses);
    
    attendance.push({
      subjectCode: subject.code,
      subjectName: subject.name,
      totalClasses,
      attendedClasses,
      attendancePercentage: Math.round((attendedClasses / totalClasses) * 100)
    });
  });
  
  return attendance;
};

const generateSemesterGrades = (currentYear) => {
  const grades = [];
  const maxSemesters = (currentYear - 1) * 2; // Previous completed semesters
  
  for (let sem = 1; sem <= maxSemesters; sem++) {
    const numSubjects = getRandomNumber(6, 8);
    const semesterSubjects = [];
    
    for (let i = 0; i < numSubjects; i++) {
      const subject = getRandomElement(subjects);
      const gradeOptions = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P'];
      const weights = [0.1, 0.15, 0.25, 0.25, 0.15, 0.08, 0.02]; // Higher probability for better grades
      
      let grade = 'B';
      const random = Math.random();
      let cumulative = 0;
      for (let j = 0; j < gradeOptions.length; j++) {
        cumulative += weights[j];
        if (random <= cumulative) {
          grade = gradeOptions[j];
          break;
        }
      }
      
      semesterSubjects.push({
        subjectCode: `${subject.code}${sem}`,
        subjectName: subject.name,
        grade,
        credits: getRandomNumber(3, 4),
        marks: getRandomNumber(60, 95)
      });
    }
    
    const sgpa = getRandomFloat(6.5, 9.5);
    grades.push({
      semester: sem,
      subjects: semesterSubjects,
      sgpa
    });
  }
  
  return grades;
};

const generateActivities = () => {
  const activities = [];
  const numActivities = getRandomNumber(2, 8);
  
  for (let i = 0; i < numActivities; i++) {
    const type = getRandomElement(activityTypes);
    const startDate = new Date(2023, getRandomNumber(0, 11), getRandomNumber(1, 28));
    const endDate = new Date(startDate.getTime() + getRandomNumber(1, 90) * 24 * 60 * 60 * 1000);
    
    activities.push({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${getRandomNumber(1, 100)}`,
      description: `Description for ${type} activity`,
      organization: getRandomElement(['TechCorp', 'InnovateLab', 'CodeAcademy', 'SkillHub', 'LearnTech']),
      startDate,
      endDate,
      status: getRandomElement(['completed', 'ongoing']),
      skills: ['Programming', 'Problem Solving', 'Communication'].slice(0, getRandomNumber(1, 3))
    });
  }
  
  return activities;
};

const generateEmergencyContact = () => {
  const relations = ['Father', 'Mother', 'Guardian', 'Sibling'];
  return {
    name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
    phone: generatePhone(),
    relation: getRandomElement(relations)
  };
};

// Main generation function
const generateStudentData = (count = 700) => {
  const students = [];
  let rollCounter = 1;
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const department = getRandomElement(departments);
    const year = getRandomNumber(1, 4);
    const section = getRandomElement(sections);
    const rollNumber = generateRollNumber(year, department, rollCounter++);
    
    const student = {
      rollNumber,
      name: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName, rollNumber),
      phone: generatePhone(),
      gender: getRandomElement(genders),
      age: getRandomNumber(18, 24),
      department,
      year,
      section,
      address: generateAddress(),
      cgpa: getRandomFloat(6.0, 9.5),
      semesterGrades: generateSemesterGrades(year),
      attendance: generateAttendance(),
      activities: generateActivities(),
      bloodGroup: getRandomElement(bloodGroups),
      emergencyContact: generateEmergencyContact(),
      isActive: true,
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`
    };
    
    students.push(student);
  }
  
  return students;
};

// Database connection and data insertion
const insertStudentData = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");

    // Clear existing student data (optional - comment out if you want to keep existing data)
    console.log("🗑️ Clearing existing student data...");
    await Student.deleteMany({});
    console.log("✅ Existing data cleared");

    // Generate student data
    console.log("🔄 Generating student data...");
    const studentData = generateStudentData(700);
    console.log(`✅ Generated ${studentData.length} student records`);

    // Insert data in batches to avoid memory issues
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < studentData.length; i += batchSize) {
      const batch = studentData.slice(i, i + batchSize);
      await Student.insertMany(batch);
      insertedCount += batch.length;
      console.log(`✅ Inserted ${insertedCount}/${studentData.length} students`);
    }

    console.log("🎉 All student data inserted successfully!");

    // Generate some statistics
    const stats = await Student.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          avgCGPA: { $avg: "$cgpa" },
          avgAttendance: { $avg: "$overallAttendancePercentage" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log("\n📊 Department-wise Statistics:");
    console.table(stats);

    // Year-wise distribution
    const yearStats = await Student.aggregate([
      {
        $group: {
          _id: "$year",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log("\n📊 Year-wise Distribution:");
    console.table(yearStats);

  } catch (error) {
    console.error("❌ Error inserting student data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔐 Database connection closed");
  }
};

// Run the script
if (require.main === module) {
  insertStudentData();
}

module.exports = { generateStudentData, insertStudentData };
