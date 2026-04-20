import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, Lock, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QRLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = "scan" | "confirm" | "authenticating";

interface ScannedStudent {
  id: string;
  full_name: string;
  registration_number: string;
  class: string;
  photo_url: string | null;
  email?: string | null;
}

const QR_REGION_ID = "qr-login-reader";

const QRLoginDialog = ({ open, onOpenChange, onSuccess }: QRLoginDialogProps) => {
  const [step, setStep] = useState<Step>("scan");
  const [error, setError] = useState<string | null>(null);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [student, setStudent] = useState<ScannedStudent | null>(null);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || step !== "scan") return;
    let active = true;
    let instance: Html5Qrcode | null = null;

    const start = async () => {
      try {
        // Wait for DOM
        await new Promise((r) => setTimeout(r, 100));
        if (!active) return;
        instance = new Html5Qrcode(QR_REGION_ID, { verbose: false });
        setScanner(instance);
        startedRef.current = true;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decoded) => {
            if (!active) return;
            await handleScan(decoded, instance!);
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
      if (instance && startedRef.current) {
        instance
          .stop()
          .then(() => instance!.clear())
          .catch(() => {});
        startedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const handleScan = async (decoded: string, inst: Html5Qrcode) => {
    try {
      // Expect URL like {origin}/verify/{studentId}
      const match = decoded.match(/\/verify\/([0-9a-f-]{36})/i);
      const studentId = match ? match[1] : null;
      if (!studentId) {
        setError("Invalid QR code. Please scan your school ID card.");
        return;
      }

      // Stop the scanner
      try {
        await inst.stop();
        await inst.clear();
        startedRef.current = false;
      } catch {}

      // Fetch student basic info (public RLS allows active students)
      const { data, error: fetchError } = await supabase
        .from("students")
        .select("id, full_name, registration_number, class, photo_url, user_id")
        .eq("id", studentId)
        .maybeSingle();

      if (fetchError || !data) {
        setError("Student not found or QR code expired.");
        return;
      }

      // Look up email via profiles
      let email: string | null = null;
      if (data.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", data.user_id)
          .maybeSingle();
        email = profile?.email ?? null;
      }

      setStudent({
        id: data.id,
        full_name: data.full_name,
        registration_number: data.registration_number,
        class: data.class,
        photo_url: data.photo_url,
        email,
      });
      setError(null);
      setStep("confirm");
    } catch (err) {
      console.error(err);
      setError("Failed to process QR code.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?.email) {
      setError("This student account is not yet linked to a login.");
      return;
    }
    if (password.length < 6) {
      setError("Please enter your password (min 6 characters).");
      return;
    }
    setSubmitting(true);
    setError(null);
    setStep("authenticating");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: student.email,
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError("Incorrect password. Please try again.");
      setStep("confirm");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.functions.invoke("log-login", {
          body: {
            userId: user.id,
            email: student.email,
            fullName: user.user_metadata?.full_name,
            loginMethod: "qr",
            userAgent: navigator.userAgent,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        });
      }
    } catch (err) {
      console.error("log-login error:", err);
    }

    toast({ title: "Welcome back!", description: `Logged in as ${student.full_name}` });
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    if (scanner && startedRef.current) {
      scanner.stop().then(() => scanner.clear()).catch(() => {});
      startedRef.current = false;
    }
    setStep("scan");
    setStudent(null);
    setPassword("");
    setError(null);
    onOpenChange(false);
  };

  const restartScan = () => {
    setStudent(null);
    setError(null);
    setPassword("");
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
            {step === "scan" && "Hold your Student ID card up so the QR code is visible to the camera."}
            {step === "confirm" && "Confirm it's you and enter your password."}
            {step === "authenticating" && "Signing you in..."}
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
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        )}

        {step === "confirm" && student && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.full_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {student.full_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{student.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {student.registration_number} · {student.class}
                </p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-green-600">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </div>
              </div>
            </div>

            {!student.email && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-700 dark:text-yellow-400">
                This student is not yet linked to a login account. Please contact the school office.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="qr-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="qr-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  autoFocus
                  disabled={!student.email}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={restartScan} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-1" /> Rescan
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting || !student.email}>
                Sign In
              </Button>
            </div>
          </form>
        )}

        {step === "authenticating" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying credentials...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QRLoginDialog;
