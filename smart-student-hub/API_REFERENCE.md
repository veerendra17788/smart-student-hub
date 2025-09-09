# Smart Student Hub - API Reference Guide

## 🔗 Base URL
```
Production: https://api.smartstudenthub.com
Development: http://localhost:5000
```

## 🔐 Authentication

All API requests require authentication using JWT tokens in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow
1. **Register/Login** to get JWT token
2. **Include token** in all subsequent requests
3. **Token expires** in 24 hours (configurable)

---

## 📚 API Endpoints Reference

### 🔑 Authentication APIs

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student", // "student", "faculty", "admin"
  "rollNumber": "CS21001", // Required for students
  "department": "Computer Science"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

---

### 👨‍🎓 Student Management APIs

#### Get Student Dashboard Data
```http
GET /api/student/dashboard/:studentId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "name": "John Doe",
      "rollNumber": "CS21001",
      "department": "Computer Science",
      "cgpa": 8.5,
      "attendance": {
        "percentage": 85.5,
        "totalClasses": 120,
        "attendedClasses": 102
      }
    },
    "recentActivities": [...],
    "upcomingEvents": [...],
    "portfolioStrength": 75
  }
}
```

#### Update Student CGPA
```http
PUT /api/student/update-cgpa/:studentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "cgpa": 8.7,
  "semesterGrades": [
    {
      "semester": 5,
      "subjects": [
        {
          "name": "Data Structures",
          "grade": "A",
          "credits": 4
        }
      ]
    }
  ]
}
```

#### Add Student Activity
```http
POST /api/student/add-activity/:studentId
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Hackathon Participation",
  "description": "Participated in 24-hour coding hackathon",
  "type": "extracurricular",
  "date": "2024-01-15",
  "duration": 24,
  "certificate": <file> // Optional file upload
}
```

---

### 🎯 Activity Management APIs

#### Get Pending Activities
```http
GET /api/activity/pending
Authorization: Bearer <token>
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - department: string (optional)
  - type: string (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "title": "Hackathon Participation",
        "studentName": "John Doe",
        "department": "Computer Science",
        "type": "extracurricular",
        "date": "2024-01-15T00:00:00.000Z",
        "status": "pending",
        "certificates": [...]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50
    }
  }
}
```

#### Approve Activity
```http
PUT /api/activity/approve/:activityId
Authorization: Bearer <token>
Content-Type: application/json

{
  "approverComments": "Great participation in the hackathon",
  "points": 50,
  "skills": ["JavaScript", "React", "Problem Solving"]
}
```

#### Reject Activity
```http
PUT /api/activity/reject/:activityId
Authorization: Bearer <token>
Content-Type: application/json

{
  "rejectionReason": "Certificate not clear, please resubmit",
  "feedback": "Please ensure certificate is properly scanned"
}
```

#### Upload Certificate
```http
POST /api/activity/upload-certificate
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "activityId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "certificate": <file>,
  "description": "Participation certificate"
}
```

---

### 🧠 AI Recommendations APIs

#### Get AI Recommendations
```http
GET /api/ai/recommendations/:studentId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": {
      "skills": [
        {
          "name": "Machine Learning",
          "priority": "high",
          "reason": "Based on your CS background and current trends",
          "resources": [...]
        }
      ],
      "courses": [
        {
          "title": "Complete Machine Learning Course",
          "platform": "Coursera",
          "duration": "6 weeks",
          "rating": 4.8,
          "url": "https://coursera.org/ml-course"
        }
      ],
      "improvements": [
        {
          "area": "Data Structures",
          "currentLevel": "intermediate",
          "targetLevel": "advanced",
          "suggestions": [...]
        }
      ]
    }
  }
}
```

#### Get Student Analytics
```http
GET /api/ai/analytics/:studentId
Authorization: Bearer <token>
```

#### Get Department Comparison
```http
GET /api/ai/department-comparison/:studentId
Authorization: Bearer <token>
```

