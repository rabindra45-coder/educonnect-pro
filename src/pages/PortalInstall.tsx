import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Download, Share2, Smartphone, Plus, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDynamicManifest, PortalKey } from "@/hooks/useDynamicManifest";
import schoolLogo from "@/assets/logo.png";

interface PortalDef {
  key: Exclude<PortalKey, "main">;
  title: string;
  shortName: string;
  tagline: string;
  loginPath: string;
  accent: string; // tailwind gradient classes
  bg: string;
}

const PORTALS: Record<string, PortalDef> = {
  student: { key: "student", title: "Student App", shortName: "MIC Student", tagline: "Homework, results, fees & ID — in your pocket", loginPath: "/login", accent: "from-blue-600 via-indigo-600 to-blue-900", bg: "#1e3a5f" },
  parent:  { key: "parent",  title: "Parent App",  shortName: "MIC Parent",  tagline: "Track your child's progress in real time",         loginPath: "/parent/login",     accent: "from-rose-600 via-orange-600 to-amber-700",  bg: "#7c2d12" },
  teacher: { key: "teacher", title: "Teacher App", shortName: "MIC Teacher", tagline: "Class management, attendance & marks",             loginPath: "/teacher/login",    accent: "from-emerald-600 via-teal-600 to-emerald-900", bg: "#065f46" },
  admin:   { key: "admin",   title: "Admin App",   shortName: "MIC Admin",   tagline: "Full college command center",                       loginPath: "/admin/login",      accent: "from-slate-700 via-slate-900 to-black",       bg: "#0f172a" },
  accountant: { key: "accountant", title: "Accounts App", shortName: "MIC Accounts", tagline: "Fees, payments, invoices & reports",      loginPath: "/accountant/login", accent: "from-amber-600 via-yellow-700 to-orange-900", bg: "#854d0e" },
  library: { key: "library", title: "Library App", shortName: "MIC Library", tagline: "Books, issues, returns & members",                  loginPath: "/library/login",    accent: "from-purple-700 via-fuchsia-700 to-purple-900", bg: "#581c87" },
};

const PortalInstall = () => {
  const { portal } = useParams<{ portal: string }>();
  const def = portal ? PORTALS[portal] : undefined;
  if (!def) return <Navigate to="/install" replace />;

  useDynamicManifest(def.key);

  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener("beforeinstallprompt", handler);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${def.accent} text-white relative overflow-hidden`}>
      <Helmet>
        <title>{def.title} — Install | Milestone College</title>
        <meta name="apple-mobile-web-app-title" content={def.shortName} />
      </Helmet>

      {/* Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative max-w-md mx-auto px-5 pt-6 pb-12">
        <Link to="/install" className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> All portal apps
        </Link>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/30 shadow-2xl mb-4">
            <img src={schoolLogo} alt={def.shortName} className="w-16 h-16 object-contain" />
          </div>
          <h1 className="font-display text-3xl mb-1">{def.title}</h1>
          <p className="text-sm text-white/80 max-w-xs mx-auto">{def.tagline}</p>
        </div>

        {installed ? (
          <Card className="bg-emerald-500/20 border-emerald-300/40 text-emerald-50 backdrop-blur">
            <CardContent className="p-5 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <p className="font-semibold text-sm">{def.shortName} is installed</p>
                <p className="text-xs opacity-80">Open it from your home screen.</p>
              </div>
            </CardContent>
          </Card>
        ) : deferred ? (
          <Button onClick={handleInstall} size="lg" className="w-full h-14 rounded-2xl bg-white text-foreground hover:bg-white/90 font-bold text-base shadow-2xl">
            <Download className="w-5 h-5 mr-2" />
            Install {def.shortName}
          </Button>
        ) : isIOS ? (
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-5 space-y-3 text-sm">
              <p className="font-semibold flex items-center gap-2"><Smartphone className="w-4 h-4" /> Install on iPhone</p>
              <ol className="space-y-2 text-white/90">
                <li className="flex gap-2"><span className="font-bold">1.</span> Tap <Share2 className="inline w-4 h-4 mx-0.5" /> Share in Safari</li>
                <li className="flex gap-2"><span className="font-bold">2.</span> Choose <Plus className="inline w-4 h-4 mx-0.5" /> Add to Home Screen</li>
                <li className="flex gap-2"><span className="font-bold">3.</span> Tap Add — it appears as <b>{def.shortName}</b></li>
              </ol>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-5 text-sm">
              Open this page in Chrome/Edge on Android, then tap the browser menu → <b>Install app</b>. It will appear on your home screen as <b>{def.shortName}</b>.
            </CardContent>
          </Card>
        )}

        <Button variant="ghost" className="w-full mt-4 text-white hover:bg-white/10" asChild>
          <Link to={def.loginPath}>Sign in to {def.title} <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
        </Button>

        <p className="text-center text-[11px] text-white/60 mt-6">
          Each portal installs as its own separate app icon.
        </p>
      </div>
    </div>
  );
};

export default PortalInstall;
