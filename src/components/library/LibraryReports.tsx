import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, Loader2, Book, Users, AlertTriangle, IndianRupee, TrendingUp } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const LibraryReports = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [mostIssuedBooks, setMostIssuedBooks] = useState<any[]>([]);
  const [monthlyIssues, setMonthlyIssues] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [fineCollection, setFineCollection] = useState<any[]>([]);
  const [overdueReport, setOverdueReport] = useState<any[]>([]);
  const [memberActivity, setMemberActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Most issued books
      const { data: issuesData } = await supabase
        .from("book_issues")
        .select("book_id, book:book_id (title, author)");

      const bookCounts: Record<string, { title: string; author: string; count: number }> = {};
      issuesData?.forEach((issue: any) => {
        const bookId = issue.book_id;
        if (!bookCounts[bookId]) {
          bookCounts[bookId] = {
            title: issue.book?.title || "Unknown",
            author: issue.book?.author || "Unknown",
            count: 0,
          };
        }
        bookCounts[bookId].count++;
      });

      const topBooks = Object.values(bookCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setMostIssuedBooks(topBooks);

      // Monthly issues trend
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
        const end = format(endOfMonth(monthDate), "yyyy-MM-dd");

        const { count: issues } = await supabase
          .from("book_issues")
          .select("*", { count: "exact", head: true })
          .gte("issue_date", start)
          .lte("issue_date", end);

        const { count: returns } = await supabase
          .from("book_issues")
          .select("*", { count: "exact", head: true })
          .gte("return_date", start)
          .lte("return_date", end);

        monthlyData.push({
          month: format(monthDate, "MMM"),
          issues: issues || 0,
          returns: returns || 0,
        });
      }
      setMonthlyIssues(monthlyData);

      // Category distribution
      const { data: booksData } = await supabase.from("books").select("category, total_copies");
      const categoryCounts: Record<string, number> = {};
      booksData?.forEach((book) => {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + book.total_copies;
      });
      setCategoryDistribution(
        Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
      );

      // Fine collection by month
      const fineData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
        const end = format(endOfMonth(monthDate), "yyyy-MM-dd");

        const { data: fines } = await supabase
          .from("library_fines")
          .select("paid_amount")
          .gte("paid_date", start)
          .lte("paid_date", end);

        const total = fines?.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0) || 0;
        fineData.push({
          month: format(monthDate, "MMM"),
          amount: total,
        });
      }
      setFineCollection(fineData);

      // Overdue report
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: overdueData } = await supabase
        .from("book_issues")
        .select(`
          id,
          due_date,
          issue_date,
          book:book_id (title),
          student:student_id (full_name, class)
        `)
        .eq("status", "issued")
        .lt("due_date", today)
        .order("due_date")
        .limit(20);
      setOverdueReport(overdueData || []);

      // Member activity
      const { data: activityData } = await supabase
        .from("book_issues")
        .select("student_id, student:student_id (full_name, class)")
        .eq("status", "issued");

      const memberCounts: Record<string, { name: string; class: string; count: number }> = {};
      activityData?.forEach((issue: any) => {
        const id = issue.student_id;
        if (!memberCounts[id]) {
          memberCounts[id] = {
            name: issue.student?.full_name || "Unknown",
            class: issue.student?.class || "",
            count: 0,
          };
        }
        memberCounts[id].count++;
      });

      setMemberActivity(
        Object.values(memberCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      );
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

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

    toast({ title: "Success", description: "Report exported successfully." });
  };

  const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Library Reports & Analytics
          </CardTitle>
          <CardDescription>Comprehensive library usage insights</CardDescription>
        </div>
        <Button variant="outline" onClick={() => exportToCSV(overdueReport.map(r => ({
          Student: r.student?.full_name,
          Class: r.student?.class,
          Book: r.book?.title,
          DueDate: r.due_date
        })), "overdue-report")}>
          <Download className="w-4 h-4 mr-2" />
          Export Overdue
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">Popular Books</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="fines">Fines</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monthly Issues & Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyIssues}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="issues" name="Issues" fill="#f59e0b" />
                        <Bar dataKey="returns" name="Returns" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Books by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {categoryDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="books">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Most Issued Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mostIssuedBooks} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="title" type="category" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Times Issued" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Overdue Books ({overdueReport.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {overdueReport.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No overdue books!</p>
                  ) : (
                    <div className="space-y-2">
                      {overdueReport.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.student?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Class {item.student?.class} | {item.book?.title}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-red-600">
                              Due: {format(new Date(item.due_date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fines">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Fine Collection Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fineCollection}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `रू${v}`} />
                      <Tooltip formatter={(value: number) => `रू ${value}`} />
                      <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Most Active Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {memberActivity.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">Class {member.class}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{member.count}</p>
                        <p className="text-xs text-muted-foreground">books borrowed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LibraryReports;
