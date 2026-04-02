import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Monitor, Share2, Plus, ChevronRight } from "lucide-react";

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

  return (
    <MainLayout>
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Install Milestone College App
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Get instant access to portals, notices, and results right from your home screen.
            </p>
          </motion.div>

          {isInstalled ? (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Download className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-2">App Already Installed!</h3>
                <p className="text-emerald-600">You can access the app from your home screen.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {deferredPrompt && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Button onClick={handleInstall} size="lg" className="w-full h-14 text-lg gap-3">
                    <Download className="w-5 h-5" />
                    Install App Now
                  </Button>
                </motion.div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-blue-600" />
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
                      <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="font-bold">iPhone / Safari</h3>
                    </div>
                    <ol className="text-sm text-muted-foreground space-y-2">
                      <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Tap the Share (↑) button</li>
                      <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Scroll down and tap "Add to Home Screen"</li>
                      <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Tap "Add" to confirm</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default InstallApp;
