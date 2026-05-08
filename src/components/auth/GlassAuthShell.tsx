import { ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import schoolLogo from "@/assets/logo.png";

interface GlassAuthShellProps {
  /** Accent gradient (Tailwind classes, e.g. "from-blue-500 via-indigo-500 to-purple-600") */
  accent?: string;
  /** Portal title shown above the card */
  title: string;
  /** Subtitle shown under the title */
  subtitle?: string;
  /** Card icon (lucide component instance) */
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Premium glassmorphism shell with animated conic gradient, drifting orbs,
 * floating particles and shimmer sweep. Each portal passes its own accent
 * gradient + icon so the portals stay visually distinct.
 */
const GlassAuthShell = ({
  accent = "from-primary via-primary-glow to-secondary",
  title,
  subtitle,
  icon,
  children,
}: GlassAuthShellProps) => {
  // Pre-computed particle positions so they don't re-randomise on every render
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 8,
        opacity: 0.25 + Math.random() * 0.4,
        key: i,
      })),
    []
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-950">
      {/* Base accent gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-90`} />

      {/* Slow rotating conic gradient sweep */}
      <div
        className={`absolute inset-[-40%] bg-gradient-to-tr ${accent} opacity-30 blur-3xl animate-[spin_30s_linear_infinite]`}
        style={{ borderRadius: "40%" }}
      />

      {/* Drifting orbs */}
      <div
        className={`absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br ${accent} opacity-60 blur-3xl animate-[pulse_8s_ease-in-out_infinite]`}
      />
      <div
        className={`absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr ${accent} opacity-50 blur-3xl animate-[pulse_10s_ease-in-out_infinite]`}
      />
      <div
        className={`absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-gradient-to-bl ${accent} opacity-30 blur-3xl animate-[pulse_14s_ease-in-out_infinite]`}
      />

      {/* Mesh grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <span
            key={p.key}
            className="absolute rounded-full bg-white/70 blur-[1px] animate-[float_var(--dur)_ease-in-out_infinite]"
            style={
              {
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animationDelay: `${p.delay}s`,
                ["--dur" as string]: `${p.duration}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Inline keyframes (scoped via style tag so we don't need tailwind config) */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: var(--o, 0.4); }
          50% { transform: translateY(-30px) translateX(10px); opacity: 0.9; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
      `}</style>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-white/80 hover:text-white mb-4 backdrop-blur-md bg-white/10 border border-white/20 px-3 py-1.5 rounded-full transition hover:scale-105"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Main Site
          </Link>
          <div className="flex justify-center mb-3">
            <div className="relative w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl group">
              {/* Rotating ring */}
              <span className="absolute inset-0 rounded-2xl border border-white/40 animate-[spin_8s_linear_infinite]" style={{ borderStyle: "dashed" }} />
              <img src={schoolLogo} alt="School Logo" className="w-14 h-14 object-contain drop-shadow-lg" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-white/70 mb-1">
            <Sparkles className="w-3 h-3" />
            Milestone Int'l College
          </div>
          <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">{title}</h1>
          {subtitle && <p className="text-sm text-white/85 mt-1">{subtitle}</p>}
        </div>

        {/* Glass card */}
        <div className="relative rounded-3xl border border-white/25 bg-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Top highlight line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          {/* Shimmer sweep */}
          <div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            style={{ animation: "shimmer 6s ease-in-out infinite" }}
          />
          {/* Inner glow corners */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-white/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative p-6">
            {icon && (
              <div className="mx-auto w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center mb-4 text-white shadow-lg">
                {icon}
              </div>
            )}
            <div className="[&_label]:text-white/90 [&_label]:font-medium [&_input]:bg-white/95 [&_input]:border-white/40 [&_input]:h-11 [&_input]:rounded-xl [&_button[role=tab]]:text-white/80 [&_button[role=tab][data-state=active]]:bg-white [&_button[role=tab][data-state=active]]:text-foreground [&_[role=tablist]]:bg-white/15 [&_[role=tablist]]:backdrop-blur [&_[role=tablist]]:rounded-xl">
              {children}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/70 mt-4 flex items-center justify-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          Secured by Milestone Int'l College
        </p>
      </div>
    </div>
  );
};

export default GlassAuthShell;
