# Student Dashboard API Examples

## 1. GET /api/student/dashboard/:rollNo
**Description:** Get complete student dashboard data including profile, academic info, attendance, and activities.

### Example Request:
```
GET /api/student/dashboard/2024CSE001
```

### Example Response:
```json
{
  "success": true,
  "data": {
    "profile": {
      "rollNumber": "2024CSE001",
      "name": "Aarav Sharma",
      "email": "aarav.sharma001@university.edu",
      "phone": "9876543210",
      "department": "Computer Science and Engineering",
      "year": 1,
      "section": "A",
      "profilePicture": "https://api.dicebear.com/7.x/avataaars/svg?seed=AaravSharma",
      "bloodGroup": "B+"
    },
    "academic": {
      "cgpa": 8.5,
      "currentSemester": 1,
      "semesterGrades": []
    },
    "attendance": {
      "overall": 85,
      "subjects": [
        {
          "subjectCode": "CS101",
          "subjectName": "Programming Fundamentals",
          "totalClasses": 45,
          "attendedClasses": 40,
          "attendancePercentage": 89
        },
        {
          "subjectCode": "MA101",
          "subjectName": "Engineering Mathematics",
          "totalClasses": 50,
          "attendedClasses": 42,
          "attendancePercentage": 84
        }
      ]
    },
    "activities": [
      {
        "type": "competition",
        "title": "Coding Competition 2024",
        "description": "National level coding competition",
        "organization": "TechCorp",
        "startDate": "2024-03-15T00:00:00.000Z",
        "endDate": "2024-03-17T00:00:00.000Z",
        "status": "completed",
        "skills": ["Programming", "Problem Solving"]
      }
    ],
    "address": "123 MG Road, Mumbai, Maharashtra, India - 400001",
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 2. PUT /api/student/:rollNo/cgpa
**Description:** Update student CGPA.

### Example Request:
```
PUT /api/student/2024CSE001/cgpa
Content-Type: application/json

{
  "cgpa": 8.7
}
```

### Example Response:
```json
{
  "success": true,
  "message": "CGPA updated successfully",
  "data": {
    "rollNumber": "2024CSE001",
    "cgpa": 8.7,
    "updatedAt": "2024-01-15T10:45:00.000Z"
  }
}
```

## 3. PUT /api/student/:rollNo/attendance
**Description:** Update subject-wise attendance.

### Example Request:
```
PUT /api/student/2024CSE001/attendance
Content-Type: application/json

{
  "subjectCode": "CS101",
  "subjectName": "Programming Fundamentals",
  "totalClasses": 50,
  "attendedClasses": 45
}
```

### Example Response:
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "rollNumber": "2024CSE001",
    "attendance": [
      {
        "subjectCode": "CS101",
        "subjectName": "Programming Fundamentals",
        "totalClasses": 50,
        "attendedClasses": 45,
        "attendancePercentage": 90
      }
    ],
    "overallAttendancePercentage": 87,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

## 4. GET /api/student/activities/:rollNo
**Description:** Get student activities.

### Example Request:
```
GET /api/student/activities/2024CSE001
```

### Example Response:
```json
{
  "success": true,
  "data": {
    "rollNumber": "2024CSE001",
    "name": "Aarav Sharma",
    "activities": [
      {
        "type": "certification",
        "title": "AWS Cloud Practitioner",
        "description": "Cloud computing certification",
        "organization": "Amazon Web Services",
        "startDate": "2024-02-01T00:00:00.000Z",
        "endDate": "2024-02-15T00:00:00.000Z",
        "status": "completed",
        "certificateUrl": "https://aws.amazon.com/certificate/123",
        "skills": ["Cloud Computing", "AWS"]
      },
      {
        "type": "internship",
        "title": "Software Development Intern",
        "description": "Full-stack development internship",
        "organization": "TechStartup Inc",
        "startDate": "2024-06-01T00:00:00.000Z",
        "endDate": "2024-08-31T00:00:00.000Z",
        "status": "ongoing",
        "skills": ["React", "Node.js", "MongoDB"]
      }
    ],
    "totalActivities": 2
  }
}
```

## 5. POST /api/student/:rollNo/activity
**Description:** Add new activity for student.

### Example Request:
```
POST /api/student/2024CSE001/activity
Content-Type: application/json

