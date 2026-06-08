import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, FileText, ImageIcon, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useResources";
import { uploadBytes } from "@/lib/resourceCenter";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface Props { onCreated?: () => void; }

const AIResourceStudio = ({ onCreated }: Props) => {
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const [tab, setTab] = useState("pdf");

  // PDF state
  const [pdfPrompt, setPdfPrompt] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [pdfCategory, setPdfCategory] = useState<string>("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfSaving, setPdfSaving] = useState(false);

  // Image state
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgTitle, setImgTitle] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgCategory, setImgCategory] = useState<string>("");
  const [imgBusy, setImgBusy] = useState(false);
  const [imgSaving, setImgSaving] = useState(false);

  const generatePdf = async () => {
    if (!pdfPrompt.trim()) return toast.error("Enter a prompt");
    setPdfBusy(true);
    setPdfText("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-resource", {
        body: { kind: "text", prompt: pdfPrompt },
      });
      if (error) throw error;
      setPdfTitle(data.title || pdfPrompt.slice(0, 60));
      setPdfText(data.content || "");
      toast.success("Content generated");
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    } finally {
      setPdfBusy(false);
    }
  };

  const savePdf = async () => {
    if (!pdfText.trim() || !pdfTitle.trim()) return toast.error("Generate content first");
    setPdfSaving(true);
    try {
      // Render PDF client-side
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 48;
      const width = doc.internal.pageSize.getWidth() - margin * 2;
      doc.setFont("helvetica", "bold"); doc.setFontSize(18);
      doc.text(pdfTitle, margin, 64);
      doc.setFont("helvetica", "normal"); doc.setFontSize(11);
      const lines = doc.splitTextToSize(pdfText, width);
      let y = 96;
      const ph = doc.internal.pageSize.getHeight();
      for (const line of lines) {
        if (y > ph - margin) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += 16;
      }
      const blob = doc.output("blob");
      const filename = `${pdfTitle.replace(/[^a-z0-9-]+/gi, "_").slice(0, 60)}.pdf`;
      const up = await uploadBytes(blob, filename, "application/pdf", "ai-pdf");
      const { data: ins, error } = await supabase.from("digital_resources").insert({
        title: pdfTitle,
        description: pdfPrompt,
        resource_type: "document",
        file_url: "",
        storage_path: up.path,
        file_name: filename,
        file_size: up.size,
        file_mime: "application/pdf",
        category_id: pdfCategory || null,
        ai_generated: true,
        ai_prompt: pdfPrompt,
        is_downloadable: true,
        is_active: true,
        uploaded_by: user?.id ?? null,
      }).select("id").single();
      if (error) throw error;
      if (ins?.id) supabase.functions.invoke("notify-resource-upload", { body: { resource_id: ins.id } });
      toast.success("PDF published to Resource Center");
      setPdfPrompt(""); setPdfText(""); setPdfTitle("");
      onCreated?.();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setPdfSaving(false);
    }
  };

  const generateImage = async () => {
    if (!imgPrompt.trim()) return toast.error("Enter a prompt");
    setImgBusy(true); setImgUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-resource", {
        body: { kind: "image", prompt: imgPrompt },
      });
      if (error) throw error;
      setImgUrl(data.dataUrl);
      if (!imgTitle) setImgTitle(imgPrompt.slice(0, 60));
      toast.success("Image generated");
    } catch (e: any) {
      toast.error(e?.message || "Image generation failed");
    } finally {
      setImgBusy(false);
    }
  };

  const saveImage = async () => {
    if (!imgUrl || !imgTitle.trim()) return toast.error("Generate an image first");
    setImgSaving(true);
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const filename = `${imgTitle.replace(/[^a-z0-9-]+/gi, "_").slice(0, 60)}.png`;
      const up = await uploadBytes(blob, filename, "image/png", "ai-image");
      const publicUrl = supabase.storage.from("digital-resources").getPublicUrl(up.path).data.publicUrl;
      const { error } = await supabase.from("digital_resources").insert({
        title: imgTitle,
        description: imgPrompt,
        resource_type: "image",
        file_url: "",
        storage_path: up.path,
        cover_image_url: publicUrl,
        file_name: filename,
        file_size: up.size,
        file_mime: "image/png",
        category_id: imgCategory || null,
        ai_generated: true,
        ai_prompt: imgPrompt,
        is_downloadable: true,
        is_active: true,
        uploaded_by: user?.id ?? null,
      });
      if (error) throw error;
      toast.success("Image published");
      setImgPrompt(""); setImgUrl(null); setImgTitle("");
      onCreated?.();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setImgSaving(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 space-y-4 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary" /></div>
        <div>
          <h2 className="text-lg font-display font-semibold">AI Content Studio</h2>
          <p className="text-xs text-muted-foreground">Generate notes, posters, and study material with AI, then publish to the Resource Center.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pdf" className="gap-1.5"><FileText className="h-3.5 w-3.5" />PDF / Notes</TabsTrigger>
          <TabsTrigger value="image" className="gap-1.5"><ImageIcon className="h-3.5 w-3.5" />Image / Poster</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="space-y-3 pt-3">
          <div>
            <Label>Prompt</Label>
            <Textarea rows={3} value={pdfPrompt} onChange={(e) => setPdfPrompt(e.target.value)}
              placeholder='e.g. "Create Class 12 Physics notes on Electromagnetic Induction"' />
          </div>
          <div className="flex gap-2">
            <Button onClick={generatePdf} disabled={pdfBusy}>
              {pdfBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate
            </Button>
            {pdfText && <Button variant="outline" onClick={() => setPdfText("")}>Clear</Button>}
          </div>
          {pdfText && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} placeholder="Title" />
                <Select value={pdfCategory} onValueChange={setPdfCategory}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Textarea rows={10} value={pdfText} onChange={(e) => setPdfText(e.target.value)} className="font-mono text-xs" />
              <Button onClick={savePdf} disabled={pdfSaving}>
                {pdfSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Publish to Resource Center
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="image" className="space-y-3 pt-3">
          <div>
            <Label>Prompt</Label>
            <Textarea rows={3} value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)}
              placeholder='e.g. "College admission campaign poster, premium navy and gold"' />
          </div>
          <Button onClick={generateImage} disabled={imgBusy}>
            {imgBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate Image
          </Button>
          {imgUrl && (
            <div className="space-y-2">
              <img src={imgUrl} alt="AI" className="rounded-lg border max-h-80 mx-auto" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={imgTitle} onChange={(e) => setImgTitle(e.target.value)} placeholder="Title" />
                <Select value={imgCategory} onValueChange={setImgCategory}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={saveImage} disabled={imgSaving}>
                {imgSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Publish to Resource Center
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AIResourceStudio;
