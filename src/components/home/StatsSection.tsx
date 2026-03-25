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

const StatItem = ({ icon, value, label, delay, index }: { icon: React.ReactNode; value: string; label: string; delay: number; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numMatch = value.match(/^(\d+)/);
  const num = numMatch ? parseInt(numMatch[1]) : 0;
  const suffix = value.replace(/^\d+/, "");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || num <= 0) return;
    let current = 0;
    const increment = Math.max(1, num / 60);
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 25);
    return () => clearInterval(timer);
  }, [isInView, num]);

  return (
    <motion.div
      ref={ref}
      className="text-center py-8 sm:py-10 relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 transition-colors duration-500 rounded-lg" />

      <motion.div
        className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary p-3 relative"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
        <div className="absolute inset-0 rounded-xl shimmer" />
      </motion.div>

      <motion.div
        className="font-display text-3xl sm:text-4xl md:text-5xl text-primary-foreground mb-2"
        initial={{ scale: 0.5 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay + 0.2, type: "spring" }}
      >
        {num > 0 ? `${count.toLocaleString()}${suffix}` : value}
      </motion.div>

      <div className="text-primary-foreground/55 text-xs sm:text-sm font-medium tracking-wide uppercase">{label}</div>
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
    <section className="bg-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-primary-foreground/5"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full border border-secondary/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-primary-foreground/10">
          {stats.map((stat, i) => (
            <StatItem
              key={stat.id}
              icon={stat.icon ? iconMap[stat.icon] || defaultIcons[i % 4] : defaultIcons[i % 4]}
              value={stat.value}
              label={stat.label}
              delay={i * 0.1}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;