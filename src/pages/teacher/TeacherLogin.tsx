import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2, Mail, Phone, User } from "lucide-react";
import GlassAuthShell from "@/components/auth/GlassAuthShell";
import ForgotPasswordDialog from "@/components/auth/ForgotPasswordDialog";

const TeacherLogin = () => {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone" | "staffId">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let loginEmail = email;

      // If using staff ID or phone, we need to look up the email first
      if (loginMethod === "staffId" && staffId) {
        const { data: teacherData, error: teacherError } = await supabase.
        from("teachers").
        select("email").
        eq("employee_id", staffId).
        maybeSingle();

        if (teacherError || !teacherData?.email) {
          throw new Error("Staff ID not found. Please check your credentials.");
        }
        loginEmail = teacherData.email;
      } else if (loginMethod === "phone" && phone) {
        const { data: teacherData, error: teacherError } = await supabase.
        from("teachers").
        select("email").
        eq("phone", phone).
        maybeSingle();

        if (teacherError || !teacherData?.email) {
          throw new Error("Phone number not found. Please check your credentials.");
        }
        loginEmail = teacherData.email;
      }

      if (!loginEmail) {
        throw new Error("Please provide valid credentials.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      });

      if (error) throw error;

      // Check if user has teacher role
      const { data: roleData, error: roleError } = await supabase.
      from("user_roles").
      select("role").
      eq("user_id", data.user.id).
      in("role", ["super_admin", "admin", "teacher"]);

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the teacher portal.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Welcome!",
        description: "Successfully logged in to Teacher Portal."
      });
      navigate("/teacher");
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
      accent="from-blue-500 via-indigo-600 to-violet-600"
      title="Teacher Portal"
      subtitle="Academic management system"
      icon={<GraduationCap className="w-6 h-6" />}
    >
      <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as any)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email" className="text-xs">
            <Mail className="w-3 h-3 mr-1" />
            Email
          </TabsTrigger>
          <TabsTrigger value="phone" className="text-xs">
            <Phone className="w-3 h-3 mr-1" />
            Phone
          </TabsTrigger>
          <TabsTrigger value="staffId" className="text-xs">
            <User className="w-3 h-3 mr-1" />
            Staff ID
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleLogin} className="space-y-4">
        {loginMethod === "email" && (
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="teacher@school.edu.np"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        {loginMethod === "phone" && (
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="98XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        )}

        {loginMethod === "staffId" && (
          <div className="space-y-2">
            <Label htmlFor="staffId">Staff ID</Label>
            <Input
              id="staffId"
              type="text"
              placeholder="EMP-0001"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              required
            />
          </div>
        )}

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
          <ForgotPasswordDialog defaultEmail={email} portalLabel="Teacher Portal" />
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login to Teacher Portal"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-white/20 text-center">
        <p className="text-xs text-white/80">
          Only authorized teachers can access this portal.
        </p>
      </div>
    </GlassAuthShell>
  );

};

export default TeacherLogin;