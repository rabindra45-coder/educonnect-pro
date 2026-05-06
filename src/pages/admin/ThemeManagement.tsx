import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Check, Palette, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme, THEMES, type ThemeKey } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const ThemeManagement = () => {
  const { themeKey, setTheme, isLoading } = useTheme();
  const { toast } = useToast();
  const { hasAnyAdminRole, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || !hasAnyAdminRole())) navigate("/admin/login");
  }, [authLoading, user, hasAnyAdminRole, navigate]);

  const handleSelect = async (key: ThemeKey) => {
    try {
      await setTheme(key);
      toast({ title: "Theme applied", description: `${THEMES[key].name} is now active for everyone.` });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Theme Management | MIC Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Theme Management</h1>
            <p className="text-sm text-muted-foreground">
              Pick a theme — it applies system-wide for every user instantly.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading current theme…
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {(Object.values(THEMES)).map((t) => {
              const active = t.key === themeKey;
              return (
                <Card
                  key={t.key}
                  className={`relative overflow-hidden transition-all ${
                    active ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                  }`}
                >
                  {active && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{t.name}</CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      {t.swatches.map((c, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-lg border border-border shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div
                      className="rounded-lg p-4 border border-border"
                      style={{
                        background: `hsl(${t.vars["--background"]})`,
                        color: `hsl(${t.vars["--foreground"]})`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="px-3 py-1 rounded-md text-xs font-semibold"
                          style={{
                            background: `hsl(${t.vars["--primary"]})`,
                            color: `hsl(${t.vars["--primary-foreground"]})`,
                          }}
                        >
                          Primary
                        </span>
                        <span
                          className="px-3 py-1 rounded-md text-xs font-semibold"
                          style={{
                            background: `hsl(${t.vars["--secondary"]})`,
                            color: `hsl(${t.vars["--secondary-foreground"]})`,
                          }}
                        >
                          Secondary
                        </span>
                        <span
                          className="px-3 py-1 rounded-md text-xs font-semibold"
                          style={{
                            background: `hsl(${t.vars["--accent"]})`,
                            color: `hsl(${t.vars["--accent-foreground"]})`,
                          }}
                        >
                          Accent
                        </span>
                      </div>
                      <p className="text-xs opacity-80">Aa — Sample preview text on background</p>
                    </div>
                    <Button
                      onClick={() => handleSelect(t.key)}
                      disabled={active}
                      className="w-full"
                      variant={active ? "secondary" : "default"}
                    >
                      {active ? "Currently active" : "Apply theme"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Themes update CSS variables across the entire app via Realtime. Changes reflect immediately for all logged-in users.
        </p>
      </div>
    </AdminLayout>
  );
};

export default ThemeManagement;
