import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Target, 
  Award, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  BarChart3,
  Lightbulb,
  Star,
  Clock,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';

interface SkillRecommendation {
  newSkills: string[];
  existingSkills: string[];
  skillGaps: number;
}

interface CourseRecommendation {
  title: string;
  platform: string;
  provider: string;
  duration: string;
  level: string;
  relevance?: string;
  skills?: string[];
}

interface WeakSubject {
  subject: string;
  averageGrade: number;
  improvement: string;
}

interface ImprovementSuggestion {
  area: string;
  priority: string;
  suggestion: string;
  actionItems: string[];
}

interface ActivityRecommendation {
  type: string;
  recommendation: string;
  priority: string;
}

interface CareerGuidance {
  level: string;
  focus: string;
  nextSteps: string[];
}

interface StudentInfo {
  name: string;
  department: string;
  year: number;
  cgpa: number;
  attendancePercentage: number;
  performanceLevel: string;
}

interface RecommendationData {
  studentInfo: StudentInfo;
  skillRecommendations: SkillRecommendation;
  courseRecommendations: CourseRecommendation[];
  weakSubjects: WeakSubject[];
  improvementSuggestions: ImprovementSuggestion[];
  activityRecommendations: ActivityRecommendation[];
  careerGuidance: CareerGuidance;
  geminiInsights?: {
    courseReasoning: string;
    skillGuidance: string;
  };
}

interface Analytics {
  skillProgression: Array<{
    month: string;
    newSkills: string[];
    skillCount: number;
  }>;
  performanceTrends: Array<{
    semester: number;
    sgpa: number;
    subjects: number;
    averageMarks: number;
  }>;
  activityDistribution: Record<string, number>;
  totalActivities: number;
  averageCredits: number;
}

interface DepartmentComparison {
  studentPerformance: {
    cgpa: number;
    attendance: number;
    cgpaPercentile: number;
    attendancePercentile: number;
  };
  departmentStats: {
    averageCGPA: number;
    averageAttendance: number;
    totalStudents: number;
  };
  comparison: {
    cgpaStatus: string;
    attendanceStatus: string;
  };
}

const AIRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [comparison, setComparison] = useState<DepartmentComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
    fetchAnalytics();
    fetchComparison();
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const studentId = user?.rollNumber || user?.id || 'demo-student';
      console.log('Fetching recommendations for student:', studentId);
      
      const response = await apiClient.get(`/ai/recommendations/${studentId}`);
      setRecommendations(response);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      
      // Provide fallback data for development/demo purposes
      const fallbackData: RecommendationData = {
        studentInfo: {
          name: user?.name || 'Student',
          department: user?.department || 'Computer Science and Engineering',
          year: 3,
          cgpa: 7.5,
          attendancePercentage: 85,
          performanceLevel: 'medium'
        },
        skillRecommendations: {
          newSkills: ['React.js', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
          existingSkills: ['JavaScript', 'Python', 'HTML/CSS'],
          skillGaps: 5
        },
        courseRecommendations: [
          {
            title: 'Full Stack Web Development',
            platform: 'Coursera',
            provider: 'University of Michigan',
            duration: '12 weeks',
            level: 'Intermediate',
            relevance: 'Essential for modern software development careers',
            skills: ['React', 'Node.js', 'MongoDB', 'Express']
          },
          {
            title: 'React - The Complete Guide',
            platform: 'Udemy',
            provider: 'Maximilian',
            duration: '8 weeks',
            level: 'Intermediate',
            relevance: 'High-demand frontend framework',
            skills: ['React', 'JavaScript', 'JSX', 'Redux']
          },
          {
            title: 'Machine Learning Specialization',
            platform: 'Coursera',
            provider: 'Stanford University',
            duration: '16 weeks',
            level: 'Advanced',
            relevance: 'AI/ML is the future of technology',
            skills: ['Python', 'TensorFlow', 'Neural Networks', 'Data Science']
          },
          {
            title: 'AWS Cloud Practitioner',
            platform: 'AWS Training',
            provider: 'Amazon Web Services',
            duration: '8 weeks',
            level: 'Beginner',
            relevance: 'Cloud skills are essential in modern tech',
            skills: ['AWS', 'Cloud Computing', 'DevOps']
          }
        ],
        geminiInsights: {
          courseReasoning: 'AI-powered recommendations based on your Computer Science background and current performance level',
          skillGuidance: 'Focus on building both technical and soft skills for career advancement'
        },
        weakSubjects: [
          {
            subject: 'Database Management Systems',
            averageGrade: 5.5,
            improvement: 'Moderate'
          }
        ],
        improvementSuggestions: [
          {
            area: 'Academic Performance',
            priority: 'Medium',
            suggestion: 'Focus on improving grades in core subjects',
            actionItems: ['Attend extra classes', 'Form study groups', 'Practice more problems']
          }
        ],
        activityRecommendations: [
          {
            type: 'internship',
            recommendation: 'Apply for internships to gain real-world experience',
            priority: 'High'
          }
        ],
        careerGuidance: {
          level: 'medium',
          focus: 'Skill enhancement and practical experience',
          nextSteps: ['Complete relevant courses', 'Build portfolio', 'Gain practical experience']
        }
      };
      
      setRecommendations(fallbackData);
      setError('Using demo data - Connect to server for personalized recommendations');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const studentId = user?.rollNumber || user?.id || 'demo-student';
      console.log('Fetching analytics for student:', studentId);
      const response = await apiClient.get(`/ai/analytics/${studentId}`);
      setAnalytics(response);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Provide fallback analytics data
      setAnalytics({
        skillProgression: [
          { month: '2024-01', newSkills: ['JavaScript', 'HTML'], skillCount: 2 },
          { month: '2024-02', newSkills: ['React', 'CSS'], skillCount: 2 },
          { month: '2024-03', newSkills: ['Node.js'], skillCount: 1 }
        ],
        performanceTrends: [
          { semester: 1, sgpa: 7.2, subjects: 6, averageMarks: 72 },
          { semester: 2, sgpa: 7.5, subjects: 6, averageMarks: 75 },
          { semester: 3, sgpa: 7.8, subjects: 7, averageMarks: 78 }
        ],
        activityDistribution: { competition: 2, certification: 3, internship: 1, workshop: 4 },
        totalActivities: 10,
        averageCredits: 2.5
      });
    }
  };

  const fetchComparison = async () => {
    try {
      const studentId = user?.rollNumber || user?.id || 'demo-student';
      console.log('Fetching comparison for student:', studentId);
      const response = await apiClient.get(`/ai/department-comparison/${studentId}`);
      setComparison(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching comparison:', err);
      // Provide fallback comparison data
      setComparison({
        studentPerformance: {
          cgpa: 7.5,
          attendance: 85,
          cgpaPercentile: 65,
          attendancePercentile: 70
        },
        departmentStats: {
          averageCGPA: 7.2,
          averageAttendance: 82,
          totalStudents: 120
        },
        comparison: {
          cgpaStatus: 'Above Average',
          attendanceStatus: 'Above Average'
        }
      });
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPerformanceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Analyzing your data...</p>
          <p className="text-sm text-gray-500">Generating personalized recommendations</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <Alert className="m-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load recommendations. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Demo Data Alert */}
      {error && (
        <Alert className="mb-6">
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold">AI-Powered Recommendations</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Personalized insights and recommendations based on your academic performance, activities, and career goals
        </p>
      </div>

      {/* Student Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Your Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{recommendations.studentInfo.cgpa}</div>
              <div className="text-sm text-gray-500">CGPA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{recommendations.studentInfo.attendancePercentage}%</div>
              <div className="text-sm text-gray-500">Attendance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Year {recommendations.studentInfo.year}</div>
              <div className="text-sm text-gray-500">{recommendations.studentInfo.department}</div>
            </div>
            <div className="text-center">
              <Badge className={getPerformanceLevelColor(recommendations.studentInfo.performanceLevel)}>
                {recommendations.studentInfo.performanceLevel.toUpperCase()} PERFORMER
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="improvement">Improvement</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommended Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Recommended Skills
                </CardTitle>
                <CardDescription>
                  Skills to develop based on your department and performance level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.skillRecommendations.newSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">{skill}</span>
                      <Badge variant="outline">New</Badge>
                    </div>
                  ))}
                </div>
                {recommendations.skillRecommendations.skillGaps > 0 && (
                  <Alert className="mt-4">
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      You have {recommendations.skillRecommendations.skillGaps} skill gaps to address for your career growth.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Existing Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Your Current Skills
                </CardTitle>
                <CardDescription>
                  Skills you've already developed through activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recommendations.skillRecommendations.existingSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="capitalize">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Activity Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.activityRecommendations.map((activity, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{activity.type}</h4>
                      <Badge variant={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{activity.recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {/* AI Insights Banner */}
          {recommendations.geminiInsights && (
            <Alert className="border-blue-200 bg-blue-50">
              <Brain className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>AI Insights:</strong> {recommendations.geminiInsights.courseReasoning}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                AI-Powered Course Recommendations
              </CardTitle>
              <CardDescription>
                Personalized courses generated by Gemini 2.5 Flash based on your academic profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.courseRecommendations.map((course, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-lg">{course.title}</h4>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      
                      {course.relevance && (
                        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Why this course:</strong> {course.relevance}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {course.platform} - {course.provider}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {course.duration}
                        </div>
                      </div>

                      {course.skills && course.skills.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Skills you'll learn:</p>
                          <div className="flex flex-wrap gap-1">
                            {course.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button className="w-full mt-3" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Course
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvement Tab */}
        <TabsContent value="improvement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Improvement Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Improvement Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.improvementSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{suggestion.area}</h4>
                      <Badge variant={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.suggestion}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">Action Items:</p>
                      {suggestion.actionItems.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center text-xs text-gray-600">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weak Subjects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Areas Needing Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.weakSubjects.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.weakSubjects.map((subject, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{subject.subject}</h4>
                          <Badge variant="destructive">{subject.improvement}</Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Average Grade:</span>
                          <Progress value={subject.averageGrade * 10} className="flex-1" />
                          <span className="text-sm font-medium ml-2">{subject.averageGrade.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-green-600">Great job!</p>
                    <p className="text-sm text-gray-500">No weak subjects identified</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Career Guidance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Career Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Current Focus</h4>
                  <p className="text-gray-600">{recommendations.careerGuidance.focus}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Next Steps</h4>
                  <ul className="space-y-1">
                    {recommendations.careerGuidance.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Activity Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.activityDistribution).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type}</span>
                        <div className="flex items-center">
                          <Progress value={(count / analytics.totalActivities) * 100} className="w-20 mr-2" />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Total Activities:</span>
                      <span className="font-medium">{analytics.totalActivities}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Credits:</span>
                      <span className="font-medium">{analytics.averageCredits.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.performanceTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Semester {trend.semester}</span>
                        <div className="text-right">
                          <div className="font-medium">SGPA: {trend.sgpa}</div>
                          <div className="text-sm text-gray-500">Avg: {trend.averageMarks.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {comparison && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Department Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Your CGPA</span>
                      <div className="text-right">
                        <div className="font-bold">{comparison.studentPerformance.cgpa}</div>
                        <Badge variant={comparison.comparison.cgpaStatus === "Above Average" ? "default" : "destructive"}>
                          {comparison.comparison.cgpaStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Department Average</span>
                      <span className="font-medium">{comparison.departmentStats.averageCGPA.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Your Percentile</span>
                      <span className="font-bold text-blue-600">{comparison.studentPerformance.cgpaPercentile}th</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Your Attendance</span>
                      <div className="text-right">
                        <div className="font-bold">{comparison.studentPerformance.attendance}%</div>
                        <Badge variant={comparison.comparison.attendanceStatus === "Above Average" ? "default" : "destructive"}>
                          {comparison.comparison.attendanceStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Department Average</span>
                      <span className="font-medium">{comparison.departmentStats.averageAttendance.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Your Percentile</span>
                      <span className="font-bold text-green-600">{comparison.studentPerformance.attendancePercentile}th</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIRecommendations;
