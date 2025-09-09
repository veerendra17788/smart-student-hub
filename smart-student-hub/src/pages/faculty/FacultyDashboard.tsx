import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  CheckSquare, 
  Users, 
  Calendar, 
  BarChart3, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Loader2
} from "lucide-react";

interface DashboardStats {
  pendingApprovals: number;
  totalStudents: number;
  eventsThisMonth: number;
  approvalRate: number;
}

interface PendingApproval {
  id: string;
  studentName: string;
  activity: string;
  type: string;
  date: string;
  credits: number;
  urgent: boolean;
  status: string;
  aiDecision?: string;
}

interface RecentActivity {
  action: string;
  time: string;
  status: string;
  type?: string;
}

interface DepartmentStats {
  totalStudents: number;
  activeStudents: number;
  avgCredits: number;
  approvalRate: number;
}

const FacultyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    pendingApprovals: 0,
    totalStudents: 0,
    eventsThisMonth: 0,
    approvalRate: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats>({
    totalStudents: 0,
    activeStudents: 0,
    avgCredits: 0,
    approvalRate: 0
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      // Fetch dashboard stats
      const statsRes = await fetch("http://localhost:5000/api/faculty/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data.stats);
        setRecentActivities(statsData.data.recentActivities);
        setDepartmentStats(statsData.data.departmentStats);
      }

      // Fetch pending approvals
      const approvalsRes = await fetch("http://localhost:5000/api/faculty/dashboard/pending-approvals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (approvalsRes.ok) {
        const approvalsData = await approvalsRes.json();
        setPendingApprovals(approvalsData.data);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickApprove = async (activityId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/activities/${activityId}/approve`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ facultyName: "Faculty" }),
      });
      
      if (res.ok) {
        // Refresh dashboard data after approval
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error approving activity:", error);
    }
  };

  const dashboardStats = [
    { title: "Pending Approvals", value: stats.pendingApprovals.toString(), icon: Clock, color: "text-warning" },
    { title: "Students Supervised", value: stats.totalStudents.toString(), icon: Users, color: "text-primary" },
    { title: "Events This Month", value: stats.eventsThisMonth.toString(), icon: Calendar, color: "text-secondary" },
    { title: "Approval Rate", value: `${stats.approvalRate}%`, icon: CheckCircle, color: "text-success" },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
            <p className="text-muted-foreground">Overview of student activities and approvals</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to="/faculty/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
            <Button asChild>
              <Link to="/faculty/events">
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat) => (
            <Card key={stat.title} className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    Pending Approvals
                  </div>
                  <Badge className="bg-warning text-warning-foreground">
                    {pendingApprovals.length} pending
                  </Badge>
                </CardTitle>
                <CardDescription>Student activities requiring your review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals.map((approval, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/50 border">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{approval.studentName}</h4>
                          {approval.urgent && (
                            <Badge className="bg-destructive text-destructive-foreground text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{approval.activity}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>{approval.type}</span>
                          <span>{approval.date}</span>
                          <span>{approval.credits} credits</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/faculty/approvals">View</Link>
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-success text-success-foreground"
                          onClick={() => handleQuickApprove(approval.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/faculty/approvals">View All Approvals</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Department Overview */}
            <Card className="bg-gradient-primary text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Department Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Students</span>
                    <span className="font-bold">{departmentStats.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active This Month</span>
                    <span className="font-bold">{departmentStats.activeStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Credits/Student</span>
                    <span className="font-bold">{departmentStats.avgCredits}</span>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Approval Rate</span>
                      <span>{departmentStats.approvalRate}%</span>
                    </div>
                    <Progress value={departmentStats.approvalRate} className="h-2 bg-white/20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-muted-foreground text-xs">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-success text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" asChild className="w-full">
                  <Link to="/faculty/approvals">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Review Approvals
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full border-white/30 text-black hover:bg-green/10">
                  <Link to="/faculty/events">
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full border-white/30 text-black hover:bg-green/10">
                  <Link to="/faculty/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate Report
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

export default FacultyDashboard;