import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QRLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = "scan" | "authenticating";

const QR_REGION_ID = "qr-login-reader";

const QRLoginDialog = ({ open, onOpenChange, onSuccess }: QRLoginDialogProps) => {
  const [step, setStep] = useState<Step>("scan");
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("Signing you in...");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || step !== "scan") return;
    let active = true;

    const start = async () => {
      try {
        await new Promise((r) => setTimeout(r, 100));
        if (!active) return;
        const instance = new Html5Qrcode(QR_REGION_ID, { verbose: false });
        scannerRef.current = instance;
        startedRef.current = true;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decoded) => {
            if (!active) return;
            await handleScan(decoded);
          },
          () => {}
        );
      } catch (err: any) {
        console.error("QR start error:", err);
        if (active) setError("Could not access camera. Please allow camera permissions.");
      }
    };

    start();

    return () => {
      active = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const stopScanner = () => {
    const inst = scannerRef.current;
    if (inst && startedRef.current) {
      inst.stop().then(() => inst.clear()).catch(() => {});
      startedRef.current = false;
    }
  };

  const handleScan = async (decoded: string) => {
    try {
      const match = decoded.match(/\/verify\/([0-9a-f-]{36})/i);
      const studentId = match ? match[1] : null;
      if (!studentId) {
        setError("Invalid QR code. Please scan your school ID card.");
        return;
      }

      stopScanner();
      setError(null);
      setStep("authenticating");
      setStatusMsg("Verifying ID card...");

      // Get a magic-link token from the edge function
      const { data, error: fnErr } = await supabase.functions.invoke("qr-login", {
        body: { studentId },
      });

      if (fnErr || !data?.token_hash || !data?.email) {
        console.error("qr-login error:", fnErr, data);
        setError(data?.error || "Could not log you in with this ID card.");
        setStep("scan");
        return;
      }

      setStatusMsg(`Signing in as ${data.full_name}...`);

      // Exchange token for a session
      const { error: otpErr } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: data.token_hash,
      });

      if (otpErr) {
        console.error("verifyOtp error:", otpErr);
        setError("Login token expired. Please try again.");
        setStep("scan");
        return;
      }

      // Log the login
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.functions.invoke("log-login", {
            body: {
              userId: user.id,
              email: data.email,
              fullName: data.full_name,
              loginMethod: "qr",
              userAgent: navigator.userAgent,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          });
        }
      } catch (e) {
        console.error("log-login error:", e);
      }

      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.full_name}`,
      });
      onSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Failed to process QR code.");
      setStep("scan");
    }
  };

  const handleClose = () => {
    stopScanner();
    setStep("scan");
    setError(null);
    onOpenChange(false);
  };

  const restartScan = () => {
    setError(null);
    setStep("scan");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-primary" />
            QR Code Login
          </DialogTitle>
          <DialogDescription>
            {step === "scan" && "Hold your Student ID card so the QR code is visible to the camera."}
            {step === "authenticating" && statusMsg}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {step === "scan" && (
          <div className="space-y-3">
            <div
              id={QR_REGION_ID}
              className="w-full rounded-lg overflow-hidden bg-black aspect-square border border-border"
            />
            <p className="text-xs text-muted-foreground text-center">
              Tip: ensure good lighting and hold the card steady ~15cm from the camera.
            </p>
            {error && (
              <Button variant="outline" className="w-full" onClick={restartScan}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Try Again
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        )}

        {step === "authenticating" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{statusMsg}</p>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="w-3 h-3" /> Secure login in progress
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QRLoginDialog;
