import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ParentSidebar from "@/components/parent/ParentSidebar";
import ParentOverview from "@/components/parent/ParentOverview";
import ChildrenList from "@/components/parent/ChildrenList";
import AcademicProgress from "@/components/parent/AcademicProgress";
import AttendanceView from "@/components/parent/AttendanceView";
import ParentFeesView from "@/components/parent/ParentFeesView";
import AIAssistant from "@/components/parent/AIAssistant";
import ParentMeetings from "@/components/parent/ParentMeetings";
import ParentMessages from "@/components/parent/ParentMessages";

const ParentDashboard = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/parent/login");
      return;
    }
    if (user) checkAuthorization();
  }, [user, authLoading, navigate]);

  const checkAuthorization = async () => {
    try {
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .in("role", ["super_admin", "admin", "parent"]);

      if (error) throw error;

      if (!roleData || roleData.length === 0) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the parent portal.",
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
    navigate("/parent/login");
  };

  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <ParentOverview />;
      case "children":
        return <ChildrenList />;
      case "academics":
        return <AcademicProgress />;
      case "attendance":
        return <AttendanceView />;
      case "fees":
        return <ParentFeesView />;
      case "ai-assistant":
        return <AIAssistant />;
      case "meetings":
        return <ParentMeetings />;
      case "messages":
        return <ParentMessages />;
      default:
        return <ParentOverview />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Parent Portal | SDSJSS</title>
        <meta name="description" content="Parent portal for monitoring children's academic progress, attendance, and school activities." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex">
        <ParentSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          userName={profile?.full_name || "Parent"}
          photoUrl={profile?.photo_url}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">{renderContent()}</div>
        </main>
      </div>
    </>
  );
};

export default ParentDashboard;
