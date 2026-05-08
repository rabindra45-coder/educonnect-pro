import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2, Mail } from "lucide-react";
import GlassAuthShell from "@/components/auth/GlassAuthShell";
import ForgotPasswordDialog from "@/components/auth/ForgotPasswordDialog";

const ParentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const { data: roleData, error: roleError } = await supabase.
      from("user_roles").
      select("role").
      eq("user_id", data.user.id).
      eq("role", "parent");

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the parent portal.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Welcome!",
        description: "Successfully logged in to Parent Portal."
      });
      navigate("/parent");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassAuthShell
      accent="from-teal-500 via-emerald-500 to-cyan-600"
      title="Parent Portal"
      subtitle="Monitor your child's academic journey"
      icon={<Users className="w-6 h-6" />}
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <ForgotPasswordDialog defaultEmail={email} portalLabel="Parent Portal" />
        </div>
        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login to Parent Portal"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-white/20 text-center">
        <p className="text-xs text-white/80">
          Only authorized parents/guardians can access this portal.
        </p>
      </div>
    </GlassAuthShell>
  );
};

export default ParentLogin;