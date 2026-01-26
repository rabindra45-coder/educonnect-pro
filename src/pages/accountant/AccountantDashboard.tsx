import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  TrendingUp,
  PiggyBank,
  AlertTriangle,
  Receipt,
  Users,
  Settings,
  LogOut,
  Loader2,
  IndianRupee,
  Calendar,
  BarChart3
} from "lucide-react";
import schoolLogo from "@/assets/logo.png";
import AccountantOverview from "@/components/accountant/AccountantOverview";
import FeeStructureManagement from "@/components/accountant/FeeStructureManagement";
import InvoiceManagement from "@/components/accountant/InvoiceManagement";
import PaymentManagement from "@/components/accountant/PaymentManagement";
import ExpenseManagement from "@/components/accountant/ExpenseManagement";
import BudgetManagement from "@/components/accountant/BudgetManagement";
import FinancialReports from "@/components/accountant/FinancialReports";
import AccountantSettings from "@/components/accountant/AccountantSettings";

const AccountantDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/accountant/login");
      return;
    }

    if (user) {
      checkAuthorization();
    }
  }, [user, authLoading, navigate]);

  const checkAuthorization = async () => {
    try {
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .in("role", ["super_admin", "admin", "accountant"]);

      if (error) throw error;

      if (!roleData || roleData.length === 0) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this portal.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Authorization check failed:", error);
      navigate("/");
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/accountant/login");
  };

  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const tabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "fee-structure", label: "Fee Structure", icon: FileText },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "expenses", label: "Expenses", icon: PiggyBank },
    { id: "budgets", label: "Budgets", icon: TrendingUp },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/30">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={schoolLogo} alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-bold text-lg text-emerald-700 dark:text-emerald-400">Finance Portal</h1>
                <p className="text-xs text-muted-foreground">Accountant Dashboard</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-2 bg-white dark:bg-slate-900 shadow-sm">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 py-2 px-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-xs hidden sm:block">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <AccountantOverview />
          </TabsContent>

          <TabsContent value="fee-structure">
            <FeeStructureManagement />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseManagement />
          </TabsContent>

          <TabsContent value="budgets">
            <BudgetManagement />
          </TabsContent>

          <TabsContent value="reports">
            <FinancialReports />
          </TabsContent>

          <TabsContent value="settings">
            <AccountantSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AccountantDashboard;