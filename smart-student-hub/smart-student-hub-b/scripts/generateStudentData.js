const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const dotenv = require("dotenv");
const path = require("path");

// Load .env file from the parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

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
  
  const currentYear = new Date().getFullYear();
  const yearCode = currentYear - (4 - year); // Dynamic year calculation
  return `${yearCode}${deptCode[department]}${String(index).padStart(3, '0')}`;
};

const generateEmail = (firstName, lastName, rollNumber) => {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rollNumber.slice(-3)}@university.edu`;
};

const generatePhone = () => {
  return `${getRandomNumber(7, 9)}${getRandomNumber(100000000, 999999999)}`;
};

const generatePassword = async (rollNumber) => {
  // Generate a default password based on roll number for consistency
  const defaultPassword = `student${rollNumber.slice(-3)}`; // e.g., "student001"
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(defaultPassword, salt);
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

// Main generation function with enhanced data quality and password support
const generateStudentData = async (count = 50) => {
  const students = [];
  let rollCounter = Math.floor(Math.random() * 100) + 1; // Start from random number to avoid conflicts
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const department = getRandomElement(departments);
    const year = getRandomNumber(1, 4);
    const section = getRandomElement(sections);
    const rollNumber = generateRollNumber(year, department, rollCounter++);
    
    // Generate password hash for the student
    const passwordHash = await generatePassword(rollNumber);
    
    const student = {
      rollNumber,
      name: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName, rollNumber),
      passwordHash,
      role: "student",
      phone: generatePhone(),
      gender: getRandomElement(genders),
      age: getRandomNumber(18, 24),
      department,
      year,
      section,
      address: generateAddress(),
      cgpa: getRandomFloat(6.0, 9.5),
      currentSemester: (year - 1) * 2 + getRandomNumber(1, 2),
      overallAttendancePercentage: getRandomNumber(70, 95),
      semesterGrades: generateSemesterGrades(year),
      attendance: generateAttendance(),
      activities: generateActivities(),
      bloodGroup: getRandomElement(bloodGroups),
      emergencyContact: generateEmergencyContact(),
      isActive: true,
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    students.push(student);
  }
  
  return students;
};

// Database connection and data insertion
const insertStudentData = async (options = {}) => {
  const { count = 50, clearExisting = false, preserveExisting = true } = options;
  
  try {
    console.log("🔄 Connecting to MongoDB...");
    
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set");
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");

    // Check existing data
    const existingCount = await Student.countDocuments();
    console.log(`📊 Found ${existingCount} existing student records`);

    // Preserve existing data by default (especially rollNumber "1234")
    if (clearExisting && !preserveExisting) {
      console.log("🗑️ Clearing existing student data...");
      await Student.deleteMany({});
      console.log("✅ Existing data cleared");
    } else {
      console.log("✅ Preserving existing student data");
    }

    // Generate student data
    console.log(`🔄 Generating ${count} new student records...`);
    const studentData = await generateStudentData(count);
    console.log(`✅ Generated ${studentData.length} student records`);
    
    // Filter out any duplicates with existing roll numbers
    const existingRollNumbers = await Student.distinct('rollNumber');
    const newStudentData = studentData.filter(student => 
      !existingRollNumbers.includes(student.rollNumber)
    );
    
    if (newStudentData.length !== studentData.length) {
      console.log(`⚠️  Filtered out ${studentData.length - newStudentData.length} duplicate roll numbers`);
    }
    
    if (newStudentData.length === 0) {
      console.log("ℹ️  No new students to add (all roll numbers already exist)");
      return;
    }

    // Insert data in batches to avoid memory issues
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < newStudentData.length; i += batchSize) {
      const batch = newStudentData.slice(i, i + batchSize);
      try {
        await Student.insertMany(batch, { ordered: false });
        insertedCount += batch.length;
        console.log(`✅ Inserted batch: ${insertedCount}/${newStudentData.length} students`);
      } catch (batchError) {
        console.warn(`⚠️  Batch insertion warning:`, batchError.message);
        // Continue with next batch even if some documents fail
      }
    }

    console.log(`🎉 Successfully inserted ${insertedCount} new student records!`);
    
    // Final count verification
    const finalCount = await Student.countDocuments();
    console.log(`📊 Total students in database: ${finalCount}`);

    // Generate comprehensive statistics
    const stats = await Student.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          avgCGPA: { $avg: "$cgpa" },
          avgAge: { $avg: "$age" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log("\n📊 Department-wise Statistics:");
    console.table(stats.map(stat => ({
      Department: stat._id,
      Students: stat.count,
      'Avg CGPA': stat.avgCGPA ? stat.avgCGPA.toFixed(2) : 'N/A',
      'Avg Age': stat.avgAge ? stat.avgAge.toFixed(1) : 'N/A'
    })));

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

// Enhanced script execution with command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1]) || 50;
    } else if (arg === '--clear') {
      options.clearExisting = true;
      options.preserveExisting = false;
    } else if (arg === '--help') {
      console.log(`
📚 Student Data Generator Usage:
`);
      console.log(`node generateStudentData.js [options]
`);
      console.log(`Options:`);
      console.log(`  --count=N     Generate N student records (default: 50)`);
      console.log(`  --clear       Clear existing data before inserting`);
      console.log(`  --help        Show this help message\n`);
      console.log(`Examples:`);
      console.log(`  node generateStudentData.js --count=100`);
      console.log(`  node generateStudentData.js --count=200 --clear\n`);
      process.exit(0);
    }
  });
  
  console.log(`🚀 Starting student data generation with options:`, options);
  insertStudentData(options)
    .then(() => {
      console.log(`\n✅ Script completed successfully!`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`\n❌ Script failed:`, error.message);
      process.exit(1);
    });
}

module.exports = { generateStudentData, insertStudentData };
