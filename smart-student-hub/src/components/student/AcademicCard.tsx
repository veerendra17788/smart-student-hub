import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, TrendingUp, Award, BookOpen } from "lucide-react";
import { AcademicInfo, SemesterGrade, calculateSGPA } from "@/services/studentApi";

interface AcademicCardProps {
  academic: AcademicInfo;
  loading?: boolean;
}

const AcademicCard = ({ academic, loading }: AcademicCardProps) => {
  const getCGPAGrade = (cgpa: number) => {
    if (cgpa >= 9.0) return { grade: 'O', color: 'text-green-600', bg: 'bg-green-100' };
    if (cgpa >= 8.0) return { grade: 'A+', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (cgpa >= 7.0) return { grade: 'A', color: 'text-indigo-600', bg: 'bg-indigo-100' };
    if (cgpa >= 6.0) return { grade: 'B+', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (cgpa >= 5.0) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'C', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getCGPAGrade(academic.cgpa);

  if (loading) {
    return (
      <Card className="bg-gradient-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Academic Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="h-12 bg-gray-200 rounded animate-pulse mx-auto w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
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
            <GraduationCap className="mr-2 h-5 w-5" />
            Academic Performance
          </div>
          <Badge className={`${gradeInfo.bg} ${gradeInfo.color} border-current`}>
            Grade {gradeInfo.grade}
          </Badge>
        </CardTitle>
        <CardDescription>
          Current semester: {academic.currentSemester}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* CGPA Display */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className={`text-4xl font-bold ${gradeInfo.color}`}>
                {academic.cgpa.toFixed(2)}
              </div>
              <div className="text-lg text-muted-foreground">/10.0</div>
            </div>
            <p className="text-sm text-muted-foreground">Cumulative Grade Point Average</p>
            
            {/* CGPA Progress Bar */}
            <div className="mt-3">
              <Progress value={academic.cgpa * 10} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.0</span>
                <span>5.0</span>
                <span>10.0</span>
              </div>
            </div>
          </div>

          {/* Semester Grades */}
          {academic.semesterGrades && academic.semesterGrades.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Semester Performance</h4>
                <Badge variant="outline">
                  {academic.semesterGrades.length} semester{academic.semesterGrades.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {academic.semesterGrades.slice(-4).reverse().map((semester, index) => {
                  const semesterGrade = getCGPAGrade(semester.sgpa);
                  return (
                    <div key={semester.semester} className="p-3 rounded-lg bg-white/30 border">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            Semester {semester.semester}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={`${semesterGrade.bg} ${semesterGrade.color} border-current text-xs`}
                          >
                            {semesterGrade.grade}
                          </Badge>
                          <span className={`font-bold ${semesterGrade.color}`}>
                            {semester.sgpa.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{semester.subjects.length} subjects</span>
                        <span>
                          Credits: {semester.subjects.reduce((sum, subject) => sum + subject.credits, 0)}
                        </span>
                      </div>
                      
                      <Progress value={semester.sgpa * 10} className="h-1 mt-2" />
                    </div>
                  );
                })}
              </div>

              {academic.semesterGrades.length > 4 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing last 4 semesters • {academic.semesterGrades.length - 4} more available
                </p>
              )}
            </div>
          )}

          {/* Academic Insights */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Performance Insights</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/30 border text-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-600">
                  {academic.semesterGrades.length > 1 ? (
                    academic.semesterGrades[academic.semesterGrades.length - 1].sgpa > 
                    academic.semesterGrades[academic.semesterGrades.length - 2].sgpa ? '+' : ''
                  ) : ''}
                  {academic.semesterGrades.length > 0 ? academic.semesterGrades[academic.semesterGrades.length - 1].sgpa.toFixed(2) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Last SGPA</p>
              </div>
              
              <div className="p-3 rounded-lg bg-white/30 border text-center">
                <Award className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-purple-600">
                  {academic.semesterGrades.length > 0 ? 
                    Math.max(...academic.semesterGrades.map(s => s.sgpa)).toFixed(2) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Best SGPA</p>
              </div>
            </div>
          </div>

          {/* Performance Tips */}
          {academic.cgpa < 7.0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Academic Improvement Tips</p>
                  <p className="text-blue-700 mt-1">
                    Focus on consistent study habits and seek help from faculty when needed. 
                    Consider joining study groups and utilizing academic resources.
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

export default AcademicCard;
