import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, UserPlus, GraduationCap, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import schoolLogo from "@/assets/logo.png";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password too long"),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password too long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const StudentAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn, hasRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user) {
      // Only redirect students to student dashboard
      // Non-students should stay here or go to home
      if (hasRole("student")) {
        navigate("/student");
      } else if (hasRole("super_admin") || hasRole("admin") || hasRole("teacher") || hasRole("staff")) {
        // Admin users trying to login here - show message
        toast({
          title: "Admin Account Detected",
          description: "Please use the admin portal to login.",
          variant: "destructive",
        });
        // Sign them out and redirect
        supabase.auth.signOut();
      }
    }
  }, [user, isLoading, hasRole, navigate, toast]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const handleLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (data: SignupForm) => {
    setIsSubmitting(true);
    
    try {
      const redirectUrl = `${window.location.origin}/student`;
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) throw error;

      // Assign student role to the new user
      const { data: { user: newUser } } = await supabase.auth.getUser();
      
      if (newUser) {
        await supabase.from("user_roles").insert({
          user_id: newUser.id,
          role: "student",
        });
      }

      toast({
        title: "Account Created!",
        description: "Welcome! You can now access the student portal.",
      });
      
      navigate("/student");
    } catch (error: any) {
      let message = error.message;
      if (error.message?.includes("already registered")) {
        message = "This email is already registered. Please login instead.";
      }
      toast({
        title: "Signup Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-6 text-center">
            <div className="flex justify-center mb-4">
              <img
                src={schoolLogo}
                alt="School Logo"
                className="w-20 h-20 object-contain bg-white rounded-full p-2"
              />
            </div>
            <h1 className="font-display text-2xl font-bold text-primary-foreground">
              Student Portal
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Shree Durga Saraswati Janata Secondary School
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                isLogin
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="w-4 h-4 inline-block mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                !isLogin
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="w-4 h-4 inline-block mr-2" />
              Sign Up
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            {isLogin ? (
              <>
                <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-muted/50">
                  <GraduationCap className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Login with credentials sent after admission approval, or sign up for a new account.
                  </p>
                </div>

                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                      {...loginForm.register("email")}
                      className="mt-1"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-destructive text-xs mt-1">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-destructive text-xs mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </>
            ) : (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    {...signupForm.register("fullName")}
                    className="mt-1"
                  />
                  {signupForm.formState.errors.fullName && (
                    <p className="text-destructive text-xs mt-1">
                      {signupForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="student@example.com"
                    {...signupForm.register("email")}
                    className="mt-1"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-destructive text-xs mt-1">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...signupForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-destructive text-xs mt-1">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...signupForm.register("confirmPassword")}
                    className="mt-1"
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-destructive text-xs mt-1">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Create Student Account"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By signing up, you'll have access to the student portal where you can view notices and your information.
                </p>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-center text-muted-foreground mb-3">
                Want to apply for admission?
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admission">Apply for Admission</Link>
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentAuth;