---

### 📁 Portfolio Management APIs

#### Get Portfolio Data
```http
GET /api/portfolio/data/:userId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "personalInfo": {...},
    "education": [...],
    "experience": [...],
    "projects": [...],
    "skills": {...},
    "certificates": [...],
    "achievements": [...],
    "template": "modern",
    "customization": {...}
  }
}
```

#### Update Portfolio
```http
PUT /api/portfolio/update/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "personalInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "skills": {
    "technical": ["JavaScript", "React", "Node.js"],
    "soft": ["Leadership", "Communication", "Problem Solving"]
  }
}
```

#### Generate Portfolio HTML
```http
GET /api/portfolio/generate/:userId/:template
Authorization: Bearer <token>
Path Parameters:
  - template: "modern" | "classic" | "creative" | "academic"
```

#### Download Portfolio PDF
```http
GET /api/portfolio/pdf/:userId/:template
Authorization: Bearer <token>
Response: Binary PDF file
```

#### Toggle Public Portfolio
```http
POST /api/portfolio/toggle-public/:userId
Authorization: Bearer <token>
```

#### Get Portfolio Analytics
```http
GET /api/portfolio/analytics/:userId
Authorization: Bearer <token>
```

---

### 👨‍🏫 Faculty Management APIs

#### Get Faculty Dashboard Stats
```http
GET /api/faculty/dashboard/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingApprovals": 15,
    "totalStudents": 120,
    "eventsThisMonth": 8,
    "approvalRate": 92.5,
    "departmentStats": {...}
  }
}
```

#### Get Students List
```http
GET /api/faculty/students
Authorization: Bearer <token>
Query Parameters:
  - page: number
  - limit: number
  - department: string
  - year: number
  - search: string
  - sortBy: "name" | "cgpa" | "attendance"
  - sortOrder: "asc" | "desc"
```

#### Bulk Update Students
```http
PUT /api/faculty/bulk-update
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentIds": ["id1", "id2", "id3"],
  "updates": {
    "attendance.percentage": 85,
    "cgpa": 8.5
  }
}
```

#### Get Faculty Analytics
```http
GET /api/faculty/dashboard/analytics
Authorization: Bearer <token>
```

---

### 📅 Event Management APIs

#### Get All Events
```http
GET /api/events
Authorization: Bearer <token>
Query Parameters:
  - type: string (optional)
  - department: string (optional)
  - status: "upcoming" | "ongoing" | "completed"
  - startDate: ISO date string
  - endDate: ISO date string
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tech Workshop on AI",
  "description": "Hands-on workshop on artificial intelligence",
  "type": "workshop",
  "department": "Computer Science",
  "startDate": "2024-02-15T09:00:00.000Z",
  "endDate": "2024-02-15T17:00:00.000Z",
  "venue": "Auditorium A",
  "maxParticipants": 100
}
```

#### Update Event
```http
PUT /api/events/:eventId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Event Title",
  "maxParticipants": 150
}
```

#### Register for Event
```http
POST /api/events/:eventId/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

#### Delete Event
```http
DELETE /api/events/:eventId
Authorization: Bearer <token>
```

---

### 📆 Academic Calendar APIs

#### Get Calendar Events
```http
GET /api/academic-calendar
Authorization: Bearer <token>
Query Parameters:
  - startDate: ISO date string
  - endDate: ISO date string
  - type: string
  - department: string
  - year: number
  - semester: number
