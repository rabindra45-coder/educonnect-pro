import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, Search, Loader2, Check, X, Download, Send } from "lucide-react";
import { format } from "date-fns";
import { toPng } from "html-to-image";
import schoolLogo from "@/assets/logo.png";

interface Fine {
  id: string;
  fine_amount: number;
  fine_reason: string;
  days_overdue: number;
  status: string;
  paid_date: string | null;
  paid_amount: number;
  created_at: string;
  book_issue: {
    book: { title: string; author: string };
    issue_date: string;
    due_date: string;
    return_date: string;
  };
  student: {
    id: string;
    full_name: string;
    registration_number: string;
    class: string;
    guardian_email: string | null;
  };
}

interface LibraryFinesProps {
  onFineUpdate: () => void;
}

const LibraryFines = ({ onFineUpdate }: LibraryFinesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isWaiveDialogOpen, setIsWaiveDialogOpen] = useState(false);
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [waiveReason, setWaiveReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const billRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      const { data, error } = await supabase
        .from("library_fines")
        .select(`
          *,
          book_issue:book_issue_id (
            issue_date,
            due_date,
            return_date,
            book:book_id (title, author)
          ),
          student:student_id (id, full_name, registration_number, class, guardian_email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFines(data as any || []);
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

  const handlePayFine = async () => {
    if (!selectedFine || !payAmount) return;

    setIsProcessing(true);
    try {
      const amount = parseFloat(payAmount);
      const newPaidAmount = selectedFine.paid_amount + amount;
      const isPaidInFull = newPaidAmount >= selectedFine.fine_amount;

      const { error } = await supabase
        .from("library_fines")
        .update({
          paid_amount: newPaidAmount,
          status: isPaidInFull ? "paid" : "pending",
          paid_date: isPaidInFull ? format(new Date(), "yyyy-MM-dd") : null,
        })
        .eq("id", selectedFine.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment of रू ${amount} recorded successfully.`,
      });

      setIsPayDialogOpen(false);
      setPayAmount("");
      fetchFines();
      onFineUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWaiveFine = async () => {
    if (!selectedFine || !waiveReason) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("library_fines")
        .update({
          status: "waived",
          waived_by: user?.id,
          waive_reason: waiveReason,
        })
        .eq("id", selectedFine.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fine waived successfully.",
      });

      setIsWaiveDialogOpen(false);
      setWaiveReason("");
      fetchFines();
      onFineUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendBill = async (fine: Fine) => {
    if (!fine.student.guardian_email) {
      toast({
        title: "No Email",
        description: "Student's guardian email is not available.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: fine.student.guardian_email,
          subject: `Library Fine Notice - ${fine.student.full_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a365d;">Library Fine Notice</h2>
              <p>Dear Parent/Guardian,</p>
              <p>This is to inform you that your ward <strong>${fine.student.full_name}</strong> (${fine.student.registration_number}) has an outstanding library fine.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f7fafc;">
                  <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Book Title</strong></td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${fine.book_issue.book.title}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Reason</strong></td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${fine.fine_reason}</td>
                </tr>
                <tr style="background-color: #f7fafc;">
                  <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Days Overdue</strong></td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${fine.days_overdue} days</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Fine Amount</strong></td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; color: #c53030; font-weight: bold;">रू ${fine.fine_amount}</td>
                </tr>
              </table>
              
              <p>Please ensure the fine is cleared at the earliest convenience.</p>
              <p>Thank you,<br>Library Department<br>SDSJSS</p>
            </div>
          `,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fine notice sent to guardian's email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadBill = async () => {
    if (!billRef.current) return;

    try {
      const dataUrl = await toPng(billRef.current, { quality: 1.0, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `library-fine-${selectedFine?.student.registration_number}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download bill.",
        variant: "destructive",
      });
    }
  };

  const filteredFines = fines.filter((fine) => {
    const matchesSearch =
      fine.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fine.student?.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fine.book_issue?.book.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || fine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Library Fines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by student or book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "paid", "waived"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No fines found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFines.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{fine.student?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {fine.student?.registration_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{fine.book_issue?.book.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {fine.book_issue?.book.author}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {fine.fine_reason} ({fine.days_overdue} days)
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      रू {fine.fine_amount}
                    </TableCell>
                    <TableCell className="text-right">रू {fine.paid_amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          fine.status === "paid"
                            ? "default"
                            : fine.status === "waived"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {fine.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {fine.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Record Payment"
                            onClick={() => {
                              setSelectedFine(fine);
                              setPayAmount((fine.fine_amount - fine.paid_amount).toString());
                              setIsPayDialogOpen(true);
                            }}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Waive Fine"
                            onClick={() => {
                              setSelectedFine(fine);
                              setIsWaiveDialogOpen(true);
                            }}
                          >
                            <X className="w-4 h-4 text-orange-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="View/Download Bill"
                            onClick={() => {
                              setSelectedFine(fine);
                              setIsBillDialogOpen(true);
                            }}
                          >
                            <Receipt className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Send Bill to Guardian"
                            onClick={() => handleSendBill(fine)}
                            disabled={isProcessing}
                          >
                            <Send className="w-4 h-4 text-blue-600" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* Pay Dialog */}
        <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Fine Amount: <strong>रू {selectedFine?.fine_amount}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Already Paid: <strong>रू {selectedFine?.paid_amount}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Balance: <strong>रू {(selectedFine?.fine_amount || 0) - (selectedFine?.paid_amount || 0)}</strong>
                </p>
              </div>
              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <Input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePayFine} disabled={isProcessing}>
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Record Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Waive Dialog */}
        <Dialog open={isWaiveDialogOpen} onOpenChange={setIsWaiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Waive Fine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reason for Waiving</Label>
                <Textarea
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  placeholder="Enter reason for waiving the fine..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsWaiveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleWaiveFine} disabled={isProcessing || !waiveReason}>
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Waive Fine
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bill Dialog */}
        <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Library Fine Bill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Bill Template */}
              <div ref={billRef} className="bg-white p-6 border rounded-lg">
                <div className="text-center border-b pb-4 mb-4">
                  <img src={schoolLogo} alt="Logo" className="w-16 h-16 mx-auto mb-2" />
                  <h2 className="font-bold text-lg">Shree Durga Saraswati Janata Secondary School</h2>
                  <p className="text-sm text-gray-600">Library Department</p>
                  <p className="text-xs text-gray-500">Fine Receipt</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Student Name:</p>
                    <p className="font-medium">{selectedFine?.student.full_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Registration No:</p>
                    <p className="font-medium">{selectedFine?.student.registration_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Class:</p>
                    <p className="font-medium">{selectedFine?.student.class}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date:</p>
                    <p className="font-medium">{format(new Date(), "MMM d, yyyy")}</p>
                  </div>
                </div>

                <table className="w-full text-sm border-collapse mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">
                        <p className="font-medium">{selectedFine?.book_issue?.book.title}</p>
                        <p className="text-xs text-gray-500">{selectedFine?.fine_reason} ({selectedFine?.days_overdue} days)</p>
                      </td>
                      <td className="border p-2 text-right">रू {selectedFine?.fine_amount}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td className="border p-2 font-bold">Total Due</td>
                      <td className="border p-2 text-right font-bold text-red-600">
                        रू {(selectedFine?.fine_amount || 0) - (selectedFine?.paid_amount || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <p className="text-xs text-gray-500 text-center">
                  Please pay this amount at the library counter.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBillDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={downloadBill}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Bill
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LibraryFines;
