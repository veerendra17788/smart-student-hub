import AppLayout from "@/components/layout/AppLayout";
import AttendanceCard from "@/components/student/AttendanceCard";
import AttendanceCalendarModal from "@/components/student/AttendanceCalendarModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, 
  Calendar, 
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { 
  studentApi, 
  DashboardData, 
  SubjectAttendance,
  mockDashboardData 
} from "@/services/studentApi";

const StudentAttendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendanceData, setAttendanceData] = useState<{
    overall: number;
    subjects: SubjectAttendance[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const fetchAttendanceData = async () => {
    if (!user?.rollNumber) {
      setAttendanceData(mockDashboardData.attendance);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await studentApi.getDashboardData(user.rollNumber);
      
      if (response.success && response.data) {
        setAttendanceData(response.data.attendance);
      } else {
        throw new Error(response.error || 'Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data. Using sample data.",
        variant: "destructive"
      });
      setAttendanceData(mockDashboardData.attendance);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [user]);

  const getAttendanceStats = () => {
    if (!attendanceData?.subjects.length) return null;

    const totalClasses = attendanceData.subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
    const totalAttended = attendanceData.subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0);
    const subjectsAbove75 = attendanceData.subjects.filter(s => s.attendancePercentage >= 75).length;
    const subjectsBelow75 = attendanceData.subjects.length - subjectsAbove75;

    return {
      totalClasses,
      totalAttended,
      subjectsAbove75,
      subjectsBelow75,
      averageAttendance: attendanceData.overall
    };
  };

  const stats = getAttendanceStats();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Attendance Overview</h1>
            <p className="text-muted-foreground">
              Track your class attendance and maintain academic requirements
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setIsCalendarModalOpen(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Attendance</p>
                    <p className="text-3xl font-bold">{stats.averageAttendance}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Classes Attended</p>
                    <p className="text-3xl font-bold">{stats.totalAttended}</p>
                    <p className="text-sm text-muted-foreground">of {stats.totalClasses}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Above 75%</p>
                    <p className="text-3xl font-bold">{stats.subjectsAbove75}</p>
                    <p className="text-sm text-muted-foreground">subjects</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Below 75%</p>
                    <p className="text-3xl font-bold">{stats.subjectsBelow75}</p>
                    <p className="text-sm text-muted-foreground">subjects</p>
                  </div>
                  <AlertTriangle className={`h-8 w-8 ${stats.subjectsBelow75 > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Attendance Card */}
        {attendanceData && (
          <AttendanceCard 
            subjects={attendanceData.subjects}
            overallPercentage={attendanceData.overall}
            loading={loading}
          />
        )}

        {/* Additional Information */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Attendance Requirements
              </CardTitle>
              <CardDescription>University attendance policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/30 border">
                  <span className="font-medium">Minimum Required</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">75%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/30 border">
                  <span className="font-medium">Good Standing</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">80%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/30 border">
                  <span className="font-medium">Excellent</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">90%</Badge>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Students with less than 75% attendance may not be eligible 
                  to appear for semester examinations without prior approval from the academic office.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Improvement Tips
              </CardTitle>
              <CardDescription>How to maintain good attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Plan Your Schedule</p>
                    <p className="text-xs text-muted-foreground">
                      Keep track of class timings and avoid scheduling conflicts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Communicate Early</p>
                    <p className="text-xs text-muted-foreground">
                      Inform faculty in advance if you need to miss classes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Stay Organized</p>
                    <p className="text-xs text-muted-foreground">
                      Use calendar apps and set reminders for important classes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Prioritize Health</p>
                    <p className="text-xs text-muted-foreground">
                      Maintain good health to avoid missing classes due to illness
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Modal */}
        {attendanceData && (
          <AttendanceCalendarModal
            isOpen={isCalendarModalOpen}
            onClose={() => setIsCalendarModalOpen(false)}
            subjects={attendanceData.subjects}
            rollNumber={user?.rollNumber || ""}
            studentName={user?.name || "Student"}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default StudentAttendance;
