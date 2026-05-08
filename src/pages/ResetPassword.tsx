import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import GlassAuthShell from "@/components/auth/GlassAuthShell";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Supabase establishes a recovery session automatically when the user lands
  // here from the email link. We just need to confirm a session exists.
  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        setReady(true);
      } else {
        // Wait for the auth state change emitted by the recovery hash
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" || session) {
            setReady(true);
          }
        });
        // Give it a moment, then surface an error if no session
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: d }) => {
            if (!d.session && active) {
              setError(
                "This password reset link is invalid or has expired. Please request a new one."
              );
            }
          });
        }, 1500);
        return () => sub.subscription.unsubscribe();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: "Passwords don't match",
        description: "Make sure both password fields are identical.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      toast({
        title: "Could not update password",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }
    setDone(true);
    toast({
      title: "Password updated",
      description: "You can now sign in with your new password.",
    });
    // Sign out so the user must log in fresh on the appropriate portal
    await supabase.auth.signOut();
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <GlassAuthShell
      accent="from-indigo-600 via-purple-600 to-pink-600"
      title="Reset Password"
      subtitle="Choose a new password for your account"
      icon={<ShieldCheck className="w-6 h-6" />}
    >
      {error ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-white">{error}</p>
          <Button
            onClick={() => navigate("/login")}
            className="w-full bg-white text-indigo-700 hover:bg-white/90"
          >
            Back to Login
          </Button>
        </div>
      ) : done ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-300/40 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-200" />
          </div>
          <p className="text-sm text-white/90">
            Your password has been updated. Redirecting to login...
          </p>
        </div>
      ) : !ready ? (
        <div className="flex items-center justify-center py-8 text-white/90">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Verifying reset link...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={show ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type={show ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-white text-indigo-700 hover:bg-white/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>

          <p className="text-[11px] text-white/70 text-center pt-2">
            For your security, you'll be signed out and asked to log in again.
          </p>
        </form>
      )}
    </GlassAuthShell>
  );
};

export default ResetPassword;
