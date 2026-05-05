import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sparkles, Loader2, ShieldCheck, History, Image as ImageIcon,
  Wand2, CheckCircle2, XCircle, RotateCcw, Activity, Lock,
} from "lucide-react";

const EXAMPLES = [
  "Add a new notice titled 'Mid-term exam routine published' for class 11.",
  "Update the hero slide subtitle to highlight scholarships for 2026.",
  "Add a new facility called 'Robotics Lab' with a short description.",
  "Generate a hero banner image for science faculty admissions.",
];

type Plan = {
  intent: string; target_table: string; operation: "insert" | "update" | "noop";
  target_id?: string; fields: Record<string, any>; summary: string;
};

export default function AIControlCenter() {
  const { user, isLoading, hasRole } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [agents, setAgents] = useState<{ agent: string; content: string }[]>([]);
  const [logId, setLogId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgPurpose, setImgPurpose] = useState("hero_banner");
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !hasRole("super_admin"))) navigate("/admin");
  }, [user, isLoading, hasRole, navigate]);

  const refresh = async () => {
    const [l, v, m] = await Promise.all([
      supabase.from("ai_logs").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("ai_versions").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("ai_generated_media").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    setLogs(l.data || []); setVersions(v.data || []); setMedia(m.data || []);
  };

  useEffect(() => { if (user && hasRole("super_admin")) refresh(); }, [user]);

  const call = async (action: string, payload: any = {}) => {
    const { data, error } = await supabase.functions.invoke("ai-control", {
      body: { action, ...payload },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const onAnalyze = async () => {
    if (!prompt.trim()) return toast.error("Enter a prompt");
    setAnalyzing(true); setPlan(null); setAgents([]);
    try {
      const data = await call("analyze", { prompt });
      setPlan(data.plan); setAgents(data.agents || []); setLogId(data.log_id);
      toast.success("Analysis complete");
    } catch (e: any) { toast.error(e.message); }
    finally { setAnalyzing(false); refresh(); }
  };

  const onApply = async () => {
    if (!plan || !logId) return;
    setApplying(true);
    try {
      await call("apply", { log_id: logId, plan });
      toast.success("Change deployed");
      setPlan(null); setPrompt(""); setLogId(null); setAgents([]);
    } catch (e: any) { toast.error(e.message); }
    finally { setApplying(false); refresh(); }
  };

  const onRollback = async (id: string) => {
    try { await call("rollback", { version_id: id }); toast.success("Rolled back"); }
    catch (e: any) { toast.error(e.message); }
    finally { refresh(); }
  };

  const onGenImage = async () => {
    if (!imgPrompt.trim()) return toast.error("Enter image prompt");
    setImgLoading(true);
    try { await call("generate_image", { prompt: imgPrompt, purpose: imgPurpose }); toast.success("Image generated"); setImgPrompt(""); }
    catch (e: any) { toast.error(e.message); }
    finally { setImgLoading(false); refresh(); }
  };

  const onMedia = async (id: string, action: "approve_media" | "reject_media") => {
    try { await call(action, { id }); toast.success("Updated"); }
    catch (e: any) { toast.error(e.message); }
    finally { refresh(); }
  };

  if (isLoading) return <AdminLayout><div className="p-8"><Loader2 className="animate-spin" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--secondary)/0.15),transparent_60%)]" />
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold">AI Control Center</h1>
                <Badge variant="secondary" className="gap-1"><ShieldCheck className="w-3 h-3" /> Super Admin</Badge>
                <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                  <Activity className="w-3 h-3" /> Rabindra 2.0 Online
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Multi-agent AI controller for safe, audited content & media changes.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="control" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="control"><Wand2 className="w-4 h-4 mr-1" />Control</TabsTrigger>
            <TabsTrigger value="media"><ImageIcon className="w-4 h-4 mr-1" />Media</TabsTrigger>
            <TabsTrigger value="versions"><History className="w-4 h-4 mr-1" />Versions</TabsTrigger>
            <TabsTrigger value="logs"><Activity className="w-4 h-4 mr-1" />Logs</TabsTrigger>
          </TabsList>

          {/* CONTROL */}
          <TabsContent value="control" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 backdrop-blur bg-card/70 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wand2 className="w-5 h-5 text-primary" /> Prompt
                  </CardTitle>
                  <CardDescription>Describe a content change in plain English.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    rows={5}
                    placeholder="e.g. Add a notice about parent-teacher meeting next Friday at 10 AM..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={onAnalyze} disabled={analyzing}>
                      {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Analyze Changes
                    </Button>
                    <Button variant="secondary" disabled={!plan || applying} onClick={onApply}>
                      {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve & Deploy
                    </Button>
                    <Button variant="ghost" disabled={!plan} onClick={() => { setPlan(null); setAgents([]); setLogId(null); }}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur bg-card/70">
                <CardHeader><CardTitle className="text-base">Example prompts</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {EXAMPLES.map((ex) => (
                    <button key={ex} onClick={() => setPrompt(ex)}
                      className="w-full text-left text-xs p-2 rounded-md border border-border hover:border-primary/40 hover:bg-muted/50 transition">
                      {ex}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Plan preview */}
            {plan && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Change Preview
                  </CardTitle>
                  <CardDescription>{plan.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">Intent: {plan.intent}</Badge>
                    <Badge variant="outline">Table: {plan.target_table}</Badge>
                    <Badge variant="outline">Op: {plan.operation}</Badge>
                  </div>
                  <pre className="text-xs bg-muted/60 p-3 rounded-md overflow-x-auto">
{JSON.stringify(plan.fields, null, 2)}
                  </pre>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Agent insights</p>
                    {agents.map((a) => (
                      <div key={a.agent} className="text-xs">
                        <span className="font-semibold text-primary">{a.agent}: </span>
                        <span className="text-muted-foreground">{a.content}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* MEDIA */}
          <TabsContent value="media" className="space-y-4">
            <Card className="backdrop-blur bg-card/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="w-5 h-5 text-primary" /> Rabindra 3.0 — Image Module
                </CardTitle>
                <CardDescription>Generate banners, thumbnails, posters. Approve before publish.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Prompt</Label>
                    <Input value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)} placeholder="Hero banner: students in lab, navy & gold tones" />
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={imgPurpose} onChange={(e) => setImgPurpose(e.target.value)}>
                      <option value="hero_banner">Hero banner</option>
                      <option value="notice_thumb">Notice thumbnail</option>
                      <option value="event_poster">Event poster</option>
                      <option value="faculty_placeholder">Faculty placeholder</option>
                    </select>
                  </div>
                </div>
                <Button onClick={onGenImage} disabled={imgLoading}>
                  {imgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  Generate Image
                </Button>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {media.map((m) => (
                <Card key={m.id} className="overflow-hidden">
                  <img src={m.image_url} alt={m.prompt} className="w-full h-40 object-cover" />
                  <CardContent className="p-3 space-y-2">
                    <p className="text-xs line-clamp-2">{m.prompt}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={m.status === "approved" ? "default" : m.status === "rejected" ? "destructive" : "secondary"}>
                        {m.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{m.purpose}</span>
                    </div>
                    {m.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => onMedia(m.id, "approve_media")}>
                          <CheckCircle2 className="w-3 h-3" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onMedia(m.id, "reject_media")}>
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {media.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No generated media yet.</p>}
            </div>
          </TabsContent>

          {/* VERSIONS */}
          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="w-5 h-5 text-primary" /> Version History
                </CardTitle>
                <CardDescription>Each AI deployment is snapshotted. Roll back any change.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[480px] pr-2">
                  <div className="space-y-2">
                    {versions.map((v) => (
                      <div key={v.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{v.label}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{v.summary}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-[10px]">
                            <Badge variant="outline">{v.target_table}</Badge>
                            <span className="text-muted-foreground">{new Date(v.created_at).toLocaleString()}</span>
                            {v.rolled_back_at && <Badge variant="destructive">Rolled back</Badge>}
                          </div>
                        </div>
                        {!v.rolled_back_at && (
                          <Button size="sm" variant="outline" onClick={() => onRollback(v.id)}>
                            <RotateCcw className="w-3 h-3" /> Rollback
                          </Button>
                        )}
                      </div>
                    ))}
                    {versions.length === 0 && <p className="text-sm text-muted-foreground">No versions yet.</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LOGS */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="w-5 h-5 text-primary" /> Activity Logs
                </CardTitle>
                <CardDescription>Audited record of every AI action.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[480px] pr-2">
                  <div className="space-y-2">
                    {logs.map((l) => (
                      <div key={l.id} className="p-3 rounded-lg border text-xs">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant={l.status === "applied" ? "default" : l.status === "failed" ? "destructive" : "secondary"}>
                            {l.status}
                          </Badge>
                          {l.intent && <Badge variant="outline">{l.intent}</Badge>}
                          {l.agent && <Badge variant="outline">{l.agent}</Badge>}
                          <span className="text-muted-foreground ml-auto">{new Date(l.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-foreground">{l.prompt}</p>
                        {l.error && <p className="text-destructive mt-1">{l.error}</p>}
                      </div>
                    ))}
                    {logs.length === 0 && <p className="text-sm text-muted-foreground">No logs yet.</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
