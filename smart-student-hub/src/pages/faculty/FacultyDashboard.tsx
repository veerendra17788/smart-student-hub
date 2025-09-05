import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  CheckSquare, 
  Users, 
  Calendar, 
  BarChart3, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";

const FacultyDashboard = () => {
  const stats = [
    { title: "Pending Approvals", value: "12", icon: Clock, color: "text-warning" },
    { title: "Students Supervised", value: "89", icon: Users, color: "text-primary" },
    { title: "Events This Month", value: "6", icon: Calendar, color: "text-secondary" },
    { title: "Approval Rate", value: "94%", icon: CheckCircle, color: "text-success" },
  ];

  const pendingApprovals = [
    {
      studentName: "Priya Sharma",
      activity: "Hackathon Winner - TechFest 2024",
      type: "Competition",
      date: "2024-03-15",
      credits: 15,
      urgent: true
    },
    {
      studentName: "Rahul Kumar",
      activity: "AWS Cloud Certification",
      type: "Certification",
      date: "2024-03-10",
      credits: 10,
      urgent: false
    },
    {
      studentName: "Anita Patel",
      activity: "Research Paper Publication",
      type: "Research",
      date: "2024-03-08",
      credits: 20,
      urgent: true
    }
  ];

  const recentActivities = [
    { action: "Approved internship for Alex Johnson", time: "2 hours ago" },
    { action: "Created new workshop: AI Ethics", time: "1 day ago" },
    { action: "Rejected duplicate certification for Maria", time: "2 days ago" },
    { action: "Approved research project for David", time: "3 days ago" }
  ];

  const departmentStats = {
    totalStudents: 234,
    activeStudents: 198,
    avgCredits: 45.6,
    approvalRate: 94
  };

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
          {stats.map((stat) => (
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
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" className="bg-success text-success-foreground">Approve</Button>
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
                <Button variant="outline" asChild className="w-full border-white/30 text-white hover:bg-white/10">
                  <Link to="/faculty/events">
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full border-white/30 text-white hover:bg-white/10">
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