{
  "type": "workshop",
  "title": "Machine Learning Workshop",
  "description": "Introduction to ML algorithms",
  "organization": "AI Academy",
  "startDate": "2024-03-01",
  "endDate": "2024-03-03",
  "status": "completed",
  "skills": ["Machine Learning", "Python"]
}
```

### Example Response:
```json
{
  "success": true,
  "message": "Activity added successfully",
  "data": {
    "rollNumber": "2024CSE001",
    "activity": {
      "type": "workshop",
      "title": "Machine Learning Workshop",
      "description": "Introduction to ML algorithms",
      "organization": "AI Academy",
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-03-03T00:00:00.000Z",
      "status": "completed",
      "skills": ["Machine Learning", "Python"]
    },
    "totalActivities": 3
  }
}
```

## Faculty APIs

## 6. GET /api/faculty/students
**Description:** Get all students with pagination and filters (Faculty/Admin only).

### Example Request:
```
GET /api/faculty/students?page=1&limit=10&department=Computer Science and Engineering&year=1
Authorization: Bearer <faculty_jwt_token>
```

### Example Response:
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "rollNumber": "2024CSE001",
        "name": "Aarav Sharma",
        "email": "aarav.sharma001@university.edu",
        "department": "Computer Science and Engineering",
        "year": 1,
        "section": "A",
        "cgpa": 8.5,
        "overallAttendancePercentage": 85
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalStudents": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 7. PUT /api/faculty/student/:rollNo/cgpa
**Description:** Faculty update student CGPA.

### Example Request:
```
PUT /api/faculty/student/2024CSE001/cgpa
Authorization: Bearer <faculty_jwt_token>
Content-Type: application/json

{
  "cgpa": 8.8,
  "remarks": "Excellent performance in semester exams"
}
```

### Example Response:
```json
{
  "success": true,
  "message": "CGPA updated successfully by faculty",
  "data": {
    "rollNumber": "2024CSE001",
    "name": "Aarav Sharma",
    "cgpa": 8.8,
    "updatedBy": "faculty_user_id",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

## 8. GET /api/faculty/analytics/attendance
**Description:** Get attendance analytics (Faculty/Admin only).

### Example Request:
```
GET /api/faculty/analytics/attendance?department=Computer Science and Engineering&threshold=75
Authorization: Bearer <faculty_jwt_token>
```

### Example Response:
```json
{
  "success": true,
  "data": {
    "totalStudents": 120,
    "lowAttendanceCount": 15,
    "averageAttendance": 82.5,
    "threshold": 75,
    "lowAttendanceStudents": [
      {
        "rollNumber": "2024CSE045",
        "name": "Student Name",
        "department": "Computer Science and Engineering",
        "year": 1,
        "section": "B",
        "overallAttendancePercentage": 68
      }
    ]
  }
}
```

## Error Responses

### Student Not Found:
```json
{
  "success": false,
  "message": "Student not found"
}
```

### Validation Error:
```json
{
  "success": false,
  "message": "CGPA must be between 0 and 10"
}
```

### Authorization Error:
```json
{
  "success": false,
  "message": "Access denied. Faculty or admin role required."
}
```

### Server Error:
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

## Frontend Integration Notes

### React Dashboard Component Example:
```javascript
// Fetch student dashboard data
const fetchDashboardData = async (rollNumber) => {
  try {
    const response = await fetch(`/api/student/dashboard/${rollNumber}`);
    const data = await response.json();
    
    if (data.success) {
      setStudentData(data.data);
      setProfile(data.data.profile);
      setAcademic(data.data.academic);
      setAttendance(data.data.attendance);
      setActivities(data.data.activities);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

// Update CGPA
const updateCGPA = async (rollNumber, newCGPA) => {
  try {
    const response = await fetch(`/api/student/${rollNumber}/cgpa`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cgpa: newCGPA })
    });
    
    const data = await response.json();
    if (data.success) {
      // Update UI with new CGPA
      setAcademic(prev => ({ ...prev, cgpa: data.data.cgpa }));
    }
  } catch (error) {
    console.error('Error updating CGPA:', error);
  }
};
```

## Database Indexes for Performance

The Student model includes the following indexes for optimal query performance:
- `rollNumber` (unique)
- `email` (unique)
- `department + year` (compound)
- `cgpa` (descending)
- `overallAttendancePercentage` (ascending)

## Security Considerations

1. **Authentication**: All routes should be protected with JWT authentication
2. **Authorization**: Faculty routes have role-based access control
3. **Input Validation**: All inputs are validated using Mongoose schemas
4. **Rate Limiting**: Consider implementing rate limiting for API endpoints
5. **Data Sanitization**: Input data is sanitized to prevent injection attacks
