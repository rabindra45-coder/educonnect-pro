import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
 * Shared glassmorphism + animated gradient login shell used by every
 * role-specific login page (admin, teacher, student, parent, accountant,
 * librarian). Each portal passes its own accent gradient + icon so the
 * portals stay visually distinct while sharing one premium look.
 */
const GlassAuthShell = ({
  accent = "from-primary via-primary-glow to-secondary",
  title,
  subtitle,
  icon,
  children,
}: GlassAuthShellProps) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-950">
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-90`} />
      <div
        className={`absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br ${accent} opacity-60 blur-3xl animate-[pulse_8s_ease-in-out_infinite]`}
      />
      <div
        className={`absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr ${accent} opacity-50 blur-3xl animate-[pulse_10s_ease-in-out_infinite]`}
      />
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-white/80 hover:text-white mb-4 backdrop-blur-md bg-white/10 border border-white/20 px-3 py-1.5 rounded-full transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Main Site
          </Link>
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-xl">
              <img src={schoolLogo} alt="School Logo" className="w-12 h-12 object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-white drop-shadow">{title}</h1>
          {subtitle && <p className="text-sm text-white/80 mt-1">{subtitle}</p>}
        </div>

        {/* Glass card */}
        <div className="relative rounded-2xl border border-white/25 bg-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <div className="p-6">
            {icon && (
              <div className="mx-auto w-12 h-12 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center mb-3 text-white">
                {icon}
              </div>
            )}
            <div className="[&_label]:text-white/90 [&_input]:bg-white/95 [&_input]:border-white/40 [&_button[role=tab]]:text-white/80 [&_button[role=tab][data-state=active]]:bg-white [&_button[role=tab][data-state=active]]:text-foreground [&_[role=tablist]]:bg-white/15 [&_[role=tablist]]:backdrop-blur">
              {children}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/70 mt-4">
          Secured by Milestone Int'l College
        </p>
      </div>
    </div>
  );
};

export default GlassAuthShell;
