import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import AccountantSidebar from "@/components/accountant/AccountantSidebar";
import AccountantOverview from "@/components/accountant/AccountantOverview";
import FeeStructureManagement from "@/components/accountant/FeeStructureManagement";
import InvoiceManagement from "@/components/accountant/InvoiceManagement";
import PaymentManagement from "@/components/accountant/PaymentManagement";
import ExpenseManagement from "@/components/accountant/ExpenseManagement";
import BudgetManagement from "@/components/accountant/BudgetManagement";
import FinancialReports from "@/components/accountant/FinancialReports";
import AccountantSettings from "@/components/accountant/AccountantSettings";
import PaymentQRManagement from "@/components/admin/PaymentQRManagement";
import PaymentVerificationManagement from "@/components/admin/PaymentVerificationManagement";

const AccountantDashboard = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AccountantOverview />;
      case "fee-structure":
        return <FeeStructureManagement />;
      case "invoices":
        return <InvoiceManagement />;
      case "payments":
        return <PaymentManagement />;
      case "payment-verification":
        return <PaymentVerificationManagement />;
      case "qr-codes":
        return <PaymentQRManagement />;
      case "expenses":
        return <ExpenseManagement />;
      case "budgets":
        return <BudgetManagement />;
      case "reports":
        return <FinancialReports />;
      case "settings":
        return <AccountantSettings />;
      default:
        return <AccountantOverview />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Finance Portal | Accountant Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex">
        <AccountantSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          userName={profile?.full_name || "Accountant"}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">{renderContent()}</div>
        </main>
      </div>
    </>
  );
};

export default AccountantDashboard;
