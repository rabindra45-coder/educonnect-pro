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
  GraduationCap,
  Home,
  BookOpen,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  ScanFace,
  ScanLine,
  KeyRound,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import FaceLoginDialog from "@/components/auth/FaceLoginDialog";
import QRLoginDialog from "@/components/auth/QRLoginDialog";
import ForgotPasswordDialog from "@/components/auth/ForgotPasswordDialog";
import schoolLogo from "@/assets/logo.png";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password too long"),
});

type LoginForm = z.infer<typeof loginSchema>;
type Method = "picker" | "password";

const features = [
  { icon: BookOpen, title: "View Notices", description: "Stay updated with school announcements" },
  { icon: Award, title: "Exam Results", description: "Access your academic performance" },
  { icon: Users, title: "Academic Calendar", description: "Track important dates & events" },
];

const methods = [
  {
    id: "password" as const,
    icon: KeyRound,
    title: "Password",
    description: "Sign in with your email and password",
    accent: "from-primary to-primary/70",
    badge: "Classic",
  },
  {
    id: "face" as const,
    icon: ScanFace,
    title: "Face Login",
    description: "Use your face to instantly sign in",
    accent: "from-secondary to-yellow-500",
    badge: "Biometric",
  },
  {
    id: "qr" as const,
    icon: ScanLine,
    title: "Scan ID Card",
    description: "Scan your Student ID QR to sign in",
    accent: "from-emerald-500 to-teal-500",
    badge: "Fastest",
  },
];

const StudentAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [showQRLogin, setShowQRLogin] = useState(false);
  const [method, setMethod] = useState<Method>("picker");
  const { user, signIn, hasRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user) {
      if (hasRole("student")) {
        navigate("/student");
      } else if (
        hasRole("super_admin") ||
        hasRole("admin") ||
        hasRole("teacher") ||
        hasRole("staff")
      ) {
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

  const handleLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Login Failed",
        description:
          error.message === "Invalid login credentials"
            ? "Invalid email or password. Please try again."
            : error.message,
        variant: "destructive",
      });
    } else {
      try {
        const { data: { user: loggedInUser } } = await supabase.auth.getUser();
        if (loggedInUser) {
          await supabase.functions.invoke("log-login", {
            body: {
              userId: loggedInUser.id,
              email: data.email,
              fullName: loggedInUser.user_metadata?.full_name,
              loginMethod: "password",
              userAgent: navigator.userAgent,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          });
        }
      } catch (logError) {
        console.error("Error logging login:", logError);
      }
    }
  };

  const handleMethodSelect = (id: "password" | "face" | "qr") => {
    if (id === "password") setMethod("password");
    else if (id === "face") setShowFaceLogin(true);
    else if (id === "qr") setShowQRLogin(true);
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
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')]" />
        </div>

        {/* Floating Shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-primary-foreground/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-20 w-48 h-48 bg-secondary/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-10 w-24 h-24 bg-primary-foreground/5 rounded-2xl rotate-45"
        />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-primary-foreground rounded-2xl p-3 shadow-2xl">
                <img
                  alt="School Logo"
                  className="w-full h-full object-contain"
                  src={schoolLogo}
                />
              </div>
              <div>
                <h1 className="font-display text-2xl xl:text-3xl font-bold text-primary-foreground leading-tight">
                  Student Portal
                </h1>
                <p className="text-primary-foreground/70 text-sm">
                  माइलस्टोन इन्टरनेशनल मा. वि.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <h2 className="text-3xl xl:text-4xl font-display font-bold text-primary-foreground mb-4 leading-tight">
              Three ways to sign in.<br />
              <span className="text-secondary">One smart portal.</span>
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Pick what works for you — password, face recognition, or scan your ID card. Your dashboard awaits.
            </p>
          </motion.div>

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
                className="flex items-center gap-4 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">{feature.title}</h3>
                  <p className="text-primary-foreground/60 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 left-12 xl:left-20 flex items-center gap-2 text-primary-foreground/50 text-sm"
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
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden"
      >
        {/* Decorative blob */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden text-center mb-6"
          >
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl p-2 shadow-lg bg-primary-foreground border border-border">
              <img
                alt="School Logo"
                className="w-full h-full object-contain"
                src={schoolLogo}
              />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">Student Portal</h1>
            <p className="text-muted-foreground text-xs">माइलस्टोन इन्टरनेशनल मा. वि.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {method === "picker" ? (
              <motion.div
                key="picker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                    <Shield className="w-3 h-3" />
                    Secure Sign In
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    How would you like to sign in?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred login method below
                  </p>
                </div>

                <div className="space-y-3">
                  {methods.map((m, idx) => (
                    <motion.button
                      key={m.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMethodSelect(m.id)}
                      className="w-full text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden"
                    >
                      <div
                        className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${m.accent} opacity-5 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}
                      />
                      <div className="flex items-center gap-4 relative">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.accent} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform`}
                        >
                          <m.icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{m.title}</h3>
                            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                              {m.badge}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-6 p-3 rounded-xl bg-muted/50 border border-border/50 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Tip:</span> If face login isn't
                    working, try scanning your ID card QR — it's just as fast.
                  </p>
                </div>

                {/* Admission Link */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground">New Student?</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-11 rounded-xl" asChild>
                  <Link to="/admission" className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Apply for Admission
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMethod("picker")}
                    className="h-8 px-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <LogIn className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Password Sign In</span>
                  </div>
                  <div className="w-8" />
                </div>

                <div className="px-6 py-6">
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
                        <p className="text-destructive text-xs">
                          {loginForm.formState.errors.email.message}
                        </p>
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
                        <p className="text-destructive text-xs">
                          {loginForm.formState.errors.password.message}
                        </p>
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
                            className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
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
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
      <QRLoginDialog
        open={showQRLogin}
        onOpenChange={setShowQRLogin}
        onSuccess={() => navigate("/student")}
      />
    </div>
  );
};

export default StudentAuth;
