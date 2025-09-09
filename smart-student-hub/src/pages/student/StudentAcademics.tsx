import AppLayout from "@/components/layout/AppLayout";
import AcademicCard from "@/components/student/AcademicCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  BookOpen, 
  Award,
  TrendingUp,
  Target,
  Calendar
} from "lucide-react";
import { 
  studentApi, 
  AcademicInfo,
  SemesterGrade,
  mockDashboardData 
} from "@/services/studentApi";

const StudentAcademics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [academicData, setAcademicData] = useState<AcademicInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAcademicData = async () => {
    if (!user?.rollNumber) {
      setAcademicData(mockDashboardData.academic);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await studentApi.getDashboardData(user.rollNumber);
      
      if (response.success && response.data) {
        setAcademicData(response.data.academic);
      } else {
        throw new Error(response.error || 'Failed to fetch academic data');
      }
    } catch (error) {
      console.error('Error fetching academic data:', error);
      toast({
        title: "Error",
        description: "Failed to load academic data. Using sample data.",
        variant: "destructive"
      });
      setAcademicData(mockDashboardData.academic);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, [user]);

  const getAcademicStats = () => {
    if (!academicData?.semesterGrades.length) return null;

    const completedSemesters = academicData.semesterGrades.length;
    const totalCredits = academicData.semesterGrades.reduce((sum, semester) => 
      sum + semester.subjects.reduce((subSum, subject) => subSum + subject.credits, 0), 0
    );
    const averageSGPA = academicData.semesterGrades.reduce((sum, semester) => sum + semester.sgpa, 0) / completedSemesters;
    const bestSGPA = Math.max(...academicData.semesterGrades.map(s => s.sgpa));

    return {
      completedSemesters,
      totalCredits,
      averageSGPA,
      bestSGPA
    };
  };

  const stats = getAcademicStats();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Academic Performance</h1>
            <p className="text-muted-foreground">
              Track your academic progress and semester-wise performance
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/student/academic-calendar')}>
            <Calendar className="mr-2 h-4 w-4" />
            Academic Calendar
          </Button>
        </div>

        {/* Stats Grid */}
        {academicData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current CGPA</p>
                    <p className="text-3xl font-bold">{academicData.cgpa.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">out of 10.0</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Semester</p>
                    <p className="text-3xl font-bold">{academicData.currentSemester}</p>
                    <p className="text-sm text-muted-foreground">active</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {stats && (
              <>
                <Card className="bg-gradient-card border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Credits</p>
                        <p className="text-3xl font-bold">{stats.totalCredits}</p>
                        <p className="text-sm text-muted-foreground">earned</p>
                      </div>
                      <Award className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Best SGPA</p>
                        <p className="text-3xl font-bold">{stats.bestSGPA.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">achieved</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Academic Performance Card */}
        {academicData && (
          <AcademicCard 
            academic={academicData}
            loading={loading}
          />
        )}

        {/* Semester Details */}
        {academicData?.semesterGrades && academicData.semesterGrades.length > 0 && (
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Semester-wise Performance
              </CardTitle>
              <CardDescription>Detailed breakdown of your academic journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {academicData.semesterGrades.map((semester, index) => (
                  <div key={semester.semester} className="p-4 rounded-lg bg-white/30 border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">Semester {semester.semester}</h4>
                        <p className="text-sm text-muted-foreground">
                          {semester.subjects.length} subjects • {semester.subjects.reduce((sum, s) => sum + s.credits, 0)} credits
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{semester.sgpa.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">SGPA</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {semester.subjects.map((subject, subIndex) => (
                        <div key={subIndex} className="p-3 rounded bg-white/50 border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h6 className="font-medium text-sm">{subject.subjectName}</h6>
                              <p className="text-xs text-muted-foreground">{subject.subjectCode}</p>
                            </div>
                            <div className="text-right ml-2">
                              <Badge variant="outline" className="text-xs">
                                {subject.grade}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {subject.credits} cr
                              </p>
                            </div>
                          </div>
                          {subject.marks && (
                            <div className="mt-2">
                              <Progress value={subject.marks} className="h-1" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {subject.marks}%
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Academic Goals & Tips */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Academic Goals
              </CardTitle>
              <CardDescription>Set and track your academic targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-white/30 border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Target CGPA</span>
                    <span className="text-lg font-bold text-primary">8.5</span>
                  </div>
                  <Progress value={academicData ? (academicData.cgpa / 8.5) * 100 : 0} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {academicData?.cgpa.toFixed(2) || '0.00'} / 8.5
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-white/30 border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Graduation Target</span>
                    <span className="text-lg font-bold text-green-600">2027</span>
                  </div>
                  <Progress value={academicData ? (academicData.currentSemester / 8) * 100 : 0} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Semester {academicData?.currentSemester || 1} of 8
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Academic Tips
              </CardTitle>
              <CardDescription>Strategies for academic success</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Consistent Study Schedule</p>
                    <p className="text-xs text-muted-foreground">
                      Maintain regular study hours and avoid last-minute cramming
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Active Participation</p>
                    <p className="text-xs text-muted-foreground">
                      Engage in class discussions and ask questions when in doubt
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Seek Help Early</p>
                    <p className="text-xs text-muted-foreground">
                      Don't hesitate to approach faculty or peers for academic support
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Regular Assessment</p>
                    <p className="text-xs text-muted-foreground">
                      Take practice tests and review your performance regularly
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentAcademics;
