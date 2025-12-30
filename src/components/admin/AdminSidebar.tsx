import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Megaphone, 
  FileText, 
  Settings,
  LogOut,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import schoolLogo from "@/assets/logo.png";
import { useState } from "react";

const AdminSidebar = () => {
  const location = useLocation();
  const { profile, roles, signOut, hasRole } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Notices", path: "/admin/notices", icon: Megaphone },
    { name: "Students", path: "/admin/students", icon: GraduationCap },
    { name: "Teachers", path: "/admin/teachers", icon: Users },
    { name: "Admissions", path: "/admin/admissions", icon: FileText },
    ...(hasRole("super_admin") ? [
      { name: "User Management", path: "/admin/users", icon: UserCog },
    ] : []),
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const getRoleBadge = () => {
    if (hasRole("super_admin")) return "Super Admin";
    if (hasRole("admin")) return "Admin";
    if (hasRole("teacher")) return "Teacher";
    if (hasRole("staff")) return "Staff";
    return "User";
  };

  return (
    <aside
      className={cn(
        "bg-card border-r border-border h-screen flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/admin" className="flex items-center gap-3">
          <img
            src={schoolLogo}
            alt="School Logo"
            className="w-12 h-12 object-contain"
          />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-sm font-bold text-foreground leading-tight truncate">
                SDSJSS
              </h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </Link>
        {/* Link to main site */}
        <Link 
          to="/" 
          className={cn(
            "flex items-center gap-2 mt-3 text-xs text-muted-foreground hover:text-primary transition-colors",
            isCollapsed && "justify-center"
          )}
          title="Go to main website"
        >
          <Home className="w-4 h-4" />
          {!isCollapsed && <span>Visit Website</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        {!isCollapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || "User"}
            </p>
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary mt-1">
              {getRoleBadge()}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className={cn("text-muted-foreground hover:text-destructive", isCollapsed && "w-full")}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-20 -right-3 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
};

export default AdminSidebar;
