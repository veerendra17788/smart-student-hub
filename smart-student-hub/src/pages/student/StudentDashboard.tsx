import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Trophy, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2,
  User,
  GraduationCap,
  BookOpen,
  BarChart3,
  Target,
  MapPin
} from "lucide-react";
import { 
  studentApi, 
  DashboardData, 
  calculateAttendanceStatus, 
  formatDate,
  mockDashboardData 
} from "@/services/studentApi";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    if (!user?.rollNumber) {
      // Use mock data for development if no roll number
      setDashboardData(mockDashboardData);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await studentApi.getDashboardData(user.rollNumber);
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Using sample data.",
        variant: "destructive"
      });
      // Fallback to mock data
      setDashboardData(mockDashboardData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Create stats array from fetched data
  const stats = dashboardData ? [
    { 
      title: "CGPA", 
      value: dashboardData.academic.cgpa.toFixed(2), 
      icon: GraduationCap, 
      color: "text-primary",
      description: "Current CGPA"
    },
    { 
      title: "Attendance", 
      value: `${dashboardData.attendance.overall}%`, 
      icon: CheckCircle, 
      color: dashboardData.attendance.overall >= 75 ? "text-green-600" : "text-red-600",
      description: "Overall attendance"
    },
    { 
      title: "Activities", 
      value: dashboardData.activities.length.toString(), 
      icon: Trophy, 
      color: "text-blue-600",
      description: "Total activities"
    },
    { 
      title: "Semester", 
      value: dashboardData.academic.currentSemester.toString(), 
      icon: BookOpen, 
      color: "text-purple-600",
      description: "Current semester"
    },
  ] : [];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-muted-foreground">
              {dashboardData ? `Welcome back, ${dashboardData.profile.name}!` : 'Welcome back!'}
            </p>
            {dashboardData && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-1" />
                {dashboardData.profile.rollNumber} • {dashboardData.profile.department}
                <MapPin className="h-4 w-4 ml-3 mr-1" />
                Year {dashboardData.profile.year}, Section {dashboardData.profile.section}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/student/portfolio">
                <FileText className="mr-2 h-4 w-4" />
                Portfolio
              </Link>
            </Button>
            <Button asChild>
              <Link to="/student/activities">
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat) => (
              <Card key={stat.title} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.description}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-lg font-semibold mt-1">{stat.title}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>Your latest activities and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/50 border">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData?.activities?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.activities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/50 border hover:bg-white/70 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {activity.organization && `${activity.organization} • `}
                            {activity.startDate && formatDate(activity.startDate)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {activity.type}
                            {activity.skills && activity.skills.length > 0 && (
                              <span className="ml-2">
                                Skills: {activity.skills.slice(0, 2).join(', ')}
                                {activity.skills.length > 2 && ` +${activity.skills.length - 2} more`}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusBadgeClass(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first activity to track your progress.
                    </p>
                    <Button asChild>
                      <Link to="/student/activities">Add Activity</Link>
                    </Button>
                  </div>
                )}
                {dashboardData?.activities?.length > 0 && (
                  <div className="mt-4">
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/student/activities">View All Activities</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Attendance Card */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Attendance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ) : dashboardData?.attendance?.subjects?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Overall Attendance</span>
                        <span className={`font-bold ${getAttendanceColor(dashboardData.attendance.overall)}`}>
                          {dashboardData.attendance.overall}%
                        </span>
                      </div>
                      <Progress 
                        value={dashboardData.attendance.overall} 
                        className="h-3" 
                      />
                    </div>
                    {dashboardData.attendance.subjects.slice(0, 3).map((subject, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="truncate">{subject.subjectName}</span>
                          <span className={`font-medium ${getAttendanceColor(subject.attendancePercentage)}`}>
                            {subject.attendancePercentage}%
                          </span>
                        </div>
                        <Progress 
                          value={subject.attendancePercentage} 
                          className="h-2" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {subject.attendedClasses}/{subject.totalClasses} classes
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No attendance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Performance */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Academic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                ) : dashboardData ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {dashboardData.academic.cgpa.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">Current CGPA</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Year</span>
                        <span className="font-medium">{dashboardData.profile.year}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Semester</span>
                        <span className="font-medium">{dashboardData.academic.currentSemester}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Department</span>
                        <span className="font-medium text-xs">{dashboardData.profile.department}</span>
                      </div>
                    </div>

                    {dashboardData.academic.semesterGrades.length > 0 && (
                      <div className="mt-4">
                        <h6 className="text-sm font-medium mb-2">Recent Semester</h6>
                        <div className="bg-white/50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Semester {dashboardData.academic.semesterGrades[dashboardData.academic.semesterGrades.length - 1].semester}</span>
                            <span className="font-bold text-primary">
                              {dashboardData.academic.semesterGrades[dashboardData.academic.semesterGrades.length - 1].sgpa.toFixed(2)} SGPA
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No academic data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-primary text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" asChild className="w-full">
                  <Link to="/student/portfolio">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Portfolio
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full border-white/30 text-black hover:bg-grey/10">
                  <Link to="/student/recommendations">
                    <Target className="mr-2 h-4 w-4" />
                    AI Recommendations
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;