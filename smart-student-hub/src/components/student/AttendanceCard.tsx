import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { SubjectAttendance } from "@/services/studentApi";

interface AttendanceCardProps {
  subjects: SubjectAttendance[];
  overallPercentage: number;
  loading?: boolean;
}

const AttendanceCard = ({ subjects, overallPercentage, loading }: AttendanceCardProps) => {
  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { color: 'text-green-600', icon: CheckCircle, status: 'Excellent' };
    if (percentage >= 80) return { color: 'text-blue-600', icon: CheckCircle, status: 'Good' };
    if (percentage >= 75) return { color: 'text-yellow-600', icon: Clock, status: 'Warning' };
    return { color: 'text-red-600', icon: AlertTriangle, status: 'Critical' };
  };

  const overallStatus = getAttendanceStatus(overallPercentage);

  if (loading) {
    return (
      <Card className="bg-gradient-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Attendance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Attendance Details
          </div>
          <Badge 
            variant="outline" 
            className={`${overallStatus.color} border-current`}
          >
            <overallStatus.icon className="h-3 w-3 mr-1" />
            {overallStatus.status}
          </Badge>
        </CardTitle>
        <CardDescription>
          Overall attendance: {overallPercentage}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Overall Attendance</span>
              <span className={overallStatus.color}>{overallPercentage}%</span>
            </div>
            <Progress value={overallPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {overallPercentage >= 75 
                ? "✓ Meeting minimum attendance requirement" 
                : "⚠ Below minimum attendance requirement (75%)"}
            </p>
          </div>

          {/* Subject-wise Attendance */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Subject-wise Breakdown</h4>
            {subjects.length > 0 ? (
              subjects.map((subject, index) => {
                const status = getAttendanceStatus(subject.attendancePercentage);
                return (
                  <div key={index} className="space-y-2 p-3 rounded-lg bg-white/30 border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{subject.subjectName}</h5>
                        <p className="text-xs text-muted-foreground">{subject.subjectCode}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${status.color}`}>
                          {subject.attendancePercentage}%
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {subject.attendedClasses}/{subject.totalClasses}
                        </p>
                      </div>
                    </div>
                    <Progress value={subject.attendancePercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Classes attended: {subject.attendedClasses}</span>
                      <span>Total classes: {subject.totalClasses}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No attendance data available</p>
              </div>
            )}
          </div>

          {/* Attendance Tips */}
          {overallPercentage < 85 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Attendance Reminder</p>
                  <p className="text-yellow-700 mt-1">
                    {overallPercentage < 75 
                      ? "Your attendance is below the minimum requirement. Please attend classes regularly to avoid academic penalties."
                      : "Consider improving your attendance to maintain a good academic standing."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCard;
