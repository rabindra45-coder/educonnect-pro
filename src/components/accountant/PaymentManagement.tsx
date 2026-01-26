import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Search, Download, Loader2, Plus, Receipt } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  paid_at: string;
  receipt_number: string;
  notes: string | null;
  student: {
    full_name: string;
    registration_number: string;
    class: string;
  };
  student_fee: {
    fee_structure: {
      fee_type: string;
    };
  };
}

const PaymentManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingFees, setPendingFees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    student_fee_id: "",
    amount: "",
    payment_method: "cash",
    notes: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchPendingFees();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("fee_payments")
        .select(`
          *,
          student:student_id (full_name, registration_number, class),
          student_fee:student_fee_id (
            fee_structure:fee_structure_id (fee_type)
          )
        `)
        .order("paid_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setPayments(data as any || []);
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

  const fetchPendingFees = async () => {
    try {
      const { data, error } = await supabase
        .from("student_fees")
        .select(`
          id,
          balance,
          total_amount,
          student:student_id (id, full_name, registration_number, class),
          fee_structure:fee_structure_id (fee_type)
        `)
        .in("status", ["pending", "partial", "overdue"])
        .gt("balance", 0);

      if (error) throw error;
      setPendingFees(data || []);
    } catch (error: any) {
      console.error("Error fetching pending fees:", error);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const selectedFee = pendingFees.find((f) => f.id === formData.student_fee_id);
      if (!selectedFee) throw new Error("Please select a fee invoice");

      const { error } = await supabase
        .from("fee_payments")
        .insert([{
          student_fee_id: formData.student_fee_id,
          student_id: selectedFee.student.id,
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method as "bank_transfer" | "cash" | "cheque" | "esewa" | "imepay" | "khalti",
          notes: formData.notes || null,
          received_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment recorded successfully.",
      });

      setIsDialogOpen(false);
      setFormData({
        student_fee_id: "",
        amount: "",
        payment_method: "cash",
        notes: "",
      });
      fetchPayments();
      fetchPendingFees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPayments = payments.filter((payment) =>
    payment.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.student?.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.receipt_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: "Cash",
      esewa: "eSewa",
      khalti: "Khalti",
      imepay: "IME Pay",
      bank_transfer: "Bank Transfer",
      cheque: "Cheque",
    };
    return methods[method] || method;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Management
          </CardTitle>
          <CardDescription>Record and track fee payments</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Invoice</Label>
                <Select
                  value={formData.student_fee_id}
                  onValueChange={(value) => {
                    const fee = pendingFees.find((f) => f.id === value);
                    setFormData({
                      ...formData,
                      student_fee_id: value,
                      amount: fee?.balance?.toString() || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select student invoice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingFees.map((fee) => (
                      <SelectItem key={fee.id} value={fee.id}>
                        {fee.student?.full_name} - Class {fee.student?.class} - 
                        {fee.fee_structure?.fee_type} (रू {fee.balance?.toLocaleString()} due)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (रू)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="esewa">eSewa</SelectItem>
                      <SelectItem value="khalti">Khalti</SelectItem>
                      <SelectItem value="imepay">IME Pay</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Record Payment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by student name, ID, or receipt number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
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
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.receipt_number || "-"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.student?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.student?.registration_number} | Class {payment.student?.class}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.student_fee?.fee_structure?.fee_type?.replace("_", " ") || "-"}
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        रू {Number(payment.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{getPaymentMethodLabel(payment.payment_method)}</TableCell>
                      <TableCell>{format(new Date(payment.paid_at), "MMM d, yyyy HH:mm")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Download Receipt">
                          <Receipt className="w-4 h-4" />
                        </Button>
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

export default PaymentManagement;