import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Book,
  AlertTriangle,
  LogOut,
  Home,
  BookOpen,
  RotateCcw,
  Receipt,
  Settings,
  Loader2,
  Users,
  BookMarked,
  BarChart3,
  FileText,
  Bell,
  Calendar,
  IndianRupee,
  TrendingUp,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import schoolLogo from "@/assets/logo.png";
import BooksManagement from "@/components/library/BooksManagement";
import IssueBooks from "@/components/library/IssueBooks";
import ReturnBooks from "@/components/library/ReturnBooks";
import LibraryFines from "@/components/library/LibraryFines";
import LibrarySettings from "@/components/library/LibrarySettings";
import LibraryMembers from "@/components/library/LibraryMembers";
import LibraryReservations from "@/components/library/LibraryReservations";
import LibraryReports from "@/components/library/LibraryReports";
import DigitalLibrary from "@/components/library/DigitalLibrary";

interface LibraryStats {
  totalBooks: number;
  issuedToday: number;
  returnedToday: number;
  overdueBooks: number;
  pendingFines: number;
  totalMembers: number;
  pendingReservations: number;
}

interface Notification {
  id: string;
  type: "overdue" | "reservation" | "fine";
  message: string;
  time: string;
}

const LibraryDashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<LibraryStats>({
    totalBooks: 0,
    issuedToday: 0,
    returnedToday: 0,
    overdueBooks: 0,
    pendingFines: 0,
    totalMembers: 0,
    pendingReservations: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLibrarian, setIsLibrarian] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/library/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkLibrarianRole();
      fetchStats();
      fetchNotifications();
    }
  }, [user]);

  const checkLibrarianRole = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .in("role", ["super_admin", "admin", "librarian"]);

      if (error) throw error;
      setIsLibrarian(data && data.length > 0);
    } catch (error) {
      console.error("Error checking role:", error);
      setIsLibrarian(false);
    } finally {
      setIsCheckingRole(false);
    }
  };

  const fetchStats = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Total books
      const { count: totalBooks } = await supabase
        .from("books")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Issued today
      const { count: issuedToday } = await supabase
        .from("book_issues")
        .select("*", { count: "exact", head: true })
        .eq("issue_date", today);

      // Returned today
      const { count: returnedToday } = await supabase
        .from("book_issues")
        .select("*", { count: "exact", head: true })
        .eq("return_date", today);

      // Overdue books
      const { count: overdueBooks } = await supabase
        .from("book_issues")
        .select("*", { count: "exact", head: true })
        .eq("status", "issued")
        .lt("due_date", today);

      // Pending fines
      const { data: finesData } = await supabase
        .from("library_fines")
        .select("fine_amount, paid_amount")
        .eq("status", "pending");

      const pendingFines = finesData?.reduce(
        (sum, f) => sum + (Number(f.fine_amount) - Number(f.paid_amount || 0)),
        0
      ) || 0;

      // Total members
      const { count: totalMembers } = await supabase
        .from("library_memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Pending reservations
      const { count: pendingReservations } = await supabase
        .from("book_reservations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setStats({
        totalBooks: totalBooks || 0,
        issuedToday: issuedToday || 0,
        returnedToday: returnedToday || 0,
        overdueBooks: overdueBooks || 0,
        pendingFines,
        totalMembers: totalMembers || 0,
        pendingReservations: pendingReservations || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Get overdue books
      const { data: overdueData } = await supabase
        .from("book_issues")
        .select(`
          id,
          due_date,
          student:student_id (full_name)
        `)
        .eq("status", "issued")
        .lt("due_date", today)
        .limit(5);

      // Get pending reservations
      const { data: reservationData } = await supabase
        .from("book_reservations")
        .select(`
          id,
          created_at,
          student:student_id (full_name),
          book:book_id (title)
        `)
        .eq("status", "pending")
        .limit(5);

      const notifs: Notification[] = [];
      
      overdueData?.forEach((item: any) => {
        notifs.push({
          id: item.id,
          type: "overdue",
          message: `${item.student?.full_name}'s book is overdue`,
          time: format(new Date(item.due_date), "MMM d"),
        });
      });

      reservationData?.forEach((item: any) => {
        notifs.push({
          id: item.id,
          type: "reservation",
          message: `${item.student?.full_name} reserved "${item.book?.title}"`,
          time: format(new Date(item.created_at), "MMM d"),
        });
      });

      setNotifications(notifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/library/login");
  };

  if (authLoading || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!isLibrarian) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You don't have permission to access the library portal.</p>
        <Button onClick={() => navigate("/")}>Go to Homepage</Button>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "books", label: "Books", icon: Book },
    { id: "issue", label: "Issue", icon: BookOpen },
    { id: "return", label: "Return", icon: RotateCcw },
    { id: "members", label: "Members", icon: Users },
    { id: "reservations", label: "Reservations", icon: BookMarked },
    { id: "fines", label: "Fines", icon: Receipt },
    { id: "digital", label: "Digital", icon: FileText },
    { id: "reports", label: "Reports", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={schoolLogo} alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-bold text-lg text-amber-700 dark:text-amber-400">Library Portal</h1>
                <p className="text-xs text-muted-foreground">SDSJSS Digital Library</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <Home className="w-4 h-4 mr-2" />
                Main Site
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-1 h-auto p-1 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 py-2 px-2 text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-white"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <CardContent className="p-4">
                  <Book className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{stats.totalBooks}</p>
                  <p className="text-xs opacity-80">Total Books</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <CardContent className="p-4">
                  <BookOpen className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{stats.issuedToday}</p>
                  <p className="text-xs opacity-80">Issued Today</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <RotateCcw className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{stats.returnedToday}</p>
                  <p className="text-xs opacity-80">Returned Today</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="p-4">
                  <AlertTriangle className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{stats.overdueBooks}</p>
                  <p className="text-xs opacity-80">Overdue</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <IndianRupee className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">रू {stats.pendingFines.toLocaleString()}</p>
                  <p className="text-xs opacity-80">Pending Fines</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                <CardContent className="p-4">
                  <Users className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  <p className="text-xs opacity-80">Active Members</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <BookMarked className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{stats.pendingReservations}</p>
                  <p className="text-xs opacity-80">Reservations</p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="w-5 h-5" />
                    Notifications & Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No new notifications</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            notif.type === "overdue"
                              ? "bg-red-50 dark:bg-red-950/30"
                              : "bg-amber-50 dark:bg-amber-950/30"
                          }`}
                        >
                          {notif.type === "overdue" ? (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          ) : (
                            <BookMarked className="w-4 h-4 text-amber-600" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notif.message}</p>
                            <p className="text-xs text-muted-foreground">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setActiveTab("issue")}
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>Issue Book</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setActiveTab("return")}
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Return Book</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setActiveTab("books")}
                    >
                      <Book className="w-5 h-5" />
                      <span>Add Book</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setActiveTab("members")}
                    >
                      <Users className="w-5 h-5" />
                      <span>Add Member</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="books">
            <BooksManagement onStatsChange={fetchStats} />
          </TabsContent>

          <TabsContent value="issue">
            <IssueBooks onIssue={fetchStats} />
          </TabsContent>

          <TabsContent value="return">
            <ReturnBooks onReturn={fetchStats} />
          </TabsContent>

          <TabsContent value="members">
            <LibraryMembers onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="reservations">
            <LibraryReservations onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="fines">
            <LibraryFines onFineUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="digital">
            <DigitalLibrary />
          </TabsContent>

          <TabsContent value="reports">
            <LibraryReports />
          </TabsContent>

          <TabsContent value="settings">
            <LibrarySettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LibraryDashboard;
