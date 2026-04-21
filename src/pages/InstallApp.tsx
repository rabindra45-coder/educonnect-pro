import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download, Smartphone, Monitor, Share2, CheckCircle2, Wifi, Zap, Bell,
  GraduationCap, Wallet, Calendar, MessageCircle, Heart, BookOpen, Sparkles,
} from "lucide-react";
import schoolLogo from "@/assets/logo.png";

const InstallApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if (window.matchMedia("(display-mode: standalone)").matches) setIsInstalled(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  // Floating parent-focused feature cards rendered around the phone
  const phoneCards = [
    { icon: Bell, label: "New notice", sub: "Parent-Teacher Meet", color: "text-secondary", pos: "top-2 -left-12 sm:-left-16", delay: 0.5 },
    { icon: Wallet, label: "Fees due", sub: "Rs. 12,500", color: "text-accent", pos: "top-1/3 -right-16 sm:-right-20", delay: 0.8 },
    { icon: GraduationCap, label: "Grade A+", sub: "Math Test", color: "text-emerald-500", pos: "bottom-20 -left-14 sm:-left-20", delay: 1.1 },
    { icon: Calendar, label: "Tomorrow", sub: "Sports Day", color: "text-primary", pos: "-bottom-2 -right-10 sm:-right-14", delay: 1.4 },
  ];

  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Instant load after install" },
    { icon: Wifi, title: "Works Offline", desc: "Notices & data cached" },
    { icon: Bell, title: "Push Alerts", desc: "Never miss an update" },
    { icon: Heart, title: "Built for Parents", desc: "Track your child easily" },
    { icon: MessageCircle, title: "Direct Messaging", desc: "Chat with teachers" },
    { icon: BookOpen, title: "Live Progress", desc: "Grades & attendance" },
  ];

  return (
    <MainLayout>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-12 sm:py-20 lg:py-28">
        {/* Animated gradient blobs */}
        <motion.div
          className="absolute top-0 -left-32 w-[28rem] h-[28rem] rounded-full bg-secondary/25 blur-3xl"
          animate={{ scale: [1, 1.25, 1], x: [0, 30, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 9, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent/25 blur-3xl"
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 11, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-primary-light/15 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Grid backdrop */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-secondary/40"
            style={{
              top: `${15 + (i * 11) % 70}%`,
              left: `${5 + (i * 13) % 90}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.7, 0.2], rotate: [0, 180, 360] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.4 }}
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>
        ))}

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
            {/* ===== Copy ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-primary-foreground text-center lg:text-left order-2 lg:order-1"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/15 backdrop-blur border border-secondary/30 mb-5"
              >
                <Heart className="w-3.5 h-3.5 text-secondary fill-secondary" />
                <span className="text-xs font-bold uppercase tracking-widest text-secondary-light">
                  For Parents & Students
                </span>
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-5 leading-[1.05]">
                Your child's<br />
                <span className="italic text-secondary">school</span> — in your{" "}
                <span className="relative inline-block">
                  pocket
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-secondary rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </h1>

              <p className="text-primary-foreground/75 text-base sm:text-lg mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Real-time grades, attendance, fees, notices and direct chat with teachers — all in one beautifully designed app built for busy parents.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 text-xs">
                {["Free forever", "No app store needed", "Works on iPhone & Android"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-primary-foreground/70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                    {t}
                  </div>
                ))}
              </div>

              {isInstalled ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-300/40 text-emerald-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">App Installed — open from your home screen!</span>
                </motion.div>
              ) : deferredPrompt ? (
                <div className="flex flex-col sm:flex-row gap-3 items-center lg:items-start justify-center lg:justify-start">
                  <Button
                    onClick={handleInstall}
                    size="lg"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary-light h-14 px-8 text-base shadow-glow font-bold rounded-2xl"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Install Now — It's Free
                  </Button>
                  <span className="text-xs text-primary-foreground/60 max-w-[180px] text-center sm:text-left">
                    Less than 2 MB. Installs in seconds.
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/15 text-primary-foreground/80 text-sm">
                  <Smartphone className="w-4 h-4" />
                  See manual install steps below ↓
                </div>
              )}
            </motion.div>

            {/* ===== Phone mockup with floating cards ===== */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex justify-center order-1 lg:order-2"
            >
              <div className="relative">
                {/* Glow halo */}
                <motion.div
                  className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-secondary/40 via-primary-light/30 to-accent/40 blur-3xl"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Phone frame */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-[260px] sm:w-[300px] aspect-[9/19.5] rounded-[3rem] bg-foreground p-3 shadow-2xl ring-1 ring-primary-foreground/10"
                >
                  {/* Side button */}
                  <div className="absolute -right-1 top-28 w-1 h-12 bg-foreground rounded-r" />
                  {/* Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-b-2xl z-20 flex items-end justify-end pr-2 pb-1">
                    <div className="w-2 h-2 rounded-full bg-foreground border border-muted-foreground/50" />
                  </div>

                  {/* Screen */}
                  <div className="relative w-full h-full rounded-[2.4rem] bg-gradient-to-br from-primary-dark via-primary to-primary-dark overflow-hidden">
                    {/* Status bar */}
                    <div className="absolute top-2 left-0 right-0 px-6 flex justify-between text-[10px] text-primary-foreground/80 z-10">
                      <span className="font-semibold">9:41</span>
                      <div className="flex gap-1 items-center">
                        <div className="w-3 h-1.5 rounded-sm bg-primary-foreground/80" />
                        <div className="w-1 h-1.5 rounded-full bg-primary-foreground/80" />
                        <div className="w-3.5 h-2 rounded-sm border border-primary-foreground/80" />
                      </div>
                    </div>

                    {/* Animated background orbs inside screen */}
                    <motion.div
                      className="absolute top-10 -left-10 w-32 h-32 rounded-full bg-secondary/30 blur-2xl"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute bottom-10 -right-10 w-32 h-32 rounded-full bg-accent/30 blur-2xl"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground p-6">
                      {/* Logo with pulsing rings */}
                      <div className="relative mb-5">
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-secondary"
                          animate={{ scale: [1, 1.4, 1.7], opacity: [0.6, 0.3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-secondary"
                          animate={{ scale: [1, 1.4, 1.7], opacity: [0.6, 0.3, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                        />
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="relative w-24 h-24 rounded-2xl bg-primary-foreground/15 backdrop-blur-xl border border-primary-foreground/20 flex items-center justify-center shadow-glow"
                        >
                          <img src={schoolLogo} alt="Logo" className="w-14 h-14 object-contain" />
                        </motion.div>
                      </div>

                      <p className="font-display text-base text-center leading-tight">
                        Milestone <span className="italic text-secondary">Int'l</span>
                      </p>
                      <p className="text-[10px] text-primary-foreground/60 text-center uppercase tracking-[0.25em] mt-1">
                        College App
                      </p>

                      {/* Mini quick tiles */}
                      <div className="grid grid-cols-3 gap-2 mt-6 w-full">
                        {[GraduationCap, Wallet, Bell].map((Ico, i) => (
                          <motion.div
                            key={i}
                            className="aspect-square rounded-xl bg-primary-foreground/10 backdrop-blur border border-primary-foreground/15 flex items-center justify-center"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                          >
                            <Ico className="w-5 h-5 text-secondary" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Loading bar */}
                      <div className="absolute bottom-10 left-6 right-6 h-1 bg-primary-foreground/15 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full w-1/3 bg-gradient-to-r from-secondary to-secondary-light rounded-full"
                          animate={{ x: ["-100%", "300%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary-foreground/40 rounded-full" />
                  </div>
                </motion.div>

                {/* Floating context cards */}
                {phoneCards.map((c, i) => {
                  const Ico = c.icon;
                  return (
                    <motion.div
                      key={i}
                      className={`absolute ${c.pos} bg-card text-card-foreground rounded-2xl shadow-2xl px-3 py-2.5 flex items-center gap-2.5 ring-1 ring-border min-w-[120px]`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1, y: [0, i % 2 === 0 ? -6 : 6, 0] }}
                      transition={{
                        opacity: { delay: c.delay, duration: 0.5 },
                        scale: { delay: c.delay, duration: 0.5, type: "spring" },
                        y: { duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: c.delay },
                      }}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 ${c.color}`}>
                        <Ico className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-[11px] font-bold">{c.label}</p>
                        <p className="text-[10px] text-muted-foreground">{c.sub}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-16 lg:py-20 bg-background relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-secondary/5 blur-3xl" />

        <div className="container mx-auto px-4 max-w-6xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Why install</span>
            <h2 className="font-display text-3xl sm:text-4xl mt-2 text-foreground">
              Everything you need, <span className="italic text-primary">beautifully</span> together
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all border-border/60 group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-1.5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MANUAL INSTALL ================= */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl sm:text-3xl text-center mb-2 text-foreground"
          >
            Manual install steps
          </motion.h2>
          <p className="text-center text-sm text-muted-foreground mb-8">
            If you don't see an install button, follow these quick steps
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Android</h3>
                    <p className="text-xs text-muted-foreground">Chrome / Edge</p>
                  </div>
                </div>
                <ol className="text-sm text-muted-foreground space-y-2.5">
                  <li className="flex gap-3"><span className="font-bold text-primary shrink-0">1.</span> Tap menu (⋮) at top-right</li>
                  <li className="flex gap-3"><span className="font-bold text-primary shrink-0">2.</span> Choose "Install app" or "Add to Home screen"</li>
                  <li className="flex gap-3"><span className="font-bold text-primary shrink-0">3.</span> Tap "Install" to confirm</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="border-secondary/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold">iPhone</h3>
                    <p className="text-xs text-muted-foreground">Safari only</p>
                  </div>
                </div>
                <ol className="text-sm text-muted-foreground space-y-2.5">
                  <li className="flex gap-3"><span className="font-bold text-secondary-foreground shrink-0">1.</span> Tap Share (↑) at the bottom</li>
                  <li className="flex gap-3"><span className="font-bold text-secondary-foreground shrink-0">2.</span> Scroll & tap "Add to Home Screen"</li>
                  <li className="flex gap-3"><span className="font-bold text-secondary-foreground shrink-0">3.</span> Tap "Add" — done!</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default InstallApp;
