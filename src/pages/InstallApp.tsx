import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Monitor, Share2, CheckCircle2, Wifi, Zap, Bell } from "lucide-react";
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

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Instant load times after install" },
    { icon: Wifi, title: "Works Offline", desc: "Access content without internet" },
    { icon: Bell, title: "Get Notified", desc: "Never miss notices or updates" },
    { icon: Smartphone, title: "Native Feel", desc: "Full-screen, app-like experience" },
  ];

  return (
    <MainLayout>
      {/* Hero with phone mockup */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary py-16 sm:py-24">
        {/* Animated blobs */}
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-secondary/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary-foreground text-center md:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 mb-5"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-widest">PWA Install</span>
              </motion.div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight">
                Take MIC <span className="italic text-secondary">everywhere</span>
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-md mx-auto md:mx-0">
                Install our app on your phone for instant access to portals, notices, fees and your child's progress.
              </p>

              {isInstalled ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-300/40 text-emerald-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">App Installed!</span>
                </motion.div>
              ) : deferredPrompt ? (
                <Button
                  onClick={handleInstall}
                  size="lg"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary-light h-14 px-8 text-base shadow-glow"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Install Now — It's Free
                </Button>
              ) : (
                <p className="text-sm text-primary-foreground/60">
                  Use the manual steps below if your browser doesn't show an install button.
                </p>
              )}
            </motion.div>

            {/* Phone mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex justify-center"
            >
              <div className="relative">
                {/* Phone frame */}
                <div className="relative w-[240px] sm:w-[280px] aspect-[9/19] rounded-[2.5rem] bg-foreground p-3 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-foreground rounded-b-2xl z-20" />
                  {/* Screen */}
                  <div className="relative w-full h-full rounded-[2rem] bg-gradient-to-br from-primary via-primary-dark to-primary overflow-hidden flex flex-col items-center justify-center text-primary-foreground p-6">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 rounded-2xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center mb-4"
                    >
                      <img src={schoolLogo} alt="Logo" className="w-12 h-12 object-contain" />
                    </motion.div>
                    <p className="font-display text-sm text-center leading-tight mb-1">Milestone Int'l College</p>
                    <p className="text-[10px] text-primary-foreground/60 text-center">Loading…</p>

                    {/* Loading bar */}
                    <div className="absolute bottom-12 left-6 right-6 h-1 bg-primary-foreground/15 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-secondary rounded-full"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        style={{ width: "40%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  className="absolute -top-3 -right-6 bg-card text-card-foreground rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                >
                  <Bell className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-semibold">New notice!</span>
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-6 bg-card text-card-foreground rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                >
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">Fast & offline</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl text-center mb-10 text-foreground"
          >
            Why install the app?
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Manual install steps */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl sm:text-3xl text-center mb-8 text-foreground">
            Manual install steps
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold">Android / Chrome</h3>
                </div>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Tap the menu (⋮) button</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Select "Add to Home screen"</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Tap "Add" to confirm</li>
                </ol>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-bold">iPhone / Safari</h3>
                </div>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Tap the Share (↑) button</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Scroll & tap "Add to Home Screen"</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Tap "Add" to confirm</li>
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
