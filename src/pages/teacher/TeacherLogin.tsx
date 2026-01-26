import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2, ArrowLeft, Mail, Phone, User } from "lucide-react";
import schoolLogo from "@/assets/logo.png";

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
        const { data: teacherData, error: teacherError } = await supabase
          .from("teachers")
          .select("email")
          .eq("employee_id", staffId)
          .maybeSingle();

        if (teacherError || !teacherData?.email) {
          throw new Error("Staff ID not found. Please check your credentials.");
        }
        loginEmail = teacherData.email;
      } else if (loginMethod === "phone" && phone) {
        const { data: teacherData, error: teacherError } = await supabase
          .from("teachers")
          .select("email")
          .eq("phone", phone)
          .maybeSingle();

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
        password,
      });

      if (error) throw error;

      // Check if user has teacher role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .in("role", ["super_admin", "admin", "teacher"]);

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the teacher portal.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome!",
        description: "Successfully logged in to Teacher Portal.",
      });
      navigate("/teacher");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Main Site
          </Link>
          <div className="flex justify-center mb-4">
            <img src={schoolLogo} alt="School Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Teacher Portal</h1>
          <p className="text-muted-foreground">SDSJSS Academic Management System</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Teacher Login</CardTitle>
            <CardDescription>Enter your credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent>
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
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
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

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Only authorized teachers can access this portal.
                Contact admin if you need help.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherLogin;
