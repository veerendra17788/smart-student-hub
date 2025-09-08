const mongoose = require("mongoose");
const Faculty = require("../models/Faculty");
const dotenv = require("dotenv");
require("dotenv").config();
const path = require("path");

// Load .env file from the parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });
// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

// Sample data arrays
const departments = [
  'Computer Science and Engineering',
  'Information Technology', 
  'Electronics and Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Chemistry',
  'English',
  'Management Studies',
  'Economics'
];

const designations = [
  'Professor',
  'Associate Professor', 
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Head of Department',
  'Dean'
];

const titles = ['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.'];
const genders = ['Male', 'Female'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const maritalStatuses = ['Single', 'Married', 'Divorced'];

const firstNamesMale = [
  'Rajesh', 'Suresh', 'Amit', 'Vikram', 'Anil', 'Ravi', 'Deepak', 'Manoj', 'Sanjay', 'Ashok',
  'Ramesh', 'Vinod', 'Prakash', 'Santosh', 'Mahesh', 'Dinesh', 'Naresh', 'Mukesh', 'Rakesh', 'Umesh',
  'Arjun', 'Kiran', 'Mohan', 'Rohan', 'Sohan', 'Nitin', 'Sachin', 'Tarun', 'Varun', 'Arun'
];

const firstNamesFemale = [
  'Priya', 'Sunita', 'Kavita', 'Meera', 'Sita', 'Gita', 'Rita', 'Nita', 'Anita', 'Mamta',
  'Rekha', 'Seema', 'Neha', 'Pooja', 'Asha', 'Usha', 'Radha', 'Sudha', 'Vidya', 'Maya',
  'Shreya', 'Divya', 'Kavya', 'Arya', 'Tanya', 'Sonya', 'Riya', 'Diya', 'Nia', 'Mia'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Agarwal', 'Singh', 'Kumar', 'Jain', 'Bansal', 'Mittal', 'Goel',
  'Saxena', 'Mathur', 'Tiwari', 'Mishra', 'Pandey', 'Srivastava', 'Tripathi', 'Dubey', 'Shukla', 'Joshi',
  'Rao', 'Reddy', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Das', 'Roy', 'Sen', 'Ghosh'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Patna'
];

const states = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 
  'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh', 'Bihar'
];

const universities = [
  'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur', 'IIT Roorkee',
  'NIT Trichy', 'NIT Warangal', 'BITS Pilani', 'Delhi University', 'Mumbai University',
  'Anna University', 'Jadavpur University', 'VTU', 'JNTU', 'Pune University'
];

const researchAreas = {
  'Computer Science and Engineering': [
    'Machine Learning', 'Artificial Intelligence', 'Data Science', 'Cybersecurity', 
    'Software Engineering', 'Computer Networks', 'Database Systems', 'Cloud Computing'
  ],
  'Information Technology': [
    'Web Technologies', 'Mobile Computing', 'Information Security', 'Data Analytics',
    'IT Service Management', 'Enterprise Systems', 'Digital Transformation'
  ],
  'Electronics and Communication Engineering': [
    'Signal Processing', 'VLSI Design', 'Embedded Systems', 'Communication Systems',
    'Microelectronics', 'Antenna Design', 'Wireless Networks'
  ],
  'Mechanical Engineering': [
    'Thermal Engineering', 'Manufacturing Technology', 'Robotics', 'Automotive Engineering',
    'Materials Science', 'Fluid Mechanics', 'CAD/CAM'
  ],
  'Civil Engineering': [
    'Structural Engineering', 'Transportation Engineering', 'Environmental Engineering',
    'Geotechnical Engineering', 'Water Resources', 'Construction Management'
  ]
};

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateFacultyId(department, index) {
  const deptCode = department.split(' ').map(word => word[0]).join('').toUpperCase();
  return `${deptCode}${String(index).padStart(3, '0')}`;
}

function generateEmployeeId() {
  return `EMP${getRandomNumber(10000, 99999)}`;
}

