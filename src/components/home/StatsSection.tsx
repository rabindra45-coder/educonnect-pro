import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, GraduationCap, Award, TrendingUp, BookOpen } from "lucide-react";

interface Stat { id: string; label: string; value: string; icon: string | null; display_order: number; }

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="w-full h-full" />,
  "graduation-cap": <GraduationCap className="w-full h-full" />,
  award: <Award className="w-full h-full" />,
  "trending-up": <TrendingUp className="w-full h-full" />,
  "book-open": <BookOpen className="w-full h-full" />,
};
const defaultIcons = [
  <Users className="w-full h-full" />,
  <GraduationCap className="w-full h-full" />,
  <Award className="w-full h-full" />,
  <TrendingUp className="w-full h-full" />,
];

const StatItem = ({ icon, value, label, delay }: { icon: React.ReactNode; value: string; label: string; delay: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numMatch = value.match(/^(\d+)/);
  const num = numMatch ? parseInt(numMatch[1]) : 0;
  const suffix = value.replace(/^\d+/, "");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || num <= 0) return;
    let current = 0;
    const increment = num / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, num]);

  return (
    <motion.div
      ref={ref}
      className="text-center py-6 sm:py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary p-2.5 sm:p-3">
        {icon}
      </div>
      <div className="font-display text-2xl sm:text-3xl md:text-4xl text-primary-foreground mb-1">
        {num > 0 ? `${count.toLocaleString()}${suffix}` : value}
      </div>
      <div className="text-primary-foreground/60 text-xs sm:text-sm font-medium">{label}</div>
    </motion.div>
  );
};

const StatsSection = () => {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    supabase.from("stats").select("*").eq("is_active", true).order("display_order")
      .then(({ data }) => { if (data) setStats(data); });
  }, []);

  if (stats.length === 0) return null;

  return (
    <section className="bg-primary relative -mt-1">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-primary-foreground/10">
          {stats.map((stat, i) => (
            <StatItem
              key={stat.id}
              icon={stat.icon ? iconMap[stat.icon] || defaultIcons[i % 4] : defaultIcons[i % 4]}
              value={stat.value}
              label={stat.label}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
