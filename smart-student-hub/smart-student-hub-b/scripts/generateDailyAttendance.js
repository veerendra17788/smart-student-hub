const mongoose = require("mongoose");
const Student = require("../models/Student");
const dotenv = require("dotenv");
const path = require("path");

// Load .env file from the parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Sample subjects for daily attendance
const subjects = [
  { code: 'CS101', name: 'Programming Fundamentals' },
  { code: 'CS102', name: 'Data Structures' },
  { code: 'CS103', name: 'Computer Networks' },
  { code: 'CS104', name: 'Database Management' },
  { code: 'MA101', name: 'Engineering Mathematics' },
  { code: 'PH101', name: 'Engineering Physics' },
  { code: 'CH101', name: 'Engineering Chemistry' },
  { code: 'EE101', name: 'Basic Electrical Engineering' }
];

// Helper functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate daily attendance records for a student
const generateDailyAttendanceForStudent = (rollNumber, startDate, endDate) => {
  const dailyAttendance = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Randomly decide if there are classes on this day (80% chance)
      const hasClasses = Math.random() > 0.2;
      
      if (hasClasses) {
        // Generate 1-4 classes per day
        const numClasses = getRandomNumber(1, 4);
        const daySubjects = subjects.sort(() => 0.5 - Math.random()).slice(0, numClasses);
        
        daySubjects.forEach((subject, index) => {
          // 85% chance of being present, 10% absent, 5% late
          const rand = Math.random();
          let status = 'present';
          if (rand < 0.10) {
            status = 'absent';
          } else if (rand < 0.15) {
            status = 'late';
          }
          
          dailyAttendance.push({
            date: new Date(currentDate),
            subjectCode: subject.code,
            subjectName: subject.name,
            status: status,
            period: index + 1,
            remarks: status === 'late' ? 'Arrived 10 minutes late' : 
                    status === 'absent' ? 'Medical leave' : ''
          });
        });
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dailyAttendance;
};

// Main function to generate and insert daily attendance data
const generateDailyAttendanceData = async (options = {}) => {
  const { 
    rollNumbers = [], 
    startDate = new Date(2024, 0, 1), // January 1, 2024
    endDate = new Date(2024, 11, 31), // December 31, 2024
    clearExisting = false 
  } = options;
  
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

    // Get students to update
    let studentsToUpdate;
    if (rollNumbers.length > 0) {
      studentsToUpdate = await Student.find({ 
        rollNumber: { $in: rollNumbers.map(rn => rn.toUpperCase()) },
        isActive: true 
      });
    } else {
      // Get all active students
      studentsToUpdate = await Student.find({ isActive: true }).limit(10); // Limit to 10 for demo
    }

    console.log(`📊 Found ${studentsToUpdate.length} students to update`);

    if (studentsToUpdate.length === 0) {
      console.log("ℹ️  No students found to update");
      return;
    }

    let updatedCount = 0;

    for (const student of studentsToUpdate) {
      try {
        console.log(`🔄 Generating daily attendance for ${student.rollNumber} (${student.name})`);
        
        // Clear existing daily attendance if requested
        if (clearExisting) {
          student.dailyAttendance = [];
        }
        
        // Generate daily attendance records
        const dailyAttendanceRecords = generateDailyAttendanceForStudent(
          student.rollNumber, 
          startDate, 
          endDate
        );
        
        // Add new records to existing ones
        student.dailyAttendance.push(...dailyAttendanceRecords);
        
        // Update overall attendance statistics based on daily records
        const subjectStats = {};
        
        student.dailyAttendance.forEach(record => {
          if (!subjectStats[record.subjectCode]) {
            subjectStats[record.subjectCode] = {
              subjectCode: record.subjectCode,
              subjectName: record.subjectName,
              totalClasses: 0,
              attendedClasses: 0
            };
          }
          
          subjectStats[record.subjectCode].totalClasses++;
          if (record.status === 'present' || record.status === 'late') {
            subjectStats[record.subjectCode].attendedClasses++;
          }
        });
        
        // Update attendance array
        student.attendance = Object.values(subjectStats).map(stat => ({
          ...stat,
          attendancePercentage: Math.round((stat.attendedClasses / stat.totalClasses) * 100)
        }));
        
        await student.save();
        updatedCount++;
        
        console.log(`✅ Updated ${student.rollNumber} with ${dailyAttendanceRecords.length} daily attendance records`);
        
      } catch (error) {
        console.error(`❌ Error updating student ${student.rollNumber}:`, error.message);
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} students with daily attendance data!`);
    
    // Generate summary statistics
    const sampleStudent = studentsToUpdate[0];
    if (sampleStudent) {
      console.log("\n📊 Sample Statistics:");
      console.log(`Student: ${sampleStudent.name} (${sampleStudent.rollNumber})`);
      console.log(`Daily Records: ${sampleStudent.dailyAttendance.length}`);
      console.log(`Overall Attendance: ${sampleStudent.overallAttendancePercentage}%`);
      
      console.log("\nSubject-wise Attendance:");
      sampleStudent.attendance.forEach(att => {
        console.log(`  ${att.subjectCode}: ${att.attendedClasses}/${att.totalClasses} (${att.attendancePercentage}%)`);
      });
    }

  } catch (error) {
    console.error("❌ Error generating daily attendance data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔐 Database connection closed");
  }
};

// Script execution with command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    rollNumbers: [],
    clearExisting: false
  };
  
  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--rollNumbers=')) {
      options.rollNumbers = arg.split('=')[1].split(',');
    } else if (arg === '--clear') {
      options.clearExisting = true;
    } else if (arg === '--help') {
      console.log(`
📅 Daily Attendance Data Generator Usage:
`);
      console.log(`node generateDailyAttendance.js [options]
`);
      console.log(`Options:`);
      console.log(`  --rollNumbers=RN1,RN2  Generate for specific roll numbers (comma-separated)`);
      console.log(`  --clear                Clear existing daily attendance before generating`);
      console.log(`  --help                 Show this help message\n`);
      console.log(`Examples:`);
      console.log(`  node generateDailyAttendance.js`);
      console.log(`  node generateDailyAttendance.js --rollNumbers=2024CSE001,2024CSE002`);
      console.log(`  node generateDailyAttendance.js --clear\n`);
      process.exit(0);
    }
  });
  
  console.log(`🚀 Starting daily attendance data generation with options:`, options);
  generateDailyAttendanceData(options)
    .then(() => {
      console.log(`\n✅ Script completed successfully!`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`\n❌ Script failed:`, error.message);
      process.exit(1);
    });
}

module.exports = { generateDailyAttendanceData };