function generateEmail(firstName, lastName, department) {
  const deptCode = department.toLowerCase().replace(/\s+/g, '');
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${deptCode}.university.edu`;
}

function generatePhone() {
  return `+91-${getRandomNumber(7000000000, 9999999999)}`;
}

function generateQualifications(designation) {
  const qualifications = [];
  
  // Base qualification
  if (designation.includes('Professor') || designation === 'Dean' || designation === 'Head of Department') {
    qualifications.push({
      degree: 'Ph.D',
      field: getRandomElement(['Engineering', 'Science', 'Technology', 'Management']),
      university: getRandomElement(universities),
      year: getRandomNumber(1990, 2010),
      grade: 'First Class',
      specialization: 'Research and Development'
    });
  }
  
  // Master's degree
  qualifications.push({
    degree: getRandomElement(['M.Tech', 'M.E', 'M.Sc', 'MBA']),
    field: getRandomElement(['Engineering', 'Science', 'Technology', 'Management']),
    university: getRandomElement(universities),
    year: getRandomNumber(1985, 2005),
    grade: getRandomElement(['First Class', 'Distinction', 'Second Class']),
    specialization: getRandomElement(['Advanced Studies', 'Research', 'Applied Sciences'])
  });
  
  // Bachelor's degree
  qualifications.push({
    degree: getRandomElement(['B.Tech', 'B.E', 'B.Sc']),
    field: 'Engineering',
    university: getRandomElement(universities),
    year: getRandomNumber(1980, 2000),
    grade: getRandomElement(['First Class', 'Second Class', 'Distinction']),
    specialization: 'Core Engineering'
  });
  
  return qualifications;
}

function generatePublications(designation, experience) {
  const basePublications = {
    journals: 0,
    conferences: 0,
    books: 0,
    chapters: 0,
    patents: 0
  };
  
  if (designation.includes('Professor')) {
    basePublications.journals = getRandomNumber(15, 50);
    basePublications.conferences = getRandomNumber(20, 60);
    basePublications.books = getRandomNumber(1, 5);
    basePublications.chapters = getRandomNumber(3, 15);
    basePublications.patents = getRandomNumber(0, 8);
  } else if (designation === 'Associate Professor') {
    basePublications.journals = getRandomNumber(8, 25);
    basePublications.conferences = getRandomNumber(10, 35);
    basePublications.books = getRandomNumber(0, 3);
    basePublications.chapters = getRandomNumber(1, 8);
    basePublications.patents = getRandomNumber(0, 5);
  } else if (designation === 'Assistant Professor') {
    basePublications.journals = getRandomNumber(3, 15);
    basePublications.conferences = getRandomNumber(5, 20);
    basePublications.books = getRandomNumber(0, 1);
    basePublications.chapters = getRandomNumber(0, 4);
    basePublications.patents = getRandomNumber(0, 2);
  }
  
  return basePublications;
}

async function generateFacultyData() {
  try {
    console.log("🏫 Starting Faculty Data Generation...");
    
    // Connect to database first
    await connectDB();
    
    // Clear existing faculty data
    const deleteResult = await Faculty.deleteMany({});
    console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing faculty records`);
    
    const facultyData = [];
    let facultyIndex = 1;
    
    for (const department of departments) {
      const facultyCount = getRandomNumber(8, 15); // 8-15 faculty per department
      
      for (let i = 0; i < facultyCount; i++) {
        const gender = getRandomElement(genders);
        const firstName = gender === 'Male' ? 
          getRandomElement(firstNamesMale) : 
          getRandomElement(firstNamesFemale);
        const lastName = getRandomElement(lastNames);
        const designation = getRandomElement(designations);
        const joiningDate = generateRandomDate(new Date(2005, 0, 1), new Date(2020, 11, 31));
        const experience = Math.floor((Date.now() - joiningDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        
        const faculty = {
          facultyId: generateFacultyId(department, facultyIndex),
          employeeId: generateEmployeeId(),
          title: designation.includes('Professor') ? 'Dr.' : getRandomElement(titles),
          firstName,
          lastName,
          email: generateEmail(firstName, lastName, department),
          phone: generatePhone(),
          alternatePhone: Math.random() > 0.5 ? generatePhone() : undefined,
          
          dateOfBirth: generateRandomDate(new Date(1960, 0, 1), new Date(1985, 11, 31)),
          gender,
          nationality: 'Indian',
          bloodGroup: getRandomElement(bloodGroups),
          maritalStatus: getRandomElement(maritalStatuses),
          
          address: {
            street: `${getRandomNumber(1, 999)} ${getRandomElement(['MG Road', 'Park Street', 'Mall Road', 'Station Road'])}`,
            city: getRandomElement(cities),
            state: getRandomElement(states),
            pincode: String(getRandomNumber(100000, 999999)),
            country: 'India'
          },
          
          department,
          designation,
          employmentType: Math.random() > 0.1 ? 'Permanent' : getRandomElement(['Contract', 'Visiting']),
          joiningDate,
          experience: {
            total: experience,
            teaching: Math.min(experience, getRandomNumber(5, experience + 2)),
            industry: getRandomNumber(0, Math.floor(experience * 0.3)),
            research: Math.min(experience, getRandomNumber(2, experience))
          },
          
          qualifications: generateQualifications(designation),
          
          researchAreas: researchAreas[department] ? 
            researchAreas[department].slice(0, getRandomNumber(2, 4)) : 
            ['General Research', 'Applied Sciences'],
          
          publications: generatePublications(designation, experience),
          hIndex: designation.includes('Professor') ? getRandomNumber(10, 35) : getRandomNumber(2, 15),
          citationCount: designation.includes('Professor') ? getRandomNumber(200, 1500) : getRandomNumber(20, 400),
          
          subjectsTeaching: [
            `${department.split(' ')[0]} Fundamentals`,
            `Advanced ${department.split(' ')[0]}`,
            `${department.split(' ')[0]} Laboratory`
          ].slice(0, getRandomNumber(2, 3)),
          
          teachingLoad: getRandomNumber(12, 20),
          
          administrativeRoles: Math.random() > 0.7 ? [{
            position: getRandomElement(['Committee Member', 'Coordinator', 'In-charge']),
            department,
            startDate: generateRandomDate(joiningDate, new Date()),
            current: true
          }] : [],
          
          professionalMemberships: [{
            organization: getRandomElement(['IEEE', 'ACM', 'ISTE', 'CSI', 'IEI']),
            membershipType: 'Professional',
            membershipId: `MEM${getRandomNumber(10000, 99999)}`,
            startDate: generateRandomDate(joiningDate, new Date()),
            current: true
          }],
          
          awards: Math.random() > 0.6 ? [{
            title: getRandomElement(['Best Teacher Award', 'Research Excellence Award', 'Innovation Award']),
            organization: 'University',
            year: getRandomNumber(2015, 2023),
            category: 'Academic Excellence'
          }] : [],
          
          studentsGuided: {
            phd: designation.includes('Professor') ? getRandomNumber(3, 15) : getRandomNumber(0, 5),
            mtech: getRandomNumber(5, 25),
            btech: getRandomNumber(20, 100),
            ongoing: getRandomNumber(2, 10),
            completed: getRandomNumber(10, 80)
          },
          
          teachingRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
          researchRating: (Math.random() * 2 + 3).toFixed(1),
          serviceRating: (Math.random() * 2 + 3).toFixed(1),
          
          salary: {
            basic: getRandomNumber(50000, 150000),
            allowances: getRandomNumber(20000, 60000),
            payScale: designation.includes('Professor') ? 'UGC Scale' : 'State Scale'
          },
          
          profiles: {
            googleScholar: `https://scholar.google.com/citations?user=${firstName}${lastName}`,
            researchGate: `https://www.researchgate.net/profile/${firstName}_${lastName}`,
            linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
            orcid: `0000-000${getRandomNumber(1, 9)}-000${getRandomNumber(1, 9)}-000${getRandomNumber(1, 9)}`
          },
          
          isActive: true,
          bio: `Experienced ${designation} in ${department} with ${experience} years of academic and research experience.`,
          officeLocation: `Room ${getRandomNumber(101, 599)}, ${department} Block`,
          officeHours: 'Mon-Fri: 10:00 AM - 5:00 PM',
          
          emergencyContact: {
            name: `${getRandomElement(firstNamesMale.concat(firstNamesFemale))} ${lastName}`,
            relationship: getRandomElement(['Spouse', 'Parent', 'Sibling']),
            phone: generatePhone(),
            email: `emergency.${firstName.toLowerCase()}@gmail.com`
          }
        };
        
        // Calculate total salary
        faculty.salary.total = faculty.salary.basic + faculty.salary.allowances;
        
        facultyData.push(faculty);
        facultyIndex++;
      }
    }
    
    // Insert faculty data
    console.log(`📝 Inserting ${facultyData.length} faculty records...`);
    const insertResult = await Faculty.insertMany(facultyData);
    console.log(`✅ Successfully inserted ${insertResult.length} faculty records`);
    
    // Verify insertion
    const verifyCount = await Faculty.countDocuments();
    console.log(`🔍 Verification: ${verifyCount} faculty records in database`);
    
    console.log("✅ Faculty data generation completed successfully!");
    console.log(`📊 Generated ${facultyData.length} faculty members across ${departments.length} departments`);
    
    // Generate summary statistics
    const stats = {};
    departments.forEach(dept => {
      stats[dept] = facultyData.filter(f => f.department === dept).length;
    });
    
    // console.log("\n📈 Department-wise Faculty Distribution:");
    // Object.entries(stats).forEach(([dept, count]) => {
    //   console.log(`   ${dept}: ${count} faculty members`);
    // });
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error("❌ Error generating faculty data:", error);
    mongoose.disconnect();
  }
}

// Run the generator
generateFacultyData();