```

#### Create Calendar Event
```http
POST /api/academic-calendar
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mid-term Examinations",
  "description": "Mid-semester examinations for all departments",
  "type": "exam",
  "startDate": "2024-03-15T09:00:00.000Z",
  "endDate": "2024-03-25T17:00:00.000Z",
  "department": "All",
  "year": 2,
  "semester": 4,
  "priority": "high"
}
```

#### Update Calendar Event
```http
PUT /api/academic-calendar/:eventId
Authorization: Bearer <token>
```

#### Delete Calendar Event
```http
DELETE /api/academic-calendar/:eventId
Authorization: Bearer <token>
```

---

## 🔧 Blockchain & IPFS APIs

#### Verify Certificate on Blockchain
```http
GET /api/activity/blockchain-verify/:hash
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "transactionHash": "0x1234567890abcdef...",
    "blockNumber": 12345678,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "certificateData": {...}
  }
}
```

#### Store Certificate on IPFS
```http
POST /api/activity/ipfs-store
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "certificate": <file>,
  "metadata": {
    "studentId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "activityId": "64f8a1b2c3d4e5f6a7b8c9d1"
  }
}
```

---

## 📊 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email format is invalid"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1234567890"
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR` (401) - Invalid or missing token
- `AUTHORIZATION_ERROR` (403) - Insufficient permissions
- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Resource not found
- `DUPLICATE_ERROR` (409) - Resource already exists
- `SERVER_ERROR` (500) - Internal server error
- `RATE_LIMIT_ERROR` (429) - Too many requests

---

## 🚀 Rate Limiting

### Default Limits
- **Authentication**: 5 requests per minute
- **General APIs**: 100 requests per minute
- **File Uploads**: 10 requests per minute
- **AI APIs**: 20 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

---

## 📝 Request/Response Examples

### Complete Student Registration Flow
```javascript
// 1. Register Student
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123',
    role: 'student',
    rollNumber: 'CS21001',
    department: 'Computer Science'
  })
});

const { token } = await registerResponse.json();

// 2. Get Dashboard Data
const dashboardResponse = await fetch('/api/student/dashboard/64f8a1b2c3d4e5f6a7b8c9d0', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 3. Add Activity
const activityResponse = await fetch('/api/student/add-activity/64f8a1b2c3d4e5f6a7b8c9d0', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData // Contains activity details and certificate
});
```

### Portfolio Generation Flow
```javascript
// 1. Get Portfolio Data
const portfolioData = await fetch('/api/portfolio/data/64f8a1b2c3d4e5f6a7b8c9d0', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 2. Update Portfolio
await fetch('/api/portfolio/update/64f8a1b2c3d4e5f6a7b8c9d0', {
  method: 'PUT',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updatedPortfolioData)
});

// 3. Generate PDF
const pdfResponse = await fetch('/api/portfolio/pdf/64f8a1b2c3d4e5f6a7b8c9d0/modern', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const pdfBlob = await pdfResponse.blob();
```

---

## 🔍 Testing the APIs

### Using cURL
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student",
    "rollNumber": "CS21001"
  }'

# Get dashboard data
curl -X GET http://localhost:5000/api/student/dashboard/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman
1. Import the API collection (available in `/docs/postman/`)
2. Set environment variables for base URL and token
3. Run the collection tests

### Using JavaScript/Node.js
```javascript
const apiClient = {
  baseURL: 'http://localhost:5000',
  token: null,

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    return response.json();
  },

  async login(email, password) {
    const result = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (result.success) {
      this.token = result.token;
    }
    
    return result;
  }
};
```

---

## 📋 API Versioning

### Current Version: v1
All endpoints are prefixed with `/api/` (implicit v1)

### Future Versioning
- v2 endpoints will use `/api/v2/`
- Backward compatibility maintained for 12 months
- Deprecation notices provided 6 months in advance

---

## 🔒 Security Best Practices

### API Security Checklist
- ✅ Always use HTTPS in production
- ✅ Validate all input data
- ✅ Implement proper authentication
- ✅ Use role-based authorization
- ✅ Sanitize file uploads
- ✅ Implement rate limiting
- ✅ Log all API requests
- ✅ Monitor for suspicious activity

### Token Management
- Store tokens securely (httpOnly cookies recommended)
- Implement token refresh mechanism
- Use short-lived access tokens (15 minutes)
- Implement proper logout (token blacklisting)

---

**API Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Production Ready
