import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const FinancialReports = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState("collection");
  const [periodFilter, setPeriodFilter] = useState("monthly");
  
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [classWiseData, setClassWiseData] = useState<any[]>([]);
  const [feeTypeData, setFeeTypeData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [reportType, periodFilter]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Fetch last 6 months of payment data
      const monthsData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
        const end = format(endOfMonth(monthDate), "yyyy-MM-dd");

        const { data: payments } = await supabase
          .from("fee_payments")
          .select("amount")
          .gte("paid_at", start)
          .lte("paid_at", end);

        const { data: expenses } = await supabase
          .from("school_expenses")
          .select("amount")
          .gte("expense_date", start)
          .lte("expense_date", end);

        monthsData.push({
          month: format(monthDate, "MMM"),
          collection: payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
          expenses: expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0,
        });
      }
      setCollectionData(monthsData);

      // Expense by category
      const { data: expenseCategories } = await supabase
        .from("school_expenses")
        .select("category, amount");

      const categoryTotals: Record<string, number> = {};
      expenseCategories?.forEach((exp) => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
      });
      setExpenseData(
        Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))
      );

      // Class-wise collection
      const { data: classPayments } = await supabase
        .from("fee_payments")
        .select(`
          amount,
          student:student_id (class)
        `);

      const classTotals: Record<string, number> = {};
      classPayments?.forEach((payment: any) => {
        const cls = payment.student?.class || "Unknown";
        classTotals[cls] = (classTotals[cls] || 0) + Number(payment.amount);
      });
      setClassWiseData(
        Object.entries(classTotals)
          .map(([name, value]) => ({ name: `Class ${name}`, value }))
          .sort((a, b) => parseInt(a.name.replace("Class ", "")) - parseInt(b.name.replace("Class ", "")))
      );

      // Fee type breakdown
      const { data: feeTypePayments } = await supabase
        .from("fee_payments")
        .select(`
          amount,
          student_fee:student_fee_id (
            fee_structure:fee_structure_id (fee_type)
          )
        `);

      const feeTypeTotals: Record<string, number> = {};
      feeTypePayments?.forEach((payment: any) => {
        const feeType = payment.student_fee?.fee_structure?.fee_type || "Other";
        feeTypeTotals[feeType] = (feeTypeTotals[feeType] || 0) + Number(payment.amount);
      });
      setFeeTypeData(
        Object.entries(feeTypeTotals).map(([name, value]) => ({ 
          name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "), 
          value 
        }))
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    
    toast({
      title: "Export Successful",
      description: `${filename} exported to CSV.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Financial Reports & Analytics
            </CardTitle>
            <CardDescription>Comprehensive financial insights and export options</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportToCSV(collectionData, "collection-report")}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="collection">Collection Trend</TabsTrigger>
              <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
              <TabsTrigger value="classwise">Class-wise</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Collection vs Expenses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Collection vs Expenses (Last 6 Months)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={collectionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value: number) => `रू ${value.toLocaleString()}`} />
                          <Legend />
                          <Bar dataKey="collection" name="Collection" fill="#10b981" />
                          <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Type Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Collection by Fee Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={feeTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {feeTypeData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `रू ${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="collection">
              <Card>
                <CardContent className="pt-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={collectionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => `रू ${value.toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="collection" name="Collection" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses">
              <Card>
                <CardContent className="pt-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {expenseData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `रू ${value.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classwise">
              <Card>
                <CardContent className="pt-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classWiseData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value: number) => `रू ${value.toLocaleString()}`} />
                        <Bar dataKey="value" name="Collection" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;