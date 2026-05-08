import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Loader2, Mail, CheckCircle2 } from "lucide-react";

interface ForgotPasswordDialogProps {
  /** Optional pre-filled email */
  defaultEmail?: string;
  /** Custom trigger element. If omitted a default link-style button is rendered. */
  trigger?: React.ReactNode;
  /** Portal label shown in the dialog (e.g. "Admin Portal") */
  portalLabel?: string;
}

const ForgotPasswordDialog = ({
  defaultEmail = "",
  trigger,
  portalLabel,
}: ForgotPasswordDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Could not send reset link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setSent(true);
    toast({
      title: "Check your email",
      description: "If an account exists, a password reset link has been sent.",
    });
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSent(false);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="text-xs font-medium text-white/90 hover:text-white underline-offset-4 hover:underline transition"
          >
            Forgot password?
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            {sent ? <CheckCircle2 className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <DialogTitle className="text-center">
            {sent ? "Reset link sent" : "Reset your password"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {sent
              ? "We've emailed you a secure link to reset your password. The link expires in 1 hour."
              : `Enter the email associated with your ${
                  portalLabel ?? "account"
                }. We'll send you a verification link to set a new password.`}
          </DialogDescription>
        </DialogHeader>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@school.edu.np"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoFocus
                  required
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">Sent to:</p>
              <p className="text-muted-foreground break-all">{email}</p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Didn't receive it? Check spam, or wait a minute and try again.
            </p>
            <DialogFooter>
              <Button onClick={() => setOpen(false)} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
