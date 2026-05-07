import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import GlassAuthShell from "@/components/auth/GlassAuthShell";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" }
  });

  const handleLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials" ?
        "Invalid email or password. Please try again." :
        error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in."
      });
      navigate("/admin");
    }
  };

  const handleSignup = async (data: SignupForm) => {
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setIsSubmitting(false);

    if (error) {
      let message = error.message;
      if (error.message.includes("already registered")) {
        message = "This email is already registered. Please login instead.";
      }
      toast({
        title: "Signup Failed",
        description: message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Your account has been created successfully. Please wait for admin approval to access the admin panel."
      });
      navigate("/admin");
    }
  };

  return (
    <GlassAuthShell
      accent="from-purple-600 via-fuchsia-600 to-rose-600"
      title="Admin Portal"
      subtitle="Milestone International SS & College"
      icon={<Shield className="w-6 h-6" />}
    >
      {/* Toggle Tabs */}
      <div className="flex border-b border-white/20 mb-4 -mt-1">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            isLogin
              ? "text-white border-b-2 border-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <LogIn className="w-4 h-4 inline-block mr-2" />
          Login
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            !isLogin
              ? "text-white border-b-2 border-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          <UserPlus className="w-4 h-4 inline-block mr-2" />
          Sign Up
        </button>
      </div>

      {isLogin ? (
        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@school.edu.np"
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
      ) : (
        <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
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
              placeholder="admin@school.edu.np"
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
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-xs text-white/80 text-center">
            Note: After signup, you need admin approval to access the dashboard.
          </p>
        </form>
      )}
    </GlassAuthShell>
  );

};

export default AdminAuth;