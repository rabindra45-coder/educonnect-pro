import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Users,
  Receipt,
  Loader2,
  RefreshCw,
  CreditCard,
  FileCheck
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid, AreaChart, Area } from "recharts";

interface DashboardStats {
  todayCollection: number;
  monthCollection: number;
  yearCollection: number;
  pendingDues: number;
  overdueFines: number;
  totalStudents: number;
  recentPayments: any[];
  pendingVerifications: number;
  monthlyTrend: any[];
  feeTypeBreakdown: any[];
  overdueStudents: number;
  paidStudents: number;
}

const AccountantOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayCollection: 0,
    monthCollection: 0,
    yearCollection: 0,
    pendingDues: 0,
    overdueFines: 0,
    totalStudents: 0,
    recentPayments: [],
    pendingVerifications: 0,
    monthlyTrend: [],
    feeTypeBreakdown: [],
    overdueStudents: 0,
    paidStudents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const today = new Date();
      const todayStart = format(startOfDay(today), "yyyy-MM-dd");
      const todayEnd = format(endOfDay(today), "yyyy-MM-dd");
      const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(today), "yyyy-MM-dd");
      const yearStart = format(startOfYear(today), "yyyy-MM-dd");
      const yearEnd = format(endOfYear(today), "yyyy-MM-dd");

      // Fetch all data in parallel for better performance
      const [
        todayPaymentsRes,
        monthPaymentsRes,
        yearPaymentsRes,
        pendingFeesRes,
        overdueFeesRes,
        libraryFinesRes,
        studentCountRes,
        recentPaymentsRes,
        pendingVerificationsRes,
        feeStructuresRes,
        paidStudentsRes
      ] = await Promise.all([
        // Today's collection
        supabase
          .from("fee_payments")
          .select("amount")
          .gte("paid_at", `${todayStart}T00:00:00`)
          .lte("paid_at", `${todayEnd}T23:59:59`),
        
        // Month collection
        supabase
          .from("fee_payments")
          .select("amount, paid_at")
          .gte("paid_at", `${monthStart}T00:00:00`)
          .lte("paid_at", `${monthEnd}T23:59:59`),
        
        // Year collection
        supabase
          .from("fee_payments")
          .select("amount")
          .gte("paid_at", `${yearStart}T00:00:00`)
          .lte("paid_at", `${yearEnd}T23:59:59`),
        
        // Pending dues (pending + partial)
        supabase
          .from("student_fees")
          .select("balance, status")
          .in("status", ["pending", "partial"]),
        
        // Overdue fees
        supabase
          .from("student_fees")
          .select("balance, student_id")
          .eq("status", "overdue"),
        
        // Library fines
        supabase
          .from("library_fines")
          .select("fine_amount, paid_amount")
          .eq("status", "pending"),
        
        // Total students
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        
        // Recent payments with student info
        supabase
          .from("fee_payments")
          .select(`
            *,
            student:student_id (full_name, class, registration_number)
          `)
          .order("paid_at", { ascending: false })
          .limit(10),
        
        // Pending verifications
        supabase
          .from("payment_verification_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        
        // Fee structures for breakdown
        supabase
          .from("fee_structures")
          .select("fee_type, amount")
          .eq("is_active", true),
        
        // Students with all fees paid
        supabase
          .from("student_fees")
          .select("student_id, status")
          .eq("status", "paid")
      ]);

      // Calculate monthly trend from month payments
      const monthPayments = monthPaymentsRes.data || [];
      const dailyCollections: Record<string, number> = {};
      monthPayments.forEach((p: any) => {
        const day = format(new Date(p.paid_at), "MMM dd");
        dailyCollections[day] = (dailyCollections[day] || 0) + Number(p.amount);
      });
      const monthlyTrend = Object.entries(dailyCollections).slice(-7).map(([date, amount]) => ({
        date,
        amount
      }));

      // Fee type breakdown
      const feeStructures = feeStructuresRes.data || [];
      const feeTypeBreakdown = feeStructures.reduce((acc: any[], f: any) => {
        const existing = acc.find(item => item.name === f.fee_type);
        if (existing) {
          existing.value += Number(f.amount);
        } else {
          acc.push({ name: f.fee_type, value: Number(f.amount) });
        }
        return acc;
      }, []);

      // Count unique overdue students
      const overdueData = overdueFeesRes.data || [];
      const uniqueOverdueStudents = new Set(overdueData.map((f: any) => f.student_id));

      // Count students with paid status
      const paidData = paidStudentsRes.data || [];
      const uniquePaidStudents = new Set(paidData.map((f: any) => f.student_id));

      setStats({
        todayCollection: todayPaymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        monthCollection: monthPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
        yearCollection: yearPaymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        pendingDues: (pendingFeesRes.data?.reduce((sum, f) => sum + Number(f.balance || 0), 0) || 0) + 
                     (overdueData.reduce((sum: number, f: any) => sum + Number(f.balance || 0), 0)),
        overdueFines: libraryFinesRes.data?.reduce((sum, f) => sum + (Number(f.fine_amount) - Number(f.paid_amount || 0)), 0) || 0,
        totalStudents: studentCountRes.count || 0,
        recentPayments: recentPaymentsRes.data || [],
        pendingVerifications: pendingVerificationsRes.count || 0,
        monthlyTrend,
        feeTypeBreakdown,
        overdueStudents: uniqueOverdueStudents.size,
        paidStudents: uniquePaidStudents.size,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Overview</h1>
          <p className="text-muted-foreground">Real-time financial data and analytics</p>
        </div>
        <Button variant="outline" onClick={fetchDashboardStats} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="bg-white/20 p-2 rounded-lg w-fit mb-2">
              <IndianRupee className="w-5 h-5" />
            </div>
            <p className="text-emerald-100 text-xs">Today</p>
            <p className="text-2xl font-bold">रू {stats.todayCollection.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="bg-white/20 p-2 rounded-lg w-fit mb-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-blue-100 text-xs">This Month</p>
            <p className="text-2xl font-bold">रू {stats.monthCollection.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="bg-white/20 p-2 rounded-lg w-fit mb-2">
              <CreditCard className="w-5 h-5" />
            </div>
            <p className="text-purple-100 text-xs">This Year</p>
            <p className="text-2xl font-bold">रू {stats.yearCollection.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="bg-white/20 p-2 rounded-lg w-fit mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-amber-100 text-xs">Pending Dues</p>
            <p className="text-2xl font-bold">रू {stats.pendingDues.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-4">
            <div className="bg-white/20 p-2 rounded-lg w-fit mb-2">
              <FileCheck className="w-5 h-5" />
            </div>
            <p className="text-orange-100 text-xs">Pending Verifications</p>
            <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
          <CardContent className="p-4">
            <div className="bg-white/20 p-2 rounded-lg w-fit mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-cyan-100 text-xs">Active Students</p>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Collection Trend</CardTitle>
            <CardDescription>Last 7 days collection</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.monthlyTrend.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip formatter={(value: number) => `रू ${value.toLocaleString()}`} />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No collection data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Status</CardTitle>
            <CardDescription>Student-wise payment overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-600">{stats.paidStudents}</p>
                  <p className="text-xs text-muted-foreground">Fees Paid</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <AlertTriangle className="w-8 h-8 mx-auto text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-600">{stats.overdueStudents}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                  <span className="text-sm">Year Collection</span>
                  <span className="font-bold text-emerald-600">रू {stats.yearCollection.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <span className="text-sm">Pending Amount</span>
                  <span className="font-bold text-amber-600">रू {stats.pendingDues.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <span className="text-sm">Library Fines</span>
                  <span className="font-bold text-red-600">रू {stats.overdueFines.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
            <CardDescription>Latest {stats.recentPayments.length} transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {stats.recentPayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent payments</p>
              ) : (
                stats.recentPayments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{payment.student?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.student?.class || '-'} • {payment.receipt_number || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">रू {Number(payment.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.paid_at), "MMM d")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(stats.pendingDues > 50000 || stats.overdueFines > 5000 || stats.pendingVerifications > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.pendingVerifications > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <FileCheck className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">Pending Verifications</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    {stats.pendingVerifications} payment(s) awaiting review
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {stats.pendingDues > 50000 && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">High Pending Dues</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    रू {stats.pendingDues.toLocaleString()} outstanding
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {stats.overdueFines > 5000 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Library Fines</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    रू {stats.overdueFines.toLocaleString()} uncollected
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountantOverview;