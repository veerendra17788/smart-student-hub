import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  User, 
  Trophy, 
  FileText, 
  Calendar, 
  Lightbulb,
  BarChart3,
  GraduationCap
} from "lucide-react";

const StudentNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      title: "Dashboard",
      href: "/student/dashboard",
      icon: LayoutDashboard,
      description: "Overview and quick stats"
    },
    {
      title: "Academics",
      href: "/student/academics",
      icon: GraduationCap,
      description: "CGPA and semester performance"
    },
    {
      title: "Attendance",
      href: "/student/attendance",
      icon: BarChart3,
      description: "Class attendance tracking"
    },
    {
      title: "Activities",
      href: "/student/activities",
      icon: Trophy,
      description: "Competitions and certifications"
    },
    {
      title: "Portfolio",
      href: "/student/portfolio",
      icon: FileText,
      description: "Generate and manage portfolio"
    },
    {
      title: "Events",
      href: "/student/events",
      icon: Calendar,
      description: "Upcoming events and registrations"
    },
    {
      title: "Profile",
      href: "/student/profile",
      icon: User,
      description: "Personal information"
    },
    {
      title: "Recommendations",
      href: "/student/recommendations",
      icon: Lightbulb,
      description: "AI-powered suggestions"
    }
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-4 w-4" />
            <div className="flex-1">
              <div>{item.title}</div>
              {!isActive && (
                <div className="text-xs text-muted-foreground">{item.description}</div>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default StudentNavigation;
