import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Book,
  Users,
  AlertTriangle,
  DollarSign,
  Search,
  LogOut,
  Home,
  BookOpen,
  RotateCcw,
  Receipt,
  Settings,
  Loader2,
} from "lucide-react";
import schoolLogo from "@/assets/logo.png";
import BooksManagement from "@/components/library/BooksManagement";
import IssueBooks from "@/components/library/IssueBooks";
import ReturnBooks from "@/components/library/ReturnBooks";
import LibraryFines from "@/components/library/LibraryFines";
import LibrarySettings from "@/components/library/LibrarySettings";

interface LibraryStats {
  totalBooks: number;
  issuedBooks: number;
  overdueBooks: number;
  pendingFines: number;
}

const LibraryDashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<LibraryStats>({
    totalBooks: 0,
    issuedBooks: 0,
    overdueBooks: 0,
    pendingFines: 0,
  });
  const [isLibrarian, setIsLibrarian] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/library/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkLibrarianRole();
      fetchStats();
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
      // Total books
      const { count: totalBooks } = await supabase
        .from("books")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Issued books
      const { count: issuedBooks } = await supabase
        .from("book_issues")
        .select("*", { count: "exact", head: true })
        .eq("status", "issued");

      // Overdue books
      const today = new Date().toISOString().split("T")[0];
      const { count: overdueBooks } = await supabase
        .from("book_issues")
        .select("*", { count: "exact", head: true })
        .eq("status", "issued")
        .lt("due_date", today);

      // Pending fines
      const { data: finesData } = await supabase
        .from("library_fines")
        .select("fine_amount")
        .eq("status", "pending");

      const pendingFines = finesData?.reduce((sum, f) => sum + Number(f.fine_amount), 0) || 0;

      setStats({
        totalBooks: totalBooks || 0,
        issuedBooks: issuedBooks || 0,
        overdueBooks: overdueBooks || 0,
        pendingFines,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/library/login");
  };

  if (authLoading || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt="School Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Library Portal</h1>
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
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Book className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issued Books</p>
                <p className="text-2xl font-bold">{stats.issuedBooks}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdueBooks}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <DollarSign className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Fines</p>
                <p className="text-2xl font-bold">रू {stats.pendingFines.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="books" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="books" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              <span className="hidden sm:inline">Books</span>
            </TabsTrigger>
            <TabsTrigger value="issue" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Issue</span>
            </TabsTrigger>
            <TabsTrigger value="return" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Return</span>
            </TabsTrigger>
            <TabsTrigger value="fines" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Fines</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books">
            <BooksManagement onStatsChange={fetchStats} />
          </TabsContent>

          <TabsContent value="issue">
            <IssueBooks onIssue={fetchStats} />
          </TabsContent>

          <TabsContent value="return">
            <ReturnBooks onReturn={fetchStats} />
          </TabsContent>

          <TabsContent value="fines">
            <LibraryFines onFineUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="settings">
            <LibrarySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LibraryDashboard;
