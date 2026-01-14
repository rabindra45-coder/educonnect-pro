import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface WelcomeBannerProps {
  studentName: string;
  registrationNumber: string;
  className: string;
  section: string | null;
  status: string | null;
  photoUrl: string | null;
}

const WelcomeBanner = ({
  studentName,
  registrationNumber,
  className,
  section,
  status,
  photoUrl,
}: WelcomeBannerProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName = studentName.split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/85 p-6 sm:p-8"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
      
      {/* Decorative Circles */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Avatar with Glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-secondary/30 rounded-full blur-xl animate-pulse-soft" />
          <Avatar className="relative w-20 h-20 sm:w-24 sm:h-24 border-4 border-white/20 shadow-2xl">
            <AvatarImage src={photoUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
              {getInitials(studentName)}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        {/* Content */}
        <div className="flex-1 text-white">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 text-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {getGreeting()}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-2xl sm:text-4xl font-bold mt-1"
          >
            {firstName}!
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-3 flex flex-wrap items-center gap-2 text-sm"
          >
            <Badge variant="secondary" className="bg-white/15 text-white border-0 backdrop-blur-sm">
              {registrationNumber}
            </Badge>
            <Badge variant="secondary" className="bg-secondary/30 text-white border-0 backdrop-blur-sm">
              Class {className} {section && `(${section})`}
            </Badge>
          </motion.div>
        </div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="hidden sm:flex flex-col items-end gap-2"
        >
          <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-3 py-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            {status === "active" ? "Active" : status || "Active"}
          </Badge>
          <p className="text-white/50 text-xs">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeBanner;
