import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, FileText, ImageIcon, Save, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useResources";
import { uploadBytes, BUCKET } from "@/lib/resourceCenter";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface Props { onCreated?: () => void; }

// Build a premium-looking PDF: cover page (with AI cover art) + structured content pages.
async function buildStudyPdf(title: string, content: string, coverDataUrl: string | null): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // ---------- COVER PAGE ----------
  // Navy background
  doc.setFillColor(15, 23, 42); // slate-900 / navy
  doc.rect(0, 0, pw, ph, "F");

  if (coverDataUrl) {
    try {
      // Fill cover area
      doc.addImage(coverDataUrl, "PNG", 0, 0, pw, ph, undefined, "FAST");
      // Dark gradient overlay for legibility
      doc.setFillColor(15, 23, 42);
      doc.setGState(new (doc as any).GState({ opacity: 0.55 }));
      doc.rect(0, ph * 0.45, pw, ph * 0.55, "F");
      doc.setGState(new (doc as any).GState({ opacity: 1 }));
    } catch { /* ignore image errors */ }
  }

  // Gold accent line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(2);
  doc.line(48, ph - 200, 180, ph - 200);

  // Eyebrow
  doc.setTextColor(212, 175, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("MILESTONE INTERNATIONAL COLLEGE  ·  +2 STUDY NOTES", 48, ph - 220);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  const titleLines = doc.splitTextToSize(title, pw - 96);
  doc.text(titleLines, 48, ph - 160);

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.text("AI-curated · Exam-ready · Premium edition", 48, ph - 56);

  // ---------- CONTENT PAGES ----------
  doc.addPage();
  const margin = 56;
  const maxWidth = pw - margin * 2;
  let y = margin + 8;

  // Header bar on content pages
  const drawHeader = () => {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pw, 36, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title.slice(0, 80), margin, 23);
    doc.setTextColor(212, 175, 55);
    doc.setFont("helvetica", "normal");
    doc.text("Milestone +2", pw - margin, 23, { align: "right" });
  };
  drawHeader();
  y = 64;

  const ensureSpace = (need: number) => {
    if (y + need > ph - margin) {
      doc.addPage();
      drawHeader();
      y = 64;
    }
  };

  const paragraphs = content.split(/\n{2,}/);
  for (const block of paragraphs) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const firstLine = trimmed.split("\n")[0].trim();
    const isHeading = /^[0-9]+\.\s+[A-Z][A-Z0-9 \-\/&()]+$/.test(firstLine) || /^[A-Z][A-Z0-9 \-\/&()]{4,}$/.test(firstLine);

    if (isHeading) {
      ensureSpace(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(firstLine, margin, y);
      // gold underline
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(1.2);
      doc.line(margin, y + 4, margin + 60, y + 4);
      y += 22;

      const rest = trimmed.split("\n").slice(1).join("\n").trim();
      if (rest) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55);
        const lines = doc.splitTextToSize(rest, maxWidth);
        for (const line of lines) {
          ensureSpace(16);
          doc.text(line, margin, y);
          y += 15;
        }
        y += 8;
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      const lines = doc.splitTextToSize(trimmed, maxWidth);
      for (const line of lines) {
        ensureSpace(16);
        // bullet-friendly indent
        if (line.startsWith("• ") || line.startsWith("- ")) {
          doc.text(line, margin + 8, y);
        } else {
          doc.text(line, margin, y);
        }
        y += 15;
      }
      y += 8;
    }
  }

  // Page numbers
  const total = (doc as any).internal.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i - 1} / ${total - 1}`, pw - margin, ph - 24, { align: "right" });
  }

  return doc.output("blob");
}

const AIResourceStudio = ({ onCreated }: Props) => {
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const [tab, setTab] = useState("pdf");

  // Study Pack (PDF + cover) state
  const [pdfPrompt, setPdfPrompt] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [pdfCover, setPdfCover] = useState<string | null>(null);
  const [pdfCategory, setPdfCategory] = useState<string>("");
  const [pdfClass, setPdfClass] = useState<string>("12");
  const [pdfSubject, setPdfSubject] = useState<string>("");
  const [stage, setStage] = useState<string>("");
  const [pdfBusy, setPdfBusy] = useState(false);

  // Image state
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgTitle, setImgTitle] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgCategory, setImgCategory] = useState<string>("");
  const [imgBusy, setImgBusy] = useState(false);
  const [imgSaving, setImgSaving] = useState(false);

  // One-click: generate long notes + cover + PDF, then publish.
  const generateAndPublish = async () => {
    if (!pdfPrompt.trim()) return toast.error("Enter a topic");
    setPdfBusy(true);
    setPdfText(""); setPdfCover(null); setPdfTitle("");
    try {
      setStage("Generating detailed +2 notes…");
      const textRes = await supabase.functions.invoke("generate-resource", {
        body: { kind: "text", prompt: pdfPrompt },
      });
      if (textRes.error) throw textRes.error;
      const title = textRes.data?.title || pdfPrompt.slice(0, 80);
      const content = textRes.data?.content || "";
      if (!content) throw new Error("No content generated");
      setPdfTitle(title);
      setPdfText(content);

      setStage("Designing premium cover art…");
      const coverRes = await supabase.functions.invoke("generate-resource", {
        body: { kind: "cover", prompt: pdfPrompt, title },
      });
      const coverUrl = coverRes.error ? null : (coverRes.data?.dataUrl as string | null);
      if (coverUrl) setPdfCover(coverUrl);

      setStage("Building premium PDF…");
      const blob = await buildStudyPdf(title, content, coverUrl);
      const safe = title.replace(/[^a-z0-9-]+/gi, "_").slice(0, 60) || "study_notes";
      const pdfName = `${safe}.pdf`;
      const pdfUp = await uploadBytes(blob, pdfName, "application/pdf", "ai-pdf");

      let coverPublicUrl: string | null = null;
      if (coverUrl) {
        setStage("Uploading cover image…");
        const coverBlob = await (await fetch(coverUrl)).blob();
        const coverPath = `resource-covers/${Date.now()}-${safe}_cover.png`;
        const { error: cErr } = await supabase.storage.from("content-images").upload(coverPath, coverBlob, { contentType: "image/png", upsert: false });
        if (cErr) throw cErr;
        coverPublicUrl = supabase.storage.from("content-images").getPublicUrl(coverPath).data.publicUrl;
      }

      setStage("Publishing to Resource Center…");
      const { data: ins, error } = await supabase.from("digital_resources").insert({
        title,
        description: pdfPrompt,
        resource_type: "document",
        file_url: "",
        storage_path: pdfUp.path,
        cover_image_url: coverPublicUrl,
        file_name: pdfName,
        file_size: pdfUp.size,
        file_mime: "application/pdf",
        category_id: pdfCategory || null,
        class: pdfClass || null,
        subject: pdfSubject || null,
        ai_generated: true,
        ai_prompt: pdfPrompt,
        is_downloadable: true,
        is_active: true,
        uploaded_by: user?.id ?? null,
      }).select("id").single();
      if (error) throw error;
      if (ins?.id) supabase.functions.invoke("notify-resource-upload", { body: { resource_id: ins.id } });

      toast.success("Study pack published with cover!");
      setPdfPrompt(""); setPdfText(""); setPdfTitle(""); setPdfCover(null);
      onCreated?.();
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    } finally {
      setPdfBusy(false);
      setStage("");
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
      // Duplicate the image to the public content-images bucket so it renders as a card cover.
      const coverPath = `resource-covers/${Date.now()}-${filename}`;
      await supabase.storage.from("content-images").upload(coverPath, blob, { contentType: "image/png", upsert: false });
      const publicUrl = supabase.storage.from("content-images").getPublicUrl(coverPath).data.publicUrl;
      const { data: ins, error } = await supabase.from("digital_resources").insert({
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
      }).select("id").single();
      if (error) throw error;
      if (ins?.id) supabase.functions.invoke("notify-resource-upload", { body: { resource_id: ins.id } });
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
          <p className="text-xs text-muted-foreground">Generate long, exam-ready +2 study packs (with a designed cover) or standalone posters — auto-published to the Resource Center.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pdf" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Study Pack (PDF + Cover)</TabsTrigger>
          <TabsTrigger value="image" className="gap-1.5"><ImageIcon className="h-3.5 w-3.5" />Image / Poster</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="space-y-3 pt-3">
          <div>
            <Label>Topic / chapter</Label>
            <Textarea rows={3} value={pdfPrompt} onChange={(e) => setPdfPrompt(e.target.value)}
              placeholder='e.g. "Class 12 Physics — Electromagnetic Induction: Faraday law, Lenz law, eddy currents, applications"' />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Select value={pdfCategory} onValueChange={setPdfCategory}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={pdfSubject} onChange={(e) => setPdfSubject(e.target.value)} placeholder="Subject" />
            <Select value={pdfClass} onValueChange={setPdfClass}>
              <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="11">Class 11</SelectItem>
                <SelectItem value="12">Class 12</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generateAndPublish} disabled={pdfBusy} size="lg" className="w-full">
            {pdfBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            {pdfBusy ? (stage || "Working…") : "Generate & Publish Study Pack"}
          </Button>

          {(pdfCover || pdfText) && (
            <div className="grid sm:grid-cols-[180px_1fr] gap-3 pt-2">
              {pdfCover && (
                <img src={pdfCover} alt="Generated cover" className="rounded-lg border w-full object-cover aspect-[3/4]" />
              )}
              {pdfText && (
                <div className="space-y-2 min-w-0">
                  {pdfTitle && <div className="font-display font-semibold text-base truncate">{pdfTitle}</div>}
                  <Textarea rows={10} value={pdfText} onChange={(e) => setPdfText(e.target.value)} className="font-mono text-xs" />
                </div>
              )}
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
