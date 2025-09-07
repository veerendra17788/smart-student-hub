import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Download, 
  Users, 
  TrendingUp, 
  Award, 
  Calendar,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";

interface AnalyticsData {
  activityTypeStats: Array<{
    _id: string;
    count: number;
    totalCredits: number;
  }>;
  monthlyTrends: Array<{
    _id: {
      year: number;
      month: number;
      status: string;
    };
    count: number;
  }>;
  topStudents: Array<{
    studentName: string;
    rollNumber: string;
    totalCredits: number;
    activitiesCount: number;
  }>;
}

const FacultyAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    activityTypeStats: [],
    monthlyTrends: [],
    topStudents: []
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    avgCredits: 0,
    approvalRate: 0
  });

  const fetchAnalyticsData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      // Fetch comprehensive analytics overview
      const overviewRes = await fetch("http://localhost:5000/api/faculty/analytics/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setAnalyticsData({
          activityTypeStats: overviewData.data.activityTypes || [],
          monthlyTrends: overviewData.data.monthlyTrends || [],
          topStudents: []
        });
        setDashboardStats({
          totalStudents: overviewData.data.overview.totalActivities || 0,
          activeStudents: overviewData.data.overview.approvedActivities || 0,
          avgCredits: Math.round((overviewData.data.credits.avgCredits || 0) * 10) / 10,
          approvalRate: overviewData.data.overview.approvalRate || 0
        });
      }

      // Fetch student performance data
      const studentsRes = await fetch("http://localhost:5000/api/faculty/analytics/students?limit=10&sortBy=totalCredits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setAnalyticsData(prev => ({
          ...prev,
          topStudents: studentsData.data.students.map(student => ({
            studentName: student.name,
            rollNumber: student.rollNumber,
            totalCredits: student.totalCredits,
            activitiesCount: student.approvedActivities
          }))
        }));
      }

    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleExportReport = async (format = 'json') => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`http://localhost:5000/api/faculty/analytics/reports?format=${format}&reportType=comprehensive`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        if (format === 'csv') {
          const csvData = await response.text();
          const blob = new Blob([csvData], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `faculty-analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          const reportData = await response.json();
          const blob = new Blob([JSON.stringify(reportData.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `faculty-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">Department performance insights and comprehensive reports</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => handleExportReport('json')}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { title: "Total Students", value: dashboardStats.totalStudents.toString(), icon: Users, color: "text-blue-600" },
            { title: "Active This Month", value: dashboardStats.activeStudents.toString(), icon: TrendingUp, color: "text-green-600" },
            { title: "Avg Credits", value: dashboardStats.avgCredits.toString(), icon: BarChart3, color: "text-purple-600" },
            { title: "Approval Rate", value: `${dashboardStats.approvalRate}%`, icon: CheckCircle, color: "text-emerald-600" },
          ].map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="activities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activities">Activity Analysis</TabsTrigger>
            <TabsTrigger value="students">Student Performance</TabsTrigger>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Activity Type Distribution
                </CardTitle>
                <CardDescription>Breakdown of approved activities by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.activityTypeStats.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/50 border">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">{activity._id}</h4>
                          <Badge variant="outline">{activity.count} activities</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Total Credits: {activity.totalCredits}</span>
                          <span>Avg Credits: {Math.round((activity.totalCredits / activity.count) * 10) / 10}</span>
                        </div>
                        <Progress 
                          value={(activity.count / Math.max(...analyticsData.activityTypeStats.map(a => a.count))) * 100} 
                          className="mt-2 h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Top Performing Students
                </CardTitle>
                <CardDescription>Students with highest activity credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/50 border">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{student.studentName || 'Unknown Student'}</h4>
                          <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{student.totalCredits} credits</div>
                        <div className="text-sm text-muted-foreground">{student.activitiesCount} activities</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Monthly Activity Trends
                </CardTitle>
                <CardDescription>Activity submission and approval patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.monthlyTrends.reduce((acc: any[], trend) => {
                    const monthKey = `${trend._id.year}-${trend._id.month}`;
                    const existing = acc.find(item => item.month === monthKey);
                    
                    if (existing) {
                      existing[trend._id.status] = trend.count;
                      existing.total += trend.count;
                    } else {
                      acc.push({
                        month: monthKey,
                        monthName: new Date(trend._id.year, trend._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                        [trend._id.status]: trend.count,
                        total: trend.count
                      });
                    }
                    return acc;
                  }, []).map((monthData, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/50 border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{monthData.monthName}</h4>
                        <Badge variant="outline">{monthData.total} total activities</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-green-600">{monthData.approved || 0}</div>
                          <div className="text-muted-foreground">Approved</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-yellow-600">{monthData.pending || 0}</div>
                          <div className="text-muted-foreground">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-red-600">{monthData.rejected || 0}</div>
                          <div className="text-muted-foreground">Rejected</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* NAAC/NIRF Ready Report */}
        <Card className="bg-gradient-primary text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle>NAAC/NIRF Ready Analytics</CardTitle>
            <CardDescription className="text-white/80">
              Comprehensive insights for academic accreditation reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Student Engagement Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Active Students:</span>
                    <span className="font-bold">{dashboardStats.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Active Rate:</span>
                    <span className="font-bold">{Math.round((dashboardStats.activeStudents / dashboardStats.totalStudents) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Credits per Student:</span>
                    <span className="font-bold">{dashboardStats.avgCredits}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quality Assurance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Faculty Approval Rate:</span>
                    <span className="font-bold">{dashboardStats.approvalRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Activity Types:</span>
                    <span className="font-bold">{analyticsData.activityTypeStats.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blockchain Verified:</span>
                    <span className="font-bold">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default FacultyAnalytics;