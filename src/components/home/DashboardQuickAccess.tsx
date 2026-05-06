import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, GraduationCap, Users, BookOpen, Wallet, Shield, UserCog } from "lucide-react";
import { useAuth, type AppRole } from "@/hooks/useAuth";

type DashInfo = { path: string; label: string; icon: typeof LayoutDashboard };

const ROLE_DASHBOARDS: Record<string, DashInfo> = {
  super_admin: { path: "/admin", label: "Admin Dashboard", icon: Shield },
  admin: { path: "/admin", label: "Admin Dashboard", icon: Shield },
  teacher: { path: "/teacher", label: "Teacher Dashboard", icon: UserCog },
  staff: { path: "/admin", label: "Staff Dashboard", icon: UserCog },
  accountant: { path: "/accountant", label: "Accountant", icon: Wallet },
  librarian: { path: "/library", label: "Library", icon: BookOpen },
  parent: { path: "/parent", label: "Parent Dashboard", icon: Users },
  student: { path: "/student", label: "Student Dashboard", icon: GraduationCap },
};

const ROLE_PRIORITY: AppRole[] | string[] = [
  "super_admin", "admin", "accountant", "librarian", "teacher", "staff", "student", "parent",
];

const DashboardQuickAccess = () => {
  const { user, profile, roles, isLoading } = useAuth();

  if (isLoading || !user) return null;

  // Determine the most relevant dashboard based on user roles
  const primaryRole = ROLE_PRIORITY.find((r) => (roles as string[]).includes(r)) as string | undefined;
  const dash = (primaryRole && ROLE_DASHBOARDS[primaryRole]) || ROLE_DASHBOARDS.student;
  const Icon = dash.icon;

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40"
    >
      <Link
        to={dash.path}
        className="group flex items-center gap-3 bg-card border border-border shadow-2xl rounded-2xl pl-3 pr-4 py-3 hover:shadow-primary/20 hover:border-primary/40 transition-all"
      >
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shrink-0">
          <Icon className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent border-2 border-card rounded-full" />
        </div>
        <div className="hidden xs:flex flex-col leading-tight pr-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Welcome, {firstName}
          </span>
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {dash.label}
          </span>
        </div>
        <LayoutDashboard className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors hidden xs:block" />
      </Link>
    </motion.div>
  );
};

export default DashboardQuickAccess;
