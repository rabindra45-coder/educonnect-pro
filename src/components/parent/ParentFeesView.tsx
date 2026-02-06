import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Wallet, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const ParentFeesView = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchChildren();
  }, [user]);

  useEffect(() => {
    if (selectedChild) fetchFeeData();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const { data: parentData } = await supabase.from("parents").select("id").eq("user_id", user!.id).maybeSingle();
      if (!parentData) { setIsLoading(false); return; }
      const { data: links } = await supabase.from("parent_students").select("student_id").eq("parent_id", parentData.id);
      const ids = links?.map((l) => l.student_id) || [];
      if (ids.length === 0) { setIsLoading(false); return; }
      const { data: students } = await supabase.from("students").select("id, full_name, class").in("id", ids);
      setChildren(students || []);
      if (students && students.length > 0) setSelectedChild(students[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeeData = async () => {
    try {
      const [feesRes, paymentsRes] = await Promise.all([
        supabase.from("student_fees").select("*, fee_structure:fee_structure_id(fee_type, frequency)").eq("student_id", selectedChild).order("due_date", { ascending: false }),
        supabase.from("fee_payments").select("*").eq("student_id", selectedChild).order("paid_at", { ascending: false }).limit(20),
      ]);
      setFees(feesRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
  }

  const totalDue = fees.reduce((sum, f) => sum + Number(f.balance || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);
  const overdueCount = fees.filter((f) => f.status === "overdue").length;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { color: string; icon: any }> = {
      paid: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      pending: { color: "bg-amber-100 text-amber-700", icon: Clock },
      partial: { color: "bg-blue-100 text-blue-700", icon: Clock },
      overdue: { color: "bg-red-100 text-red-700", icon: AlertTriangle },
    };
    return styles[status] || { color: "bg-gray-100 text-gray-600", icon: Clock };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Fees & Finance</h1>
          <p className="text-muted-foreground">Track fee payments and outstanding dues</p>
        </div>
        {children.length > 1 && (
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select child" /></SelectTrigger>
            <SelectContent>
              {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-5">
            <CheckCircle className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-green-100 text-sm">Total Paid</p>
            <p className="text-3xl font-bold">रू {totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-5">
            <Wallet className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-amber-100 text-sm">Balance Due</p>
            <p className="text-3xl font-bold">रू {totalDue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className={`text-white ${overdueCount > 0 ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-teal-500 to-teal-600"}`}>
          <CardContent className="p-5">
            <AlertTriangle className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-white/80 text-sm">Overdue Fees</p>
            <p className="text-3xl font-bold">{overdueCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fee Details</CardTitle>
          <CardDescription>All fee records for the selected child</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No fee records</TableCell></TableRow>
                ) : (
                  fees.map((fee) => {
                    const statusInfo = getStatusBadge(fee.status);
                    return (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium capitalize text-sm">{fee.fee_structure?.fee_type?.replace(/_/g, " ") || "-"}</TableCell>
                        <TableCell className="text-sm">{fee.month_year || fee.fee_structure?.frequency || "-"}</TableCell>
                        <TableCell>रू {Number(fee.amount).toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">रू {Number(fee.paid_amount || 0).toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-red-600">रू {Number(fee.balance || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs capitalize ${statusInfo.color}`}>{fee.status}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Receipt: {p.receipt_number || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.paid_at).toLocaleDateString()} • {p.payment_method}</p>
                  </div>
                  <p className="font-bold text-green-600">रू {Number(p.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentFeesView;
