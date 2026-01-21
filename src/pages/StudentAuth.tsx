import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  GraduationCap,
  Home,
  BookOpen,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  User,
  CheckCircle2,
  ScanFace,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import schoolLogo from "@/assets/logo.png";
import FaceLoginDialog from "@/components/auth/FaceLoginDialog";

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

const features = [
  { icon: BookOpen, title: "View Notices", description: "Stay updated with school announcements" },
  { icon: Award, title: "Exam Results", description: "Access your academic performance" },
  { icon: Users, title: "Academic Calendar", description: "Track important dates & events" },
];

const StudentAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const { user, signIn, hasRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user) {
      if (hasRole("student")) {
        navigate("/student");
      } else if (hasRole("super_admin") || hasRole("admin") || hasRole("teacher") || hasRole("staff")) {
        toast({
          title: "Admin Account Detected",
          description: "Please use the admin portal to login.",
          variant: "destructive",
        });
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
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Features */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] " />
        </div>

        {/* Floating Shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-20 w-48 h-48 bg-secondary/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-10 w-24 h-24 bg-white/5 rounded-2xl rotate-45"
        />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          {/* Logo & School Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-white rounded-2xl p-3 shadow-2xl">
                <img src={schoolLogo} alt="School Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-display text-2xl xl:text-3xl font-bold text-white leading-tight">
                  Student Portal
                </h1>
                <p className="text-white/70 text-sm">
                  श्री दुर्गा सरस्वती जनता मा. वि.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <h2 className="text-3xl xl:text-4xl font-display font-bold text-white mb-4 leading-tight">
              Welcome Back,<br />
              <span className="text-secondary">Future Leaders!</span>
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              Access your academic journey, stay updated with notices, and track your progress all in one place.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 left-12 xl:left-20 flex items-center gap-2 text-white/50 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Empowering Education Since 2046 BS</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Auth Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-background via-background to-muted/30"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-primary rounded-2xl p-3 shadow-lg">
              <img src={schoolLogo} alt="School Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Student Portal</h1>
            <p className="text-muted-foreground text-sm">श्री दुर्गा सरस्वती जनता मा. वि.</p>
          </motion.div>

          {/* Auth Card */}
          <div className="bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
            {/* Tab Switcher */}
            <div className="relative flex bg-muted/50 p-1.5 m-4 rounded-xl">
              <motion.div
                layoutId="activeTab"
                className="absolute inset-y-1.5 w-[calc(50%-3px)] bg-card rounded-lg shadow-sm"
                animate={{ x: isLogin ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setIsLogin(true)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors rounded-lg ${
                  isLogin ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors rounded-lg ${
                  !isLogin ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>

            {/* Form Container */}
            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Login Info */}
                    <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <GraduationCap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Login with credentials sent after admission approval, or sign up for a new account.
                      </p>
                    </div>

                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="student@example.com"
                            {...loginForm.register("email")}
                            className="pl-10 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:border-primary"
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-destructive text-xs">{loginForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...loginForm.register("password")}
                            className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-destructive text-xs">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Signing in...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Sign In
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        )}
                      </Button>

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-xl text-base font-medium"
                        onClick={() => setShowFaceLogin(true)}
                      >
                        <ScanFace className="w-5 h-5 mr-2" />
                        Login with Face
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="Your full name"
                            {...signupForm.register("fullName")}
                            className="pl-10 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:border-primary"
                          />
                        </div>
                        {signupForm.formState.errors.fullName && (
                          <p className="text-destructive text-xs">{signupForm.formState.errors.fullName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupEmail" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="signupEmail"
                            type="email"
                            placeholder="student@example.com"
                            {...signupForm.register("email")}
                            className="pl-10 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:border-primary"
                          />
                        </div>
                        {signupForm.formState.errors.email && (
                          <p className="text-destructive text-xs">{signupForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupPassword" className="text-sm font-medium">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="signupPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...signupForm.register("password")}
                            className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {signupForm.formState.errors.password && (
                          <p className="text-destructive text-xs">{signupForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...signupForm.register("confirmPassword")}
                            className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {signupForm.formState.errors.confirmPassword && (
                          <p className="text-destructive text-xs">{signupForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Creating Account...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Create Account
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center pt-2">
                        By signing up, you'll have access to the student portal for notices and academic information.
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">New Student?</span>
                </div>
              </div>

              {/* Admission Link */}
              <Button variant="outline" className="w-full h-12 rounded-xl" asChild>
                <Link to="/admission" className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Apply for Admission
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors group"
            >
              <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <FaceLoginDialog
        open={showFaceLogin}
        onOpenChange={setShowFaceLogin}
        onSuccess={() => navigate("/student")}
      />
    </div>
  );
};

export default StudentAuth;
