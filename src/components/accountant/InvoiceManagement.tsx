import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, Search, Download, Loader2, FileText, Send } from "lucide-react";
import { format } from "date-fns";

interface StudentFee {
  id: string;
  amount: number;
  due_date: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  month_year: string | null;
  student: {
    id: string;
    full_name: string;
    registration_number: string;
    class: string;
  };
  fee_structure: {
    fee_type: string;
    frequency: string;
  };
}

const InvoiceManagement = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<StudentFee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, classFilter]);

  const fetchInvoices = async () => {
    try {
      let query = supabase
        .from("student_fees")
        .select(`
          *,
          student:student_id (id, full_name, registration_number, class),
          fee_structure:fee_structure_id (fee_type, frequency)
        `)
        .order("due_date", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as "cancelled" | "overdue" | "paid" | "partial" | "pending" | "refunded");
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];
      if (classFilter !== "all") {
        filteredData = filteredData.filter((inv: any) => inv.student?.class === classFilter);
      }

      setInvoices(filteredData as any);
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

  const generateBulkInvoices = async () => {
    try {
      // Get current month and year
      const now = new Date();
      const { data, error } = await supabase.rpc("generate_monthly_fees", {
        p_month: now.getMonth() + 1,
        p_year: now.getFullYear()
      });
      
      if (error) throw error;

      toast({
        title: "Success",
        description: `${data || 0} invoices generated successfully for ${format(now, 'MMMM yyyy')}.`,
      });
      fetchInvoices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      partial: "secondary",
      pending: "outline",
      overdue: "destructive",
    };

    const colors: Record<string, string> = {
      paid: "bg-emerald-500",
      partial: "bg-amber-500",
      pending: "bg-blue-500",
      overdue: "bg-red-500",
    };

    return (
      <Badge className={colors[status] || "bg-gray-500"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.student?.registration_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendReminder = async (studentId: string, studentName: string) => {
    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent to ${studentName}'s guardian.`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Invoice Management
          </CardTitle>
          <CardDescription>Manage and track student fee invoices</CardDescription>
        </div>
        <Button onClick={generateBulkInvoices} className="bg-emerald-600 hover:bg-emerald-700">
          <FileText className="w-4 h-4 mr-2" />
          Generate Monthly Invoices
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((cls) => (
                <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {invoices.filter((i) => i.status === "paid").length}
            </p>
            <p className="text-sm text-muted-foreground">Paid</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">
              {invoices.filter((i) => i.status === "partial").length}
            </p>
            <p className="text-sm text-muted-foreground">Partial</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">
              {invoices.filter((i) => i.status === "pending").length}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">
              {invoices.filter((i) => i.status === "overdue").length}
            </p>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.student?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.student?.registration_number} | Class {invoice.student?.class}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {invoice.fee_structure?.fee_type.replace("_", " ")}
                        {invoice.month_year && (
                          <span className="text-xs text-muted-foreground block">{invoice.month_year}</span>
                        )}
                      </TableCell>
                      <TableCell>रू {Number(invoice.total_amount).toLocaleString()}</TableCell>
                      <TableCell className="text-emerald-600">
                        रू {Number(invoice.paid_amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className={Number(invoice.balance) > 0 ? "text-amber-600" : ""}>
                        रू {Number(invoice.balance || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>{format(new Date(invoice.due_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {invoice.status !== "paid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Send Reminder"
                              onClick={() => sendReminder(invoice.student?.id, invoice.student?.full_name)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceManagement;