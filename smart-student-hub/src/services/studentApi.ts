// Student Dashboard API Service
const API_BASE_URL = 'http://localhost:5000/api';

// Types for TypeScript
export interface StudentProfile {
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: number;
  section: string;
  profilePicture?: string;
  bloodGroup?: string;
}

export interface AcademicInfo {
  cgpa: number;
  currentSemester: number;
  semesterGrades: SemesterGrade[];
}

export interface SemesterGrade {
  semester: number;
  subjects: Subject[];
  sgpa: number;
}

export interface Subject {
  subjectCode: string;
  subjectName: string;
  grade: string;
  credits: number;
  marks?: number;
}

export interface AttendanceInfo {
  overall: number;
  subjects: SubjectAttendance[];
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
}

export interface Activity {
  type: 'competition' | 'certification' | 'internship' | 'project' | 'workshop' | 'seminar';
  title: string;
  description?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  status: 'completed' | 'ongoing' | 'planned';
  certificateUrl?: string;
  skills?: string[];
}

export interface DashboardData {
  profile: StudentProfile;
  academic: AcademicInfo;
  attendance: AttendanceInfo;
  activities: Activity[];
  address: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Service Class
class StudentApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Get complete dashboard data
  async getDashboardData(rollNumber: string): Promise<ApiResponse<DashboardData>> {
    return this.makeRequest<DashboardData>(`/student/dashboard/${rollNumber}`);
  }

  // Get student profile
  async getProfile(rollNumber: string): Promise<ApiResponse<StudentProfile>> {
    return this.makeRequest<StudentProfile>(`/student/profile/${rollNumber}`);
  }

  // Update student profile
  async updateProfile(rollNumber: string, profileData: Partial<StudentProfile>): Promise<ApiResponse<StudentProfile>> {
    return this.makeRequest<StudentProfile>(`/student/${rollNumber}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Update CGPA
  async updateCGPA(rollNumber: string, cgpa: number): Promise<ApiResponse<{ rollNumber: string; cgpa: number; updatedAt: string }>> {
    return this.makeRequest(`/student/${rollNumber}/cgpa`, {
      method: 'PUT',
      body: JSON.stringify({ cgpa }),
    });
  }

  // Update attendance
  async updateAttendance(
    rollNumber: string,
    attendanceData: {
      subjectCode: string;
      subjectName: string;
      totalClasses: number;
      attendedClasses: number;
    }
  ): Promise<ApiResponse<{ rollNumber: string; attendance: SubjectAttendance[]; overallAttendancePercentage: number; updatedAt: string }>> {
    return this.makeRequest(`/student/${rollNumber}/attendance`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    });
  }

  // Get student activities
  async getActivities(rollNumber: string): Promise<ApiResponse<{ rollNumber: string; name: string; activities: Activity[]; totalActivities: number }>> {
    return this.makeRequest(`/student/activities/${rollNumber}`);
  }

  // Add new activity
  async addActivity(rollNumber: string, activityData: Partial<Activity>): Promise<ApiResponse<{ rollNumber: string; activity: Activity; totalActivities: number }>> {
    return this.makeRequest(`/student/${rollNumber}/activity`, {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }
}

// Export singleton instance
export const studentApi = new StudentApiService();

// Helper functions for data processing
export const calculateAttendanceStatus = (percentage: number): 'excellent' | 'good' | 'warning' | 'critical' => {
  if (percentage >= 90) return 'excellent';
  if (percentage >= 80) return 'good';
  if (percentage >= 75) return 'warning';
  return 'critical';
};

export const getGradePoints = (grade: string): number => {
  const gradeMap: { [key: string]: number } = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0,
    'AB': 0,
  };
  return gradeMap[grade] || 0;
};

export const calculateSGPA = (subjects: Subject[]): number => {
  if (!subjects.length) return 0;
  
  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
  const totalGradePoints = subjects.reduce((sum, subject) => 
    sum + (getGradePoints(subject.grade) * subject.credits), 0
  );
  
  return totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Mock data for development/testing
export const mockDashboardData: DashboardData = {
  profile: {
    rollNumber: "2024CSE001",
    name: "Aarav Sharma",
    email: "aarav.sharma001@university.edu",
    phone: "9876543210",
    department: "Computer Science and Engineering",
    year: 1,
    section: "A",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=AaravSharma",
    bloodGroup: "B+"
  },
  academic: {
    cgpa: 8.5,
    currentSemester: 1,
    semesterGrades: []
  },
  attendance: {
    overall: 85,
    subjects: [
      {
        subjectCode: "CS101",
        subjectName: "Programming Fundamentals",
        totalClasses: 45,
        attendedClasses: 40,
        attendancePercentage: 89
      },
      {
        subjectCode: "MA101",
        subjectName: "Engineering Mathematics",
        totalClasses: 50,
        attendedClasses: 42,
        attendancePercentage: 84
      }
    ]
  },
  activities: [
    {
      type: "competition",
      title: "Coding Competition 2024",
      description: "National level coding competition",
      organization: "TechCorp",
      startDate: "2024-03-15T00:00:00.000Z",
      endDate: "2024-03-17T00:00:00.000Z",
      status: "completed",
      skills: ["Programming", "Problem Solving"]
    }
  ],
  address: "123 MG Road, Mumbai, Maharashtra, India - 400001",
  lastLogin: "2024-01-15T10:30:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
};
