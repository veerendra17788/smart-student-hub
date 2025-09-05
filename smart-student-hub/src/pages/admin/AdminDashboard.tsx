import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, Settings, Shield } from "lucide-react";

const AdminDashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System-wide overview and management</p>
          </div>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { title: "Total Users", value: "2,450", icon: Users },
            { title: "Active Institutions", value: "45", icon: Shield },
            { title: "Monthly Activities", value: "1,230", icon: BarChart3 },
            { title: "System Health", value: "99.9%", icon: Settings },
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
            <CardTitle>System Overview</CardTitle>
            <CardDescription className="text-white/80">
              Platform-wide metrics and administrative controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>System administration features and analytics will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;