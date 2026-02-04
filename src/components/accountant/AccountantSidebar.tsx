import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  CreditCard,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  QrCode,
  CheckCircle,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import schoolLogo from "@/assets/logo.png";
import { useState } from "react";

interface AccountantSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userName?: string;
}

const AccountantSidebar = ({
  activeTab,
  onTabChange,
  onLogout,
  userName,
}: AccountantSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "overview", name: "Dashboard", icon: LayoutDashboard },
    { id: "fee-structure", name: "Fee Structure", icon: FileText },
    { id: "invoices", name: "Invoices", icon: Receipt },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "payment-verification", name: "Payment Verification", icon: CheckCircle },
    { id: "qr-codes", name: "QR Codes", icon: QrCode },
    { id: "expenses", name: "Expenses", icon: PiggyBank },
    { id: "budgets", name: "Budgets", icon: TrendingUp },
    { id: "reports", name: "Reports", icon: BarChart3 },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "bg-card border-r border-border h-screen flex flex-col transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/accountant" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-sm font-bold text-foreground leading-tight truncate">
                Finance Portal
              </h1>
              <p className="text-xs text-muted-foreground">Accountant</p>
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
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-500 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        {!isCollapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-foreground truncate">
              {userName || "Accountant"}
            </p>
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 mt-1">
              Finance
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className={cn(
              "text-muted-foreground hover:text-destructive",
              isCollapsed && "w-full"
            )}
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

export default AccountantSidebar;
