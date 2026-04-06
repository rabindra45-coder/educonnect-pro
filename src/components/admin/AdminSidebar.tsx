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
  Home,
  Image,
  Layers,
  FolderOpen,
  MessageCircle,
  ClipboardList,
  BookOpen,
  Wallet,
  UserCheck,
  BarChart3,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => {
  const location = useLocation();
  const { profile, signOut, hasRole } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Notices", path: "/admin/notices", icon: Megaphone },
    { name: "Content", path: "/admin/content", icon: Layers },
    { name: "Gallery", path: "/admin/gallery", icon: Image },
    { name: "Students", path: "/admin/students", icon: GraduationCap },
    { name: "Attendance", path: "/admin/attendance", icon: UserCheck },
    { name: "Reports", path: "/admin/attendance-reports", icon: BarChart3 },
    { name: "Documents", path: "/admin/documents", icon: FolderOpen },
    { name: "Exams", path: "/admin/exams", icon: ClipboardList },
    { name: "Subjects", path: "/admin/subjects", icon: BookOpen },
    { name: "Fees", path: "/admin/fees", icon: Wallet },
    { name: "Teachers", path: "/admin/teachers", icon: Users },
    { name: "Admissions", path: "/admin/admissions", icon: FileText },
    { name: "Chats", path: "/admin/chats", icon: MessageCircle },
    { name: "Messages", path: "/admin/contact-messages", icon: Mail },
    ...(hasRole("super_admin") ? [{ name: "User Mgmt", path: "/admin/users", icon: UserCog }] : []),
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const getRoleBadge = () => {
    if (hasRole("super_admin")) return "Super Admin";
    if (hasRole("admin")) return "Admin";
    if (hasRole("teacher")) return "Teacher";
    if (hasRole("staff")) return "Staff";
    return "User";
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <aside
      className={cn(
        "bg-card border-r border-border h-screen flex flex-col transition-all duration-300 relative",
        isCollapsed ? "w-[70px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("p-4 border-b border-border/50", isCollapsed && "px-2")}>
        <Link to="/admin" className={cn("flex items-center gap-3", isCollapsed && "justify-center")} onClick={onNavigate}>
          <img
            alt="College Logo"
            className="w-10 h-10 object-contain"
            src="/lovable-uploads/6a060f55-67c8-4243-ac6f-4320029beca2.png"
          />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-sm font-bold text-foreground leading-tight truncate">
                Milestone College
              </h1>
              <p className="text-[10px] text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </Link>
      </div>

      {/* User Profile - Compact */}
      <div className={cn("p-3 border-b border-border/50", isCollapsed && "px-2")}>
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <Avatar className={cn("border-2 border-primary/20", isCollapsed ? "w-8 h-8" : "w-10 h-10")}>
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {getInitials(profile?.full_name || "A")}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{profile?.full_name || "User"}</p>
              <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary">
                {getRoleBadge()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn("p-3 border-t border-border/50 space-y-1", isCollapsed && "px-2")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full justify-start gap-3 text-xs", isCollapsed && "justify-center px-2")}
          asChild
        >
          <Link to="/" onClick={onNavigate}>
            <Home className="w-4 h-4" />
            {!isCollapsed && <span>Main Site</span>}
          </Link>
        </Button>
        <Separator />
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start gap-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-2"
          )}
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>

      {/* Collapse Toggle - Desktop */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute top-20 -right-3 w-6 h-6 bg-card border border-border rounded-full items-center justify-center text-muted-foreground hover:text-foreground shadow-sm z-10"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
};

export default AdminSidebar;
