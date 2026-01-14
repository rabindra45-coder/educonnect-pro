import { motion } from "framer-motion";
import { GraduationCap, Award, Calendar, Bell, FileText, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickStatsProps {
  currentClass: string;
  rollNumber: number | null;
  upcomingEvents: number;
  notices: number;
  examResults: number;
  recentActivities: number;
}

const QuickStats = ({
  currentClass,
  rollNumber,
  upcomingEvents,
  notices,
  examResults,
  recentActivities,
}: QuickStatsProps) => {
  const stats = [
    {
      icon: GraduationCap,
      label: "Current Class",
      value: currentClass || "-",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      icon: Award,
      label: "Roll Number",
      value: rollNumber?.toString() || "-",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
    },
    {
      icon: Calendar,
      label: "Upcoming Events",
      value: upcomingEvents.toString(),
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      icon: Bell,
      label: "New Notices",
      value: notices.toString(),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      icon: FileText,
      label: "Exam Results",
      value: examResults.toString(),
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      icon: Clock,
      label: "Activities",
      value: recentActivities.toString(),
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
        >
          <Card className={`relative overflow-hidden border ${stat.borderColor} hover:shadow-lg transition-all duration-300 group`}>
            <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <CardContent className="relative p-4 text-center">
              <div className={`inline-flex p-2 rounded-xl ${stat.bgColor} mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;
