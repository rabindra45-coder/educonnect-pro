import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, CreditCard, Receipt, Download, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toPng } from "html-to-image";

interface StudentFeesCardProps {
  studentId: string;
  studentName: string;
  className: string;
}

interface StudentFee {
  id: string;
  amount: number;
  due_date: string;
  month_year: string | null;
  late_fee: number;
  discount: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: string;
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
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  partial: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
};

const feeTypeLabels: Record<string, string> = {
  admission: "Admission", tuition: "Tuition", exam: "Exam",
  library: "Library", sports: "Sports", computer: "Computer",
  transport: "Transport", uniform: "Uniform", other: "Other"
};

const StudentFeesCard = ({ studentId, studentName, className }: StudentFeesCardProps) => {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFees();
    fetchPayments();
  }, [studentId]);

  const fetchFees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_fees")
      .select(`
        *,
        fee_structures!inner(fee_type, frequency)
      `)
      .eq("student_id", studentId)
      .order("due_date", { ascending: false });

    if (!error) {
      setFees(data || []);
    }
    setLoading(false);
  };

  const fetchPayments = async () => {
    const { data } = await supabase
      .from("fee_payments")
      .select("*")
      .eq("student_id", studentId)
      .order("paid_at", { ascending: false });
    setPayments(data || []);
  };

  const initiateOnlinePayment = async (fee: StudentFee, gateway: "esewa" | "khalti" | "imepay") => {
    setIsPaymentProcessing(true);
    
    try {
      const response = await supabase.functions.invoke("initiate-payment", {
        body: {
          gateway,
          student_fee_id: fee.id,
          amount: fee.balance,
          student_name: studentName,
          fee_type: feeTypeLabels[fee.fee_structures.fee_type],
          return_url: window.location.href,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.success && response.data.payment_url) {
        // Redirect to payment gateway
        window.location.href = response.data.payment_url;
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const viewReceipt = (payment: Payment, fee: StudentFee) => {
    setSelectedPayment(payment);
    setSelectedFee(fee);
    setIsReceiptOpen(true);
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

  const totalDue = fees.filter(f => f.status !== "paid").reduce((s, f) => s + f.balance, 0);
  const totalPaid = fees.reduce((s, f) => s + f.paid_amount, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading fees...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">रू {totalDue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">रू {totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Payments Made
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Pending Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fees.filter(f => f.status !== "paid").length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>All fees are paid! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fees.filter(f => f.status !== "paid").map((fee) => (
                <div key={fee.id} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {feeTypeLabels[fee.fee_structures.fee_type]}
                        </Badge>
                        <Badge className={statusColors[fee.status]}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Due: {format(new Date(fee.due_date), "MMM dd, yyyy")}
                        {fee.month_year && ` | ${fee.month_year}`}
                      </p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span>Amount: रू {fee.amount.toLocaleString()}</span>
                        {fee.late_fee > 0 && (
                          <span className="text-red-600">Late Fee: रू {fee.late_fee.toLocaleString()}</span>
                        )}
                        {fee.discount > 0 && (
                          <span className="text-green-600">Discount: रू {fee.discount.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">रू {fee.balance.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Balance Due</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => initiateOnlinePayment(fee, "esewa")}
                          disabled={isPaymentProcessing}
                          className="text-xs"
                        >
                          eSewa
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => initiateOnlinePayment(fee, "khalti")}
                          disabled={isPaymentProcessing}
                          className="text-xs"
                        >
                          Khalti
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => initiateOnlinePayment(fee, "imepay")}
                          disabled={isPaymentProcessing}
                          className="text-xs"
                        >
                          IME Pay
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payment records yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const relatedFee = fees.find(f => 
                    fees.some(sf => sf.id === f.id)
                  );
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{format(new Date(payment.paid_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.receipt_number}</TableCell>
                      <TableCell className="capitalize">{payment.payment_method.replace("_", " ")}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        रू {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => relatedFee && viewReceipt(payment, relatedFee)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
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
                    <span>{studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class:</span>
                    <span>Class {className}</span>
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
                </div>
              </div>

              <Button onClick={downloadReceipt} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentFeesCard;
