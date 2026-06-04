import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ChevronRight, GraduationCap, Users, BookOpen, Calendar, Bell, FolderOpen,
  Trophy, Sparkles, ShieldCheck, Building2, Heart, Award,
} from "lucide-react";
import schoolLogo from "@/assets/logo.png";

/**
 * Premium 5-step onboarding carousel — iOS-style, brown/gold/yellow palette.
 * Shown once per device (localStorage flag). Swipe / auto-advance / skip.
 */

type Slide = {
  id: number;
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  scheme: "ivory" | "cream" | "amber" | "warm" | "deep";
  Visual: React.FC;
  features?: { icon: React.ElementType; label: string }[];
  cta?: { primary: string; secondary?: string };
};

/* ---------- Visuals (CSS-only, no external assets) ---------- */

const FloatingOrbs = ({ tone = "gold" }: { tone?: "gold" | "amber" | "brown" }) => {
  const colors = {
    gold: ["bg-[#F5C518]/40", "bg-[#E8A93B]/35", "bg-[#FDE68A]/30"],
    amber: ["bg-[#D97706]/30", "bg-[#F59E0B]/35", "bg-[#FBBF24]/25"],
    brown: ["bg-[#7B3F00]/40", "bg-[#A0522D]/30", "bg-[#3D1F00]/40"],
  }[tone];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className={`absolute -top-20 -right-16 w-64 h-64 rounded-full blur-3xl ${colors[0]}`}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className={`absolute top-1/3 -left-20 w-72 h-72 rounded-full blur-3xl ${colors[1]}`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className={`absolute -bottom-24 right-1/4 w-56 h-56 rounded-full blur-3xl ${colors[2]}`}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, delay: 2 }}
      />
    </div>
  );
};

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 18 }).map((_, i) => {
      const size = 2 + (i % 4);
      const left = (i * 53) % 100;
      const top = (i * 37) % 100;
      const delay = (i % 6) * 0.5;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#F5C518]/60"
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, delay }}
        />
      );
    })}
  </div>
);

