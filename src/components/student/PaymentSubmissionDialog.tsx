import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, CheckCircle, AlertCircle, QrCode } from "lucide-react";

interface PaymentQR {
  id: string;
  gateway: string;
  gateway_name: string;
  qr_image_url: string;
  account_name: string | null;
  account_number: string | null;
  instructions: string | null;
}

interface StudentFee {
  id: string;
  amount: number;
  balance: number;
  fee_structures: {
    fee_type: string;
  };
}

interface PaymentSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee: StudentFee | null;
  studentId: string;
  onSuccess: () => void;
}

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

const PaymentSubmissionDialog = ({
  open,
  onOpenChange,
  fee,
  studentId,
  onSuccess,
}: PaymentSubmissionDialogProps) => {
  const [qrCodes, setQrCodes] = useState<PaymentQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [remarks, setRemarks] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchQRCodes();
    }
  }, [open]);

  const fetchQRCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payment_qr_codes")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setQrCodes(data);
      if (data.length > 0) {
        setSelectedGateway(data[0].gateway);
      }
    }
    setLoading(false);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);
    const fileName = `payment_${studentId}_${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .upload(`screenshots/${fileName}`, file);

    if (error) {
      toast({ title: "Error uploading screenshot", variant: "destructive" });
    } else {
      const { data: publicUrl } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(`screenshots/${fileName}`);
      setScreenshotUrl(publicUrl.publicUrl);
      toast({ title: "Screenshot uploaded successfully" });
    }
    setUploadingScreenshot(false);
  };

  const handleSubmit = async () => {
    if (!fee || !selectedGateway) {
      toast({ title: "Please select a payment method", variant: "destructive" });
      return;
    }

    if (!transactionId && !screenshotUrl) {
      toast({
        title: "Please provide transaction ID or screenshot",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("payment_verification_requests").insert({
      student_fee_id: fee.id,
      student_id: studentId,
      gateway: selectedGateway,
      amount: fee.balance,
      transaction_id: transactionId || null,
      screenshot_url: screenshotUrl || null,
      remarks: remarks || null,
    });

    if (error) {
      console.error("Error submitting payment:", error);
      toast({ title: "Error submitting payment verification", variant: "destructive" });
    } else {
      toast({
        title: "Payment submitted for verification!",
        description: "You will be notified once your payment is verified.",
      });
      onSuccess();
      resetForm();
      onOpenChange(false);
    }

    setSubmitting(false);
  };

  const resetForm = () => {
    setTransactionId("");
    setScreenshotUrl("");
    setRemarks("");
  };

  const selectedQR = qrCodes.find((qr) => qr.gateway === selectedGateway);

  if (!fee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Pay Fee Online
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Fee Details */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <Badge variant="outline">
                  {feeTypeLabels[fee.fee_structures.fee_type]}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Fee to pay</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  रू {fee.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : qrCodes.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <p className="text-muted-foreground">
                No payment methods available. Please contact the school office.
              </p>
            </div>
          ) : (
            <>
              {/* Payment Method Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Select Payment Method
                </Label>
                <Tabs value={selectedGateway} onValueChange={setSelectedGateway}>
                  <TabsList className="grid grid-cols-4 w-full">
                    {qrCodes.map((qr) => (
                      <TabsTrigger
                        key={qr.gateway}
                        value={qr.gateway}
                        className="text-xs"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1 ${
                            gatewayColors[qr.gateway] || "bg-gray-500"
                          }`}
                        />
                        {qr.gateway_name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* QR Code Display */}
              {selectedQR && (
                <div className="border rounded-lg p-4 text-center">
                  <p className="text-sm font-medium mb-2">
                    Scan this QR code with {selectedQR.gateway_name}
                  </p>
                  <img
                    src={selectedQR.qr_image_url}
                    alt={`${selectedQR.gateway_name} QR Code`}
                    className="mx-auto max-w-[200px] rounded-lg border"
                  />
                  {selectedQR.account_name && (
                    <p className="text-sm mt-3">
                      <span className="text-muted-foreground">Account:</span>{" "}
                      {selectedQR.account_name}
                    </p>
                  )}
                  {selectedQR.account_number && (
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block mt-1">
                      {selectedQR.account_number}
                    </p>
                  )}
                  {selectedQR.instructions && (
                    <p className="text-xs text-muted-foreground mt-3 bg-yellow-50 p-2 rounded">
                      {selectedQR.instructions}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Proof Section */}
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  After payment, submit proof below
                </p>

                <div>
                  <Label>Transaction ID</Label>
                  <Input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID from payment receipt"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Payment Screenshot</Label>
                  <div className="mt-2">
                    {screenshotUrl ? (
                      <div className="relative">
                        <img
                          src={screenshotUrl}
                          alt="Payment screenshot"
                          className="w-full max-h-40 object-contain rounded-lg border"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setScreenshotUrl("")}
                        >
                          Remove Screenshot
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingScreenshot ? (
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Upload payment screenshot
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          disabled={uploadingScreenshot}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Additional Remarks (Optional)</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Any additional information..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={submitting || (!transactionId && !screenshotUrl)}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Payment for Verification"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your payment will be verified by the school finance office. You will
                receive a notification once it's approved.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSubmissionDialog;
