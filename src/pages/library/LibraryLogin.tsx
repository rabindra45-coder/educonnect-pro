import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2, ArrowLeft } from "lucide-react";
import schoolLogo from "@/assets/logo.png";

const LibraryLogin = () => {
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
        password,
      });

      if (error) throw error;

      // Check if user has librarian role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .in("role", ["super_admin", "admin", "librarian"]);

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the library portal.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome!",
        description: "Successfully logged in to Library Portal.",
      });
      navigate("/library");
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Main Site
          </Link>
          <div className="flex justify-center mb-4">
            <img src={schoolLogo} alt="School Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Library Portal</h1>
          <p className="text-muted-foreground">SDSJSS Digital Library Management</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-2">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle>Librarian Login</CardTitle>
            <CardDescription>Enter your credentials to access the library system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="librarian@school.edu.np"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login to Library Portal"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Only authorized librarians can access this portal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LibraryLogin;
