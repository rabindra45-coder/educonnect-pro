import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Users,
  Receipt,
  Loader2
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface DashboardStats {
  todayCollection: number;
  monthCollection: number;
  yearCollection: number;
  pendingDues: number;
  overdueFines: number;
  totalStudents: number;
  recentPayments: any[];
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

      // Today's collection
      const { data: todayPayments } = await supabase
        .from("fee_payments")
        .select("amount")
        .gte("paid_at", todayStart)
        .lte("paid_at", todayEnd);

      // Month collection
      const { data: monthPayments } = await supabase
        .from("fee_payments")
        .select("amount")
        .gte("paid_at", monthStart)
        .lte("paid_at", monthEnd);

      // Year collection
      const { data: yearPayments } = await supabase
        .from("fee_payments")
        .select("amount")
        .gte("paid_at", yearStart)
        .lte("paid_at", yearEnd);

      // Pending dues
      const { data: pendingFees } = await supabase
        .from("student_fees")
        .select("balance")
        .in("status", ["pending", "partial", "overdue"]);

      // Library fines
      const { data: libraryFines } = await supabase
        .from("library_fines")
        .select("fine_amount, paid_amount")
        .eq("status", "pending");

      // Total students
      const { count: studentCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Recent payments
      const { data: recentPayments } = await supabase
        .from("fee_payments")
        .select(`
          *,
          student:student_id (full_name, class, registration_number)
        `)
        .order("paid_at", { ascending: false })
        .limit(10);

      setStats({
        todayCollection: todayPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        monthCollection: monthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        yearCollection: yearPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        pendingDues: pendingFees?.reduce((sum, f) => sum + Number(f.balance || 0), 0) || 0,
        overdueFines: libraryFines?.reduce((sum, f) => sum + (Number(f.fine_amount) - Number(f.paid_amount || 0)), 0) || 0,
        totalStudents: studentCount || 0,
        recentPayments: recentPayments || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const paymentStatusData = [
    { name: "Collected", value: stats.monthCollection, color: "#10b981" },
    { name: "Pending", value: stats.pendingDues, color: "#f59e0b" },
    { name: "Fines", value: stats.overdueFines, color: "#ef4444" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Today's Collection</p>
                <p className="text-3xl font-bold mt-1">रू {stats.todayCollection.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Monthly Collection</p>
                <p className="text-3xl font-bold mt-1">रू {stats.monthCollection.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Pending Dues</p>
                <p className="text-3xl font-bold mt-1">रू {stats.pendingDues.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Library Fines</p>
                <p className="text-3xl font-bold mt-1">रू {stats.overdueFines.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Distribution</CardTitle>
            <CardDescription>This month's financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `रू ${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Year Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Year Summary</CardTitle>
            <CardDescription>Total collection this academic year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-4xl font-bold text-emerald-600">
                  रू {stats.yearCollection.toLocaleString()}
                </p>
                <p className="text-muted-foreground mt-2">Total Collected</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Active Students</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <Receipt className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                  <p className="text-2xl font-bold">{stats.recentPayments.length}</p>
                  <p className="text-xs text-muted-foreground">Recent Payments</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
            <CardDescription>Latest fee collections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.recentPayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent payments</p>
              ) : (
                stats.recentPayments.slice(0, 5).map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{payment.student?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.student?.class} | {payment.receipt_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">रू {Number(payment.amount).toLocaleString()}</p>
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

      {/* Alerts */}
      {(stats.pendingDues > 50000 || stats.overdueFines > 5000) && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Financial Alerts</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {stats.pendingDues > 50000 && `High pending dues: रू ${stats.pendingDues.toLocaleString()}. `}
                  {stats.overdueFines > 5000 && `Uncollected library fines: रू ${stats.overdueFines.toLocaleString()}.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountantOverview;