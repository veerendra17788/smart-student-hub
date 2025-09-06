const { faker } = require("@faker-js/faker");
const fs = require("fs");
const path = require("path");

const outputDir = path.resolve("student_academics_data");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Subjects per department
const subjectsByDept = {
  CSE: ["DSA", "DBMS", "OS", "CN", "AI", "ML"],
  ECE: ["Signals", "Networks", "VLSI", "DSP", "Microwave"],
  EEE: ["Circuits", "Machines", "Power Systems", "Control Systems"],
  MECH: ["Thermodynamics", "Fluid Mechanics", "Mechanics of Materials", "CAD"],
  CIVIL: ["Structures", "Surveying", "Hydraulics", "Concrete Technology"],
  IT: ["Programming", "Web Tech", "DBMS", "Cloud Computing", "AI"],
};

function generateAttendance(subjects) {
  return subjects.map((subject) => {
    const total = faker.number.int({ min: 30, max: 60 });
    const attended = faker.number.int({ min: 15, max: total });
    return {
      subject,
      totalClasses: total,
      attendedClasses: attended,
      attendancePercent: ((attended / total) * 100).toFixed(2),
    };
  });
}

function generateStudent(id) {
  const dept = faker.helpers.arrayElement(Object.keys(subjectsByDept));
  const subjects = subjectsByDept[dept];
  return {
    id,
    name: faker.person.fullName(),
    rollNo: `ROLL${1000 + id}`,
    email: faker.internet.email(),
    phone: faker.phone.number("9#########"),
    gender: faker.helpers.arrayElement(["Male", "Female", "Other"]),
    age: faker.number.int({ min: 18, max: 25 }),
    department: dept,
    year: faker.number.int({ min: 1, max: 4 }),
    section: faker.helpers.arrayElement(["A", "B", "C", "D"]),
    cgpa: (faker.number.float({ min: 5, max: 10, precision: 0.01 })).toFixed(2),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: "India",
    attendance: generateAttendance(subjects),
  };
}

// Generate 700 students
const students = [];
for (let i = 1; i <= 700; i++) {
  students.push(generateStudent(i));
}

// Save JSON
const jsonPath = path.join(outputDir, "students.json");
fs.writeFileSync(jsonPath, JSON.stringify(students, null, 2));
console.log(`✅ Generated ${students.length} students with academics + attendance in ${jsonPath}`);