const CampusVisual = () => (
  <div className="relative h-full flex items-end justify-center">
    <Particles />
    {/* Stylized campus building */}
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.2 }}
      className="relative w-full max-w-sm h-64"
    >
      {/* sky glow */}
      <div className="absolute inset-x-0 bottom-0 h-56">
        {/* building base */}
        <div className="absolute bottom-0 inset-x-6 h-44 rounded-t-2xl bg-gradient-to-b from-[#8B4513] to-[#5C2A00] shadow-2xl">
          {/* windows grid */}
          <div className="absolute inset-3 grid grid-cols-5 grid-rows-5 gap-1.5">
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={i}
                className="rounded-sm bg-[#F5C518]"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.4] }}
                transition={{ duration: 2, delay: i * 0.04, repeat: Infinity, repeatDelay: 3 }}
              />
            ))}
          </div>
          {/* entrance */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-12 rounded-t-md bg-[#3D1F00]" />
        </div>
        {/* gold roof accent */}
        <div className="absolute bottom-44 inset-x-10 h-2 bg-gradient-to-r from-[#F5C518] via-[#FDE68A] to-[#F5C518] rounded-full shadow-[0_0_24px_#F5C518]" />
        {/* foreground gold blob */}
        <motion.div
          className="absolute -bottom-4 -right-4 w-32 h-32 rounded-tl-[60%] rounded-tr-3xl rounded-bl-3xl bg-gradient-to-br from-[#F5C518] to-[#E8A93B]"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        <motion.div
          className="absolute bottom-8 -left-6 w-20 h-20 rounded-full bg-[#7B3F00]/80"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        />
      </div>
    </motion.div>
  </div>
);

const StudentsVisual = () => (
  <div className="relative h-full flex items-center justify-center">
    <FloatingOrbs tone="amber" />
    <div className="relative w-full max-w-xs aspect-square">
      {/* 5 stylized avatar circles, like a study group */}
      {[
        { x: "10%", y: "10%", s: 88, c: "from-[#F5C518] to-[#E8A93B]", d: 0 },
        { x: "55%", y: "5%", s: 76, c: "from-[#A0522D] to-[#7B3F00]", d: 0.1 },
        { x: "70%", y: "45%", s: 96, c: "from-[#FDE68A] to-[#F5C518]", d: 0.2 },
        { x: "5%", y: "50%", s: 80, c: "from-[#8B4513] to-[#5C2A00]", d: 0.15 },
        { x: "35%", y: "55%", s: 110, c: "from-[#F59E0B] to-[#D97706]", d: 0.05 },
      ].map((a, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: a.d, type: "spring", stiffness: 160 }}
          className={`absolute rounded-full bg-gradient-to-br ${a.c} shadow-xl flex items-center justify-center`}
          style={{ left: a.x, top: a.y, width: a.s, height: a.s }}
        >
          <Users className="w-1/3 h-1/3 text-white/90" />
        </motion.div>
      ))}
      {/* sparkles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        <Sparkles className="absolute top-4 right-4 w-5 h-5 text-[#F5C518]" />
        <Sparkles className="absolute bottom-6 left-2 w-4 h-4 text-[#FDE68A]" />
      </motion.div>
    </div>
  </div>
);

const CommunityVisual = () => (
  <div className="relative h-full flex items-center justify-center">
    <FloatingOrbs tone="gold" />
    {/* event cards floating */}
    <div className="relative w-full max-w-sm h-64">
      {[
        { i: 0, x: "5%", y: "15%", icon: Calendar, label: "Sports Day", c: "from-[#F5C518] to-[#E8A93B]" },
        { i: 1, x: "55%", y: "5%", icon: Trophy, label: "Cultural", c: "from-[#A0522D] to-[#7B3F00]" },
        { i: 2, x: "10%", y: "55%", icon: Heart, label: "Clubs", c: "from-[#FDE68A] to-[#F5C518]" },
        { i: 3, x: "55%", y: "55%", icon: Users, label: "Networking", c: "from-[#8B4513] to-[#5C2A00]" },
      ].map(({ i, x, y, icon: Icon, label, c }) => (
        <motion.div
          key={i}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: [0, -8, 0], opacity: 1 }}
          transition={{
            opacity: { delay: i * 0.12, duration: 0.5 },
            y: { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
          }}
          className="absolute w-36 rounded-2xl p-3 backdrop-blur-xl bg-white/70 dark:bg-white/10 border border-white/40 shadow-xl"
          style={{ left: x, top: y }}
        >
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c} flex items-center justify-center mb-2 shadow-md`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs font-semibold text-[#3D1F00] dark:text-[#FDE68A]">{label}</p>
          <p className="text-[10px] text-[#7B3F00]/70 dark:text-[#FDE68A]/60">This week</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const PhoneMockVisual = () => (
  <div className="relative h-full flex items-center justify-center">
    <FloatingOrbs tone="gold" />
    {/* phone */}
    <motion.div
      initial={{ rotate: -8, y: 20, opacity: 0 }}
      animate={{ rotate: -4, y: 0, opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="relative w-44 h-80 rounded-[2.2rem] bg-gradient-to-b from-[#3D1F00] to-[#1a0f00] p-2 shadow-2xl border-2 border-[#F5C518]/30"
    >
      <div className="w-full h-full rounded-[1.8rem] bg-gradient-to-br from-[#FFF8E7] via-white to-[#FDE68A]/40 overflow-hidden relative">
        <div className="h-7 bg-[#7B3F00] flex items-center justify-center">
          <img src={schoolLogo} alt="" className="h-4 w-4" />
        </div>
        <div className="p-2.5 space-y-2">
          <div className="h-16 rounded-xl bg-gradient-to-br from-[#F5C518] to-[#E8A93B]" />
          <div className="grid grid-cols-2 gap-1.5">
            {[GraduationCap, Calendar, Bell, BookOpen].map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="aspect-square rounded-lg bg-white shadow-sm flex items-center justify-center"
              >
                <Icon className="w-5 h-5 text-[#7B3F00]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>

    {/* feature nodes */}
    {[
      { icon: GraduationCap, x: "8%", y: "10%", label: "Academics", d: 0.3 },
      { icon: Calendar, x: "75%", y: "12%", label: "Events", d: 0.45 },
      { icon: Bell, x: "5%", y: "65%", label: "Notices", d: 0.6 },
      { icon: FolderOpen, x: "78%", y: "62%", label: "Resources", d: 0.75 },
    ].map(({ icon: Icon, x, y, label, d }, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: d, type: "spring", stiffness: 200 }}
        className="absolute flex flex-col items-center gap-1"
        style={{ left: x, top: y }}
      >
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F5C518] to-[#E8A93B] flex items-center justify-center shadow-lg">
          <Icon className="w-5 h-5 text-[#3D1F00]" />
        </div>
        <span className="text-[10px] font-semibold text-[#3D1F00] dark:text-[#FDE68A]">{label}</span>
      </motion.div>
    ))}
  </div>
);

const FinaleVisual = () => (
  <div className="relative h-full flex items-end justify-center pb-2">
    <FloatingOrbs tone="brown" />
    {/* glowing graduation cap */}
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
      className="relative"
    >
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl bg-[#F5C518]/60"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{ width: 200, height: 200, left: -50, top: -50 }}
      />
      <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-[#F5C518] via-[#FDE68A] to-[#E8A93B] flex items-center justify-center shadow-[0_0_60px_rgba(245,197,24,0.6)]">
        <Award className="w-14 h-14 text-[#3D1F00]" strokeWidth={2.2} />
      </div>
    </motion.div>
    {/* line drawing campus silhouette */}
    <svg className="absolute bottom-0 inset-x-0 w-full h-32 opacity-50" viewBox="0 0 400 120" fill="none">
      <path
        d="M0 120 L0 80 L40 80 L40 60 L80 60 L80 90 L120 90 L120 50 L160 50 L180 30 L200 50 L240 50 L240 90 L280 90 L280 60 L320 60 L320 80 L360 80 L360 70 L400 70 L400 120 Z"
        stroke="#F5C518" strokeWidth="1.5" fill="none"
      />
      <path d="M180 30 L180 15 L188 15 L188 30" stroke="#F5C518" strokeWidth="1.5" />
    </svg>
  </div>
);

/* ---------- Slide data ---------- */

const slides: Slide[] = [
  {
    id: 0, scheme: "ivory",
    eyebrow: "Welcome to Milestone",
    title: <>Your Journey <br /><span className="italic text-[#B45309]">Starts Here</span></>,
    subtitle: "Education, Innovation, and Opportunities for a Better Tomorrow.",
    Visual: CampusVisual,
    cta: { primary: "Get Started" },
  },
  {
    id: 1, scheme: "cream",
    eyebrow: "Academic Excellence",
    title: <>Learn. Grow. <span className="text-[#B45309]">Succeed.</span></>,
    subtitle: "Empowering students with knowledge, skills, and values for global success.",
    Visual: StudentsVisual,
    features: [
      { icon: GraduationCap, label: "Quality Education" },
      { icon: Users, label: "Expert Faculty" },
      { icon: BookOpen, label: "Research" },
    ],
  },
  {
    id: 2, scheme: "amber",
    eyebrow: "Campus Life",
    title: <>Your Campus, <br /><span className="text-white/95">Your Community</span></>,
    subtitle: "Discover clubs, events, sports, and leadership opportunities that shape your future.",
    Visual: CommunityVisual,
    features: [
      { icon: Calendar, label: "Events" },
      { icon: Heart, label: "Clubs" },
      { icon: Trophy, label: "Sports" },
      { icon: Users, label: "Network" },
    ],
  },
  {
    id: 3, scheme: "warm",
    eyebrow: "All-in-One App",
    title: <>Campus Life <span className="text-[#F5C518] italic">Simplified</span></>,
    subtitle: "Academics, attendance, notices, assignments, exams, fees and events — one place.",
    Visual: PhoneMockVisual,
  },
  {
    id: 4, scheme: "deep",
    eyebrow: "Begin Your Story",
    title: <>Ready to Shape <br /><span className="text-[#F5C518]">Your Future?</span></>,
    subtitle: "Join thousands of students building successful careers with Milestone International College.",
    Visual: FinaleVisual,
    cta: { primary: "Continue to App", secondary: "Explore Programs" },
  },
];

/* ---------- Color schemes per slide ---------- */
const schemes = {
  ivory: {
    bg: "bg-gradient-to-b from-[#FFFBEF] via-[#FFF6DC] to-[#FBE9B7] dark:from-[#1a0f00] dark:via-[#2a1700] dark:to-[#1a0f00]",
    text: "text-[#3D1F00] dark:text-[#FDE68A]",
    sub: "text-[#7B3F00]/80 dark:text-[#FDE68A]/70",
    chip: "bg-[#7B3F00]/10 text-[#7B3F00] dark:bg-[#FDE68A]/10 dark:text-[#FDE68A]",
    dot: "bg-[#7B3F00]/25", dotActive: "bg-[#7B3F00] dark:bg-[#F5C518]",
    btn: "bg-[#5C2A00] text-[#FDE68A] hover:bg-[#3D1F00]",
  },
  cream: {
    bg: "bg-gradient-to-b from-[#FFF8E7] via-[#FDE68A]/40 to-[#7B3F00] dark:from-[#1a0f00] dark:via-[#3D1F00] dark:to-[#1a0f00]",
    text: "text-[#3D1F00] dark:text-[#FDE68A]",
    sub: "text-[#7B3F00]/80 dark:text-[#FDE68A]/70",
    chip: "bg-[#F5C518]/30 text-[#7B3F00] dark:bg-[#FDE68A]/15 dark:text-[#FDE68A]",
    dot: "bg-[#7B3F00]/25", dotActive: "bg-[#7B3F00] dark:bg-[#F5C518]",
    btn: "bg-[#5C2A00] text-[#FDE68A] hover:bg-[#3D1F00]",
  },
  amber: {
    bg: "bg-gradient-to-b from-[#F5C518] via-[#E8A93B] to-[#7B3F00]",
    text: "text-[#3D1F00]",
    sub: "text-[#3D1F00]/85",
    chip: "bg-[#3D1F00]/15 text-[#3D1F00]",
    dot: "bg-[#3D1F00]/25", dotActive: "bg-[#3D1F00]",
    btn: "bg-[#3D1F00] text-[#F5C518] hover:bg-[#1a0f00]",
  },
  warm: {
    bg: "bg-gradient-to-b from-[#FFF8E7] via-[#FDE68A]/40 to-[#FFFBEF] dark:from-[#1a0f00] dark:via-[#2a1700] dark:to-[#1a0f00]",
    text: "text-[#3D1F00] dark:text-[#FDE68A]",
    sub: "text-[#7B3F00]/80 dark:text-[#FDE68A]/70",
    chip: "bg-[#7B3F00]/10 text-[#7B3F00] dark:bg-[#FDE68A]/10 dark:text-[#FDE68A]",
    dot: "bg-[#7B3F00]/25", dotActive: "bg-[#7B3F00] dark:bg-[#F5C518]",
    btn: "bg-[#5C2A00] text-[#FDE68A] hover:bg-[#3D1F00]",
  },
  deep: {
    bg: "bg-gradient-to-b from-[#3D1F00] via-[#5C2A00] to-[#1a0f00]",
    text: "text-[#FDE68A]",
    sub: "text-[#FDE68A]/75",
    chip: "bg-[#F5C518]/15 text-[#F5C518]",
    dot: "bg-[#FDE68A]/25", dotActive: "bg-[#F5C518]",
    btn: "bg-gradient-to-r from-[#F5C518] to-[#E8A93B] text-[#3D1F00] hover:from-[#FDE68A] hover:to-[#F5C518]",
  },
} as const;

/* ---------- Page ---------- */

export const ONBOARDING_KEY = "mic_onboarding_done_v1";

const Onboarding = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [progress, setProgress] = useState(0);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => {
    try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch { /* ignore */ }
    navigate("/", { replace: true });
  }, [navigate]);

  const next = useCallback(() => {
    if (index < slides.length - 1) setIndex(i => i + 1);
    else finish();
  }, [index, finish]);

  const prev = () => setIndex(i => Math.max(0, i - 1));

  // Auto-advance
  useEffect(() => {
    if (!auto) return;
    setProgress(0);
    const duration = 5000;
    const step = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += step;
      setProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        clearInterval(timer);
        if (index < slides.length - 1) setIndex(i => i + 1);
        else setAuto(false);
      }
    }, step);
    return () => clearInterval(timer);
  }, [index, auto]);

  const pause = () => { setAuto(false); };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    pause();
    const threshold = 60;
    if (info.offset.x < -threshold) next();
    else if (info.offset.x > threshold) prev();
  };

  const slide = slides[index];
  const c = schemes[slide.scheme];
  const Visual = slide.Visual;

  return (
    <>
      <Helmet>
        <title>Welcome — Milestone International College</title>
        <meta name="theme-color" content={slide.scheme === "deep" ? "#3D1F00" : slide.scheme === "amber" ? "#F5C518" : "#FFFBEF"} />
      </Helmet>

      <div
        ref={containerRef}
        className={`fixed inset-0 z-50 overflow-hidden ${c.bg} transition-colors duration-700`}
      >
        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-30 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between px-5 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur-md flex items-center justify-center shadow-md">
                <img src={schoolLogo} alt="" className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-widest ${c.text}`}>
                Milestone
              </span>
            </div>
            {index < slides.length - 1 && (
              <button
                onClick={finish}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${c.chip} active:scale-95 transition`}
                aria-label="Skip onboarding"
              >
                Skip
              </button>
            )}
          </div>

          {/* progress bars */}
          <div className="flex items-center gap-1.5 px-5 mt-3">
            {slides.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full overflow-hidden ${c.dot}`}>
                <motion.div
                  className={`h-full ${c.dotActive}`}
                  initial={false}
                  animate={{
                    width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
                  }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Swipeable content */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          style={{ x }}
          onDragEnd={onDragEnd}
          className="absolute inset-0 flex flex-col"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col pt-24 pb-40 px-6"
            >
              {/* Visual */}
              <div className="flex-1 min-h-0 -mx-2">
                <Visual />
              </div>

              {/* Copy */}
              <div className="mt-4 space-y-3">
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full ${c.chip}`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {slide.eyebrow}
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`font-display text-[2rem] leading-[1.1] tracking-tight ${c.text}`}
                >
                  {slide.title}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-10 h-[3px] rounded-full bg-[#F5C518] origin-left"
                />
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className={`text-[15px] leading-relaxed ${c.sub} max-w-md`}
                >
                  {slide.subtitle}
                </motion.p>

                {/* Feature chips */}
                {slide.features && (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                    className="flex flex-wrap gap-2 pt-2"
                  >
                    {slide.features.map(({ icon: Icon, label }) => (
                      <motion.div
                        key={label}
                        variants={{
                          hidden: { opacity: 0, y: 12 },
                          show: { opacity: 1, y: 0 },
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl ${c.chip} backdrop-blur-md`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">{label}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 inset-x-0 z-30 pb-[max(env(safe-area-inset-bottom),1rem)] px-6">
          <div className="flex flex-col gap-3">
            <motion.button
              key={`primary-${index}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => { pause(); next(); }}
              className={`relative w-full h-14 rounded-2xl font-semibold text-[15px] shadow-[0_10px_30px_-10px_rgba(123,63,0,0.5)] active:scale-[0.98] transition ${c.btn} flex items-center justify-center gap-2 overflow-hidden`}
            >
              {index === slides.length - 1 && (
                <motion.span
                  className="absolute inset-0 rounded-2xl"
                  animate={{ boxShadow: ["0 0 0 0 rgba(245,197,24,0.6)", "0 0 0 12px rgba(245,197,24,0)"] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              )}
              {slide.cta?.primary ?? (index === slides.length - 1 ? "Continue to App" : "Next")}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
            {slide.cta?.secondary && (
              <button
                onClick={() => { pause(); finish(); }}
                className={`w-full h-12 rounded-2xl text-[13px] font-semibold ${c.chip} active:scale-[0.98] transition flex items-center justify-center gap-2`}
              >
                <Building2 className="w-4 h-4" />
                {slide.cta.secondary}
              </button>
            )}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                onClick={() => { pause(); prev(); }}
                disabled={index === 0}
                className={`${c.sub} disabled:opacity-30 px-2 py-1`}
              >
                Back
              </button>
              <span className={`${c.sub}`}>{index + 1} / {slides.length}</span>
              <button onClick={() => { pause(); next(); }} className={`${c.sub} px-2 py-1 font-semibold`}>
                {index === slides.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Onboarding;
