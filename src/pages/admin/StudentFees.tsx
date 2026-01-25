import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, DollarSign, AlertCircle, CheckCircle2, 
  Clock, Receipt, Download, Printer, CreditCard
} from "lucide-react";
import { toPng } from "html-to-image";
import { format } from "date-fns";

interface StudentFee {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  month_year: string | null;
  late_fee: number;
  discount: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: string;
  students: {
    full_name: string;
    registration_number: string;
    class: string;
    guardian_name: string | null;
  };
  fee_structures: {
    fee_type: string;
    frequency: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  receipt_number: string;
  paid_at: string;
  notes: string | null;
}

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "esewa", label: "eSewa" },
  { value: "khalti", label: "Khalti" },
  { value: "imepay", label: "IME Pay" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  partial: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
};

const StudentFees = () => {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_method: "cash" as string,
    notes: "",
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_fees")
      .select(`
        *,
        students!inner(full_name, registration_number, class, guardian_name),
        fee_structures!inner(fee_type, frequency)
      `)
      .order("due_date", { ascending: false });

    if (error) {
      toast({ title: "Error fetching fees", variant: "destructive" });
    } else {
      setFees(data || []);
    }
    setLoading(false);
  };

  const fetchPayments = async (studentFeeId: string) => {
    const { data } = await supabase
      .from("fee_payments")
      .select("*")
      .eq("student_fee_id", studentFeeId)
      .order("paid_at", { ascending: false });
    setPayments(data || []);
  };

  const openPaymentDialog = (fee: StudentFee) => {
    setSelectedFee(fee);
    setPaymentData({
      amount: fee.balance,
      payment_method: "cash",
      notes: "",
    });
    fetchPayments(fee.id);
    setIsPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedFee || paymentData.amount <= 0) {
      toast({ title: "Invalid payment amount", variant: "destructive" });
      return;
    }

    if (paymentData.amount > selectedFee.balance) {
      toast({ title: "Payment exceeds balance", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from("fee_payments")
      .insert([{
        student_fee_id: selectedFee.id,
        student_id: selectedFee.student_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method as any,
        notes: paymentData.notes || null,
      }])
      .select()
      .single();

    if (error) {
      toast({ title: "Error recording payment", variant: "destructive" });
    } else {
      toast({ title: "Payment recorded successfully" });
      setSelectedPayment(data);
      setIsPaymentDialogOpen(false);
      setIsReceiptDialogOpen(true);
      fetchFees();
    }
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `Receipt_${selectedPayment?.receipt_number || "payment"}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Receipt downloaded!" });
    } catch (error) {
      toast({ title: "Error downloading receipt", variant: "destructive" });
    }
  };

  const filteredFees = fees.filter((fee) => {
    const matchesSearch = 
      fee.students.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.students.registration_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || fee.status === filterStatus;
    const matchesClass = filterClass === "all" || fee.students.class === filterClass;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const totalPending = fees.filter(f => f.status === "pending" || f.status === "partial").reduce((s, f) => s + f.balance, 0);
  const totalCollected = fees.reduce((s, f) => s + f.paid_amount, 0);

  const getFeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      admission: "Admission", tuition: "Tuition", exam: "Exam",
      library: "Library", sports: "Sports", computer: "Computer",
      transport: "Transport", uniform: "Uniform", other: "Other"
    };
    return types[type] || type;
  };

  return (
    <>
      <Helmet>
        <title>Student Fees | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Fees & Payments</h1>
            <p className="text-muted-foreground">Track student fee payments and generate receipts</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">रू {totalCollected.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Pending Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">रू {totalPending.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fees.filter(f => f.status === "paid").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{fees.filter(f => f.status === "overdue").length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((c) => (
                  <SelectItem key={c} value={c}>Class {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fees Table */}
          <Card>
            <CardContent className="p-0">
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
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : filteredFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No student fees found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{fee.students.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {fee.students.registration_number} | Class {fee.students.class}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getFeeTypeLabel(fee.fee_structures.fee_type)}</Badge>
                        </TableCell>
                        <TableCell>रू {fee.total_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">रू {fee.paid_amount.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold text-orange-600">रू {fee.balance.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(fee.due_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[fee.status] || "bg-gray-100"}>
                            {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {fee.status !== "paid" && (
                            <Button size="sm" onClick={() => openPaymentDialog(fee)}>
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pay
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              {selectedFee && (
                <div className="space-y-4 pt-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-semibold">{selectedFee.students.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {getFeeTypeLabel(selectedFee.fee_structures.fee_type)} Fee
                    </p>
                    <div className="mt-2 flex justify-between">
                      <span>Balance Due:</span>
                      <span className="font-bold text-orange-600">रू {selectedFee.balance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Payment Amount (रू)</Label>
                    <Input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                      max={selectedFee.balance}
                    />
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <Select
                      value={paymentData.payment_method}
                      onValueChange={(v) => setPaymentData({ ...paymentData, payment_method: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                      placeholder="Transaction ID, remarks, etc."
                    />
                  </div>

                  {payments.length > 0 && (
                    <div>
                      <Label>Previous Payments</Label>
                      <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                        {payments.map((p) => (
                          <div key={p.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                            <span>{format(new Date(p.paid_at), "MMM dd, yyyy")}</span>
                            <span className="font-medium">रू {p.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handlePayment} className="w-full">
                    <Receipt className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Receipt Dialog */}
          <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Payment Receipt</DialogTitle>
              </DialogHeader>
              {selectedPayment && selectedFee && (
                <div className="space-y-4">
                  <div ref={receiptRef} className="bg-white p-6 border rounded-lg">
                    <div className="text-center border-b pb-4 mb-4">
                      <h2 className="text-lg font-bold">Shree Durga Saraswati Janata Secondary School</h2>
                      <p className="text-sm text-muted-foreground">Dumarwana, Saptari, Nepal</p>
                      <p className="text-xs mt-2 font-medium">PAYMENT RECEIPT</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Receipt No:</span>
                        <span className="font-medium">{selectedPayment.receipt_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{format(new Date(selectedPayment.paid_at), "PPP")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Student:</span>
                        <span>{selectedFee.students.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Class:</span>
                        <span>Class {selectedFee.students.class}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fee Type:</span>
                        <span>{getFeeTypeLabel(selectedFee.fee_structures.fee_type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span className="capitalize">{selectedPayment.payment_method.replace("_", " ")}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Amount Paid:</span>
                        <span className="text-green-600">रू {selectedPayment.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
                      <p>Thank you for your payment!</p>
                      <p className="mt-1">This is a computer-generated receipt.</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={downloadReceipt} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={() => window.print()} className="flex-1">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </>
  );
};

export default StudentFees;
