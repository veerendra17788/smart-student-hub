import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { 
  GraduationCap, 
  Home, 
  User, 
  FileText, 
  Calendar, 
  Trophy, 
  Lightbulb,
  Users,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Bell
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}


const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate(); 
  const { user, logout, refreshProfile } = useAuth();
  const location = useLocation();

  // Refresh profile data on component mount to get latest profile photo
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user?.id]); // Only refresh when user ID changes

  const getNavItems = () => {
    if (user?.role === "student") {
      return [
        { icon: Home, label: "Dashboard", path: "/student/dashboard" },
        { icon: GraduationCap, label: "Academics", path: "/student/academics" },
        { icon: BarChart3, label: "Attendance", path: "/student/attendance" },
        { icon: Trophy, label: "Activities", path: "/student/activities" },
        { icon: FileText, label: "Portfolio", path: "/student/portfolio" },
        { icon: Calendar, label: "Events", path: "/student/events" },
        { icon: User, label: "Profile", path: "/student/profile" },
        { icon: Lightbulb, label: "Recommendations", path: "/student/recommendations" },
      ];
    } else if (user?.role === "faculty") {
      return [
        { icon: Home, label: "Dashboard", path: "/faculty/dashboard" },
        { icon: CheckSquare, label: "Approvals", path: "/faculty/approvals" },
        { icon: Calendar, label: "Events", path: "/faculty/events" },
        { icon: BarChart3, label: "Analytics", path: "/faculty/analytics" },
      ];
    } else {
      return [
        { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
        { icon: Settings, label: "Settings", path: "/admin/settings" },
      ];
    }
  };

  const navItems = getNavItems();
 

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Smart Student Hub</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="text-sm font-medium">{user?.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem   onClick={() => logout(navigate)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/50 backdrop-blur-sm border-r min-h-[calc(100vh-73px)]">
          <div className="p-4">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;