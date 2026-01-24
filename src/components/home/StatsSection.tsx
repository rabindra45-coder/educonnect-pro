import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, GraduationCap, Award, BookOpen, TrendingUp } from "lucide-react";

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string | null;
  display_order: number;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="w-full h-full" />,
  "graduation-cap": <GraduationCap className="w-full h-full" />,
  award: <Award className="w-full h-full" />,
  "trending-up": <TrendingUp className="w-full h-full" />,
  "book-open": <BookOpen className="w-full h-full" />,
};

const StatItem = ({ icon, value, label, delay }: StatItemProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Parse numeric value for animation
  const numericMatch = value.match(/^(\d+)/);
  const numericValue = numericMatch ? parseInt(numericMatch[1]) : 0;
  const suffix = value.replace(/^\d+/, "");
  
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView && numericValue > 0) {
      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, numericValue]);

  return (
    <motion.div
      ref={ref}
      className="text-center p-3 xs:p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-card shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all duration-300 border border-border/50 touch-manipulation"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-1.5 xs:mb-2 sm:mb-4 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center text-primary p-2 xs:p-2.5 sm:p-3 md:p-4">
        {icon}
      </div>
      <div className="font-display text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-0.5 xs:mb-1 sm:mb-2">
        {numericValue > 0 ? `${count.toLocaleString()}${suffix}` : value}
      </div>
      <div className="text-muted-foreground text-[10px] xs:text-xs sm:text-sm md:text-base font-medium leading-tight">{label}</div>
    </motion.div>
  );
};

const StatsSection = () => {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("stats")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (data) setStats(data);
    };
    fetchStats();
  }, []);

  const defaultIcons = [
    <Users className="w-full h-full" />,
    <GraduationCap className="w-full h-full" />,
    <Award className="w-full h-full" />,
    <TrendingUp className="w-full h-full" />,
  ];

  return (
    <section className="py-8 xs:py-10 sm:py-16 md:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-3 xs:px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.id}
              icon={stat.icon ? iconMap[stat.icon] || defaultIcons[index % 4] : defaultIcons[index % 4]}
              value={stat.value}
              label={stat.label}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;