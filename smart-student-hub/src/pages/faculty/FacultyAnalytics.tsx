import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, Users, TrendingUp } from "lucide-react";

const FacultyAnalytics = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">Department performance insights and NAAC reports</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { title: "Total Students", value: "234", icon: Users },
            { title: "Active This Month", value: "198", icon: TrendingUp },
            { title: "Avg Credits", value: "45.6", icon: BarChart3 },
            { title: "Approval Rate", value: "94%", icon: TrendingUp },
          ].map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-primary text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Department Analytics</CardTitle>
            <CardDescription className="text-white/80">
              Comprehensive insights for academic reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>NAAC/NIRF ready analytics and reports will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default FacultyAnalytics;