import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface VerificationRequest {
  id: string;
  student_fee_id: string;
  student_id: string;
  gateway: string;
  amount: number;
  transaction_id: string | null;
  screenshot_url: string | null;
  remarks: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  students: {
    full_name: string;
    class: string;
    section: string | null;
    roll_number: number | null;
  };
  student_fees: {
    month_year: string | null;
    fee_structures: {
      fee_type: string;
    };
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const gatewayColors: Record<string, string> = {
  esewa: "bg-green-500",
  khalti: "bg-purple-500",
  imepay: "bg-red-500",
  bank_transfer: "bg-blue-500",
};

const feeTypeLabels: Record<string, string> = {
  admission: "Admission",
  tuition: "Tuition",
  exam: "Exam",
  library: "Library",
  sports: "Sports",
  computer: "Computer",
  transport: "Transport",
  uniform: "Uniform",
  other: "Other",
};

const PaymentVerificationManagement = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payment_verification_requests")
      .select(`
        *,
        students!inner(full_name, class, section, roll_number),
        student_fees!inner(month_year, fee_structures!inner(fee_type))
      `)
      .order("created_at", { ascending: false });

    if (!error) {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const handleAction = async () => {
    if (!selectedRequest || !user) return;
    if (actionType === "reject" && !rejectionReason.trim()) {
      toast({ title: "Please provide a rejection reason", variant: "destructive" });
      return;
    }

    setProcessing(true);

    if (actionType === "approve") {
      // Update verification request status
      const { error: updateError } = await supabase
        .from("payment_verification_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (updateError) {
        toast({ title: "Error approving payment", variant: "destructive" });
        setProcessing(false);
        return;
      }

      // Create fee payment record
      const { error: paymentError } = await supabase.from("fee_payments").insert({
        student_fee_id: selectedRequest.student_fee_id,
        student_id: selectedRequest.student_id,
        amount: selectedRequest.amount,
        payment_method: selectedRequest.gateway as any,
        transaction_id: selectedRequest.transaction_id,
        gateway_response: { verification_id: selectedRequest.id },
        received_by: user.id,
      });

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
        toast({
          title: "Payment approved but record creation failed",
          description: "Please create the payment record manually.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Payment approved successfully!" });
      }
    } else {
      // Reject the request
      const { error } = await supabase
        .from("payment_verification_requests")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (error) {
        toast({ title: "Error rejecting payment", variant: "destructive" });
      } else {
        toast({ title: "Payment request rejected" });
      }
    }

    setProcessing(false);
    setIsActionOpen(false);
    setRejectionReason("");
    fetchRequests();
  };

  const openActionDialog = (request: VerificationRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setIsActionOpen(true);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const rollNumber = req.students.roll_number?.toString() || "";
    const matchesSearch =
      req.students.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rollNumber.includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Payment Verification
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingCount} Pending
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Review and verify student payment submissions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requests.filter((r) => r.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {requests.filter((r) => r.status === "rejected").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, roll no, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No payment verification requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.students.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Class {request.students.class}-{request.students.section} | Roll:{" "}
                          {request.students.roll_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {feeTypeLabels[request.student_fees.fee_structures.fee_type]}
                      </Badge>
                      {request.student_fees.month_year && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.student_fees.month_year}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            gatewayColors[request.gateway] || "bg-gray-500"
                          }`}
                        />
                        <span className="capitalize">{request.gateway.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      रू {request.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {request.transaction_id || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[request.status]}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(request.created_at), "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => openActionDialog(request, "approve")}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={() => openActionDialog(request, "reject")}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Verification Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Student</p>
                  <p className="font-medium">{selectedRequest.students.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Class</p>
                  <p className="font-medium">
                    {selectedRequest.students.class}-{selectedRequest.students.section}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gateway</p>
                  <p className="font-medium capitalize">
                    {selectedRequest.gateway.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium text-lg">
                    रू {selectedRequest.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transaction ID</p>
                  <p className="font-mono">{selectedRequest.transaction_id || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedRequest.status]}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              {selectedRequest.remarks && (
                <div>
                  <p className="text-muted-foreground text-sm">Student Remarks</p>
                  <p className="text-sm bg-muted p-2 rounded">{selectedRequest.remarks}</p>
                </div>
              )}

              {selectedRequest.screenshot_url && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Payment Screenshot</p>
                  <img
                    src={selectedRequest.screenshot_url}
                    alt="Payment proof"
                    className="w-full max-h-80 object-contain rounded-lg border"
                  />
                </div>
              )}

              {selectedRequest.rejection_reason && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Rejection Reason: {selectedRequest.rejection_reason}
                  </p>
                </div>
              )}

              {selectedRequest.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setIsViewOpen(false);
                      openActionDialog(selectedRequest, "approve");
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setIsViewOpen(false);
                      openActionDialog(selectedRequest, "reject");
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Payment" : "Reject Payment"}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <span className="text-muted-foreground">Student:</span>{" "}
                  {selectedRequest.students.full_name}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Amount:</span> रू{" "}
                  {selectedRequest.amount.toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Gateway:</span>{" "}
                  {selectedRequest.gateway}
                </p>
              </div>

              {actionType === "approve" ? (
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to approve this payment? This will mark the fee as
                  paid and create a payment record.
                </p>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Please provide a reason for rejection:
                  </p>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Invalid transaction ID, Screenshot unclear..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={processing}
            >
              {processing ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentVerificationManagement;
