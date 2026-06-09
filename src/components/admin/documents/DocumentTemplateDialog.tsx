import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toPng } from "html-to-image";
import { Download, FileText, Save, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { convertBSDateStringToAD } from "@/lib/nepaliDateConverter";

import Class12MarkSheetTemplate, { MarkSheetData, MarkRow } from "./plus-two/Class12MarkSheetTemplate";
import PassingCertificateTemplate, { PassingCertificateData } from "./plus-two/PassingCertificateTemplate";
import MigrationCertificateTemplate, { MigrationCertificateData } from "./plus-two/MigrationCertificateTemplate";
import TransferCertificateTemplate, { TransferCertificateData } from "./plus-two/TransferCertificateTemplate";
import CharacterCertificateTemplate, { CharacterCertificateData } from "./plus-two/CharacterCertificateTemplate";

interface Student {
  id: string;
  registration_number: string;
  full_name: string;
  class: string;
  stream?: string | null;
  grade?: string | null;
  section: string | null;
  photo_url: string | null;
  guardian_name: string | null;
  date_of_birth: string | null;
  address: string | null;
  gender?: string | null;
  admission_year?: number | null;
}

interface SchoolSettings {
  school_name: string;
  school_address: string | null;
  established_year: number | null;
  logo_url: string | null;
  principal_name: string | null;
}

type TemplateType =
  | "class12_marksheet"
  | "class11_marksheet"
  | "passing_certificate"
  | "migration_certificate"
  | "transfer_certificate"
  | "character_certificate";

const TEMPLATE_OPTIONS: { value: TemplateType; label: string; docType: string }[] = [
  { value: "class12_marksheet", label: "Class 12 Mark Sheet", docType: "class12_marksheet" },
  { value: "class11_marksheet", label: "Class 11 Mark Sheet", docType: "class11_marksheet" },
  { value: "passing_certificate", label: "Passing Certificate", docType: "passing_certificate" },
  { value: "migration_certificate", label: "Migration Certificate", docType: "migration_certificate" },
  { value: "transfer_certificate", label: "Transfer / SLC", docType: "transfer_certificate" },
  { value: "character_certificate", label: "Character Certificate", docType: "character_certificate" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  onDocumentCreated: () => void;
}

const NEB_GRADE = (mPercent: number) => {
  if (mPercent >= 90) return { grade: "A+", gp: 4.0 };
  if (mPercent >= 80) return { grade: "A", gp: 3.6 };
  if (mPercent >= 70) return { grade: "B+", gp: 3.2 };
  if (mPercent >= 60) return { grade: "B", gp: 2.8 };
  if (mPercent >= 50) return { grade: "C+", gp: 2.4 };
  if (mPercent >= 40) return { grade: "C", gp: 2.0 };
  if (mPercent >= 30) return { grade: "D+", gp: 1.6 };
  if (mPercent >= 20) return { grade: "D", gp: 1.2 };
  return { grade: "NG", gp: 0 };
};

const formatStudentMeta = (s: Student) => {
  const parts = [s.stream, s.class ? `Grade ${s.class}` : null, s.section ? `Sec ${s.section}` : null].filter(Boolean);
  return parts.length ? parts.join(" · ") : "";
};

const DocumentTemplateDialog = ({ open, onOpenChange, students, onDocumentCreated }: Props) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [templateType, setTemplateType] = useState<TemplateType>("class12_marksheet");
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [exams, setExams] = useState<{ id: string; title: string; class: string }[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // shared
  const [common, setCommon] = useState({
    serial_number: "",
    issued_date: format(new Date(), "yyyy-MM-dd"),
    father_name: "",
    mother_name: "",
    district: "",
    municipality: "",
    ward_no: "",
    exam_year_bs: "",
    exam_year_ad: "",
    neb_regd_no: "",
    symbol_no: "",
    gpa: "",
    overall_grade: "",
    result_status: "PASSED" as string,
  });

  // marksheet rows
  const [marksRows, setMarksRows] = useState<MarkRow[]>([]);

  // certificate specifics
  const [transferData, setTransferData] = useState<TransferCertificateData>({
    serial_number: "",
    admission_date: "",
    last_class_attended: "Class 12",
    date_of_leaving: format(new Date(), "yyyy-MM-dd"),
    reason_of_leaving: "Completion of +2",
    conduct: "Excellent",
    fees_cleared: true,
    issued_date: format(new Date(), "yyyy-MM-dd"),
  });

  const [migrationPurpose, setMigrationPurpose] = useState("Higher Education");
  const [characterConduct, setCharacterConduct] = useState("excellent");

  useEffect(() => { fetchSchoolSettings(); fetchExams(); }, []);
  useEffect(() => {
    if (selectedStudent) {
      setCommon((p) => ({ ...p, father_name: selectedStudent.guardian_name || p.father_name }));
    }
  }, [selectedStudent]);

  const fetchSchoolSettings = async () => {
    const { data } = await supabase.from("school_settings")
      .select("school_name, school_address, established_year, logo_url, principal_name").maybeSingle();
    setSchoolSettings(data || { school_name: "Milestone International College", school_address: "Kathmandu, Nepal", established_year: null, logo_url: null, principal_name: null });
  };
  const fetchExams = async () => {
    const { data } = await supabase.from("exams").select("id, title, class").in("class", ["11","12"]).order("created_at", { ascending: false });
    setExams(data || []);
  };

  const handleAutoLoadMarks = async () => {
    if (!selectedStudent || !selectedExamId) {
      toast({ title: "Select an exam and student first", variant: "destructive" });
      return;
    }
    setLoadingMarks(true);
    const { data: marks } = await supabase.from("exam_marks")
      .select("theory_marks, practical_marks, total_marks, grade, grade_point, subject:subjects(id,name,code,credit_hours,theory_full_marks,practical_full_marks,is_practical,full_marks)")
      .eq("exam_id", selectedExamId).eq("student_id", selectedStudent.id);

    const rows: MarkRow[] = (marks || []).map((m: any) => ({
      code: m.subject?.code || "",
      name: m.subject?.name || "",
      credit_hours: m.subject?.credit_hours || 0,
      theory_full: m.subject?.theory_full_marks ?? (m.subject?.full_marks ?? 75),
      theory_marks: m.theory_marks,
      practical_full: m.subject?.is_practical ? (m.subject?.practical_full_marks ?? 25) : 0,
      practical_marks: m.practical_marks,
      total: m.total_marks,
      grade: m.grade,
      grade_point: m.grade_point,
    }));
    setMarksRows(rows);

    // compute GPA
    let totCr = 0, totGp = 0;
    rows.forEach(r => { if (r.grade_point != null) { totCr += r.credit_hours; totGp += r.grade_point * r.credit_hours; } });
    const gpa = totCr > 0 ? (totGp / totCr).toFixed(2) : "";
    const gradeFromGpa = gpa ? NEB_GRADE(Number(gpa) * 25).grade : "";
    setCommon((p) => ({ ...p, gpa, overall_grade: gradeFromGpa }));
    setLoadingMarks(false);
    toast({ title: `Loaded ${rows.length} subjects` });
  };

  const addManualRow = () => setMarksRows((r) => [...r, { code: "", name: "", credit_hours: 4, theory_full: 75, theory_marks: null, practical_full: 25, practical_marks: null, total: null, grade: null, grade_point: null }]);
  const updateRow = (i: number, patch: Partial<MarkRow>) => {
    setMarksRows((rows) => rows.map((r, idx) => {
      if (idx !== i) return r;
      const merged = { ...r, ...patch };
      const t = merged.theory_marks ?? 0; const p = merged.practical_marks ?? 0;
      const total = (merged.theory_marks ?? 0) + (merged.practical_marks ?? 0);
      const fullSum = merged.theory_full + merged.practical_full;
      const pct = fullSum > 0 ? (total / fullSum) * 100 : 0;
      const { grade, gp } = NEB_GRADE(pct);
      return { ...merged, total, grade, grade_point: gp };
    }));
  };

  const docTypeMap: Record<TemplateType, string> = {
    class12_marksheet: "class12_marksheet",
    class11_marksheet: "class11_marksheet",
    passing_certificate: "passing_certificate",
    migration_certificate: "migration_certificate",
    transfer_certificate: "transfer_certificate",
    character_certificate: "character_certificate",
  };

  const docTitle = useMemo(() => TEMPLATE_OPTIONS.find(t => t.value === templateType)?.label || "Document", [templateType]);

  const renderTemplate = () => {
    if (!selectedStudent || !schoolSettings) return null;
    const studentForTpl = selectedStudent;

    switch (templateType) {
      case "class12_marksheet":
      case "class11_marksheet": {
        const data: MarkSheetData = {
          serial_number: common.serial_number,
          symbol_no: common.symbol_no,
          neb_regd_no: common.neb_regd_no,
          exam_year_bs: common.exam_year_bs,
          exam_year_ad: common.exam_year_ad,
          issued_date: common.issued_date,
          gpa: common.gpa,
          overall_grade: common.overall_grade,
          result_status: common.result_status,
          subjects: marksRows,
          variant: templateType === "class12_marksheet" ? "class12" : "class11",
        };
        return <Class12MarkSheetTemplate ref={templateRef} student={studentForTpl} schoolSettings={schoolSettings} data={data} />;
      }
      case "passing_certificate": {
        const data: PassingCertificateData = {
          serial_number: common.serial_number, symbol_no: common.symbol_no, neb_regd_no: common.neb_regd_no,
          exam_year_bs: common.exam_year_bs, exam_year_ad: common.exam_year_ad,
          gpa: common.gpa, overall_grade: common.overall_grade, issued_date: common.issued_date,
          father_name: common.father_name, mother_name: common.mother_name,
        };
        return <PassingCertificateTemplate ref={templateRef} student={studentForTpl} schoolSettings={schoolSettings} data={data} />;
      }
      case "migration_certificate": {
        const data: MigrationCertificateData = {
          serial_number: common.serial_number, symbol_no: common.symbol_no, neb_regd_no: common.neb_regd_no,
          exam_year_bs: common.exam_year_bs, exam_year_ad: common.exam_year_ad,
          gpa: common.gpa, issued_date: common.issued_date,
          father_name: common.father_name, mother_name: common.mother_name, purpose: migrationPurpose,
        };
        return <MigrationCertificateTemplate ref={templateRef} student={studentForTpl} schoolSettings={schoolSettings} data={data} />;
      }
      case "transfer_certificate": {
        const data: TransferCertificateData = {
          ...transferData,
          serial_number: common.serial_number || transferData.serial_number,
          issued_date: common.issued_date,
          father_name: common.father_name, mother_name: common.mother_name,
          district: common.district, municipality: common.municipality, ward_no: common.ward_no,
        };
        return <TransferCertificateTemplate ref={templateRef} student={studentForTpl} schoolSettings={schoolSettings} data={data} />;
      }
      case "character_certificate": {
        const data: CharacterCertificateData = {
          serial_number: common.serial_number,
          exam_year_bs: common.exam_year_bs, exam_year_ad: common.exam_year_ad,
          gpa: common.gpa, overall_grade: common.overall_grade, issued_date: common.issued_date,
          father_name: common.father_name, mother_name: common.mother_name,
          district: common.district, municipality: common.municipality, ward_no: common.ward_no,
          conduct: characterConduct,
        };
        return <CharacterCertificateTemplate ref={templateRef} student={studentForTpl} schoolSettings={schoolSettings} data={data} />;
      }
    }
  };

  const handleSave = async () => {
    if (!selectedStudent || !templateRef.current) {
      toast({ title: "Select a student first", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const dataUrl = await toPng(templateRef.current, { quality: 1, pixelRatio: 2, backgroundColor: "#ffffff" });
      const resp = await fetch(dataUrl); const blob = await resp.blob();
      const fileName = `documents/${Date.now()}-${selectedStudent.registration_number}-${templateType}.png`;
      const { error: upErr } = await supabase.storage.from("content-images").upload(fileName, blob, { contentType: "image/png" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("content-images").getPublicUrl(fileName);
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        student_id: selectedStudent.id,
        document_type: docTypeMap[templateType],
        title: docTitle,
        serial_number: common.serial_number || null,
        issued_date: common.issued_date,
        document_data: JSON.parse(JSON.stringify({ ...common, marksRows, transferData, migrationPurpose, characterConduct })),
        document_image_url: pub.publicUrl,
        created_by: user?.id,
      };
      const { error } = await supabase.from("student_documents").insert(payload);
      if (error) throw error;
      toast({ title: "Document saved" });
      onDocumentCreated();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDownload = async () => {
    if (!templateRef.current || !selectedStudent) return;
    const url = await toPng(templateRef.current, { quality: 1, pixelRatio: 2, backgroundColor: "#ffffff" });
    const a = document.createElement("a");
    a.download = `${selectedStudent.full_name.replace(/\s+/g, "_")}_${templateType}.png`;
    a.href = url; a.click();
  };

  const convertDob = (key: "exam_year_bs", target: "exam_year_ad") => {
    const ad = convertBSDateStringToAD(common[key], "YYYY-MM-DD");
    if (ad) setCommon((p) => ({ ...p, [target]: ad }));
  };

  const isMarkSheet = templateType === "class12_marksheet" || templateType === "class11_marksheet";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] sm:max-w-[95vw] max-h-[95vh] overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Create +2 Document</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[80vh]">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-4">
              <div>
                <Label>Student *</Label>
                <Select value={selectedStudent?.id || ""} onValueChange={(v) => setSelectedStudent(students.find(s => s.id === v) || null)}>
                  <SelectTrigger><SelectValue placeholder="Choose a +2 student" /></SelectTrigger>
                  <SelectContent>
                    {students.filter(s => s.class === "11" || s.class === "12").map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.registration_number}) — {formatStudentMeta(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Template</Label>
                <Tabs value={templateType} onValueChange={(v) => setTemplateType(v as TemplateType)}>
                  <TabsList className="flex w-full flex-wrap h-auto gap-1">
                    {TEMPLATE_OPTIONS.map(t => (
                      <TabsTrigger key={t.value} value={t.value} className="text-xs flex-1 min-w-[120px]">{t.label}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Serial No.</Label><Input value={common.serial_number} onChange={(e) => setCommon({...common, serial_number: e.target.value})} /></div>
                <div><Label>Date of Issue</Label><Input type="date" value={common.issued_date} onChange={(e) => setCommon({...common, issued_date: e.target.value})} /></div>
              </div>

              {(isMarkSheet || ["passing_certificate","migration_certificate","character_certificate"].includes(templateType)) && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>NEB Regd. No.</Label><Input value={common.neb_regd_no} onChange={(e) => setCommon({...common, neb_regd_no: e.target.value})} /></div>
                    <div><Label>Symbol No.</Label><Input value={common.symbol_no} onChange={(e) => setCommon({...common, symbol_no: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Exam Year (B.S.)</Label>
                      <div className="flex gap-2">
                        <Input value={common.exam_year_bs} onChange={(e) => setCommon({...common, exam_year_bs: e.target.value})} placeholder="2081" />
                        <Button type="button" size="sm" variant="outline" onClick={() => convertDob("exam_year_bs","exam_year_ad")}>→ AD</Button>
                      </div>
                    </div>
                    <div><Label>Exam Year (A.D.)</Label><Input value={common.exam_year_ad} onChange={(e) => setCommon({...common, exam_year_ad: e.target.value})} placeholder="2024" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>GPA</Label><Input value={common.gpa} onChange={(e) => setCommon({...common, gpa: e.target.value})} placeholder="3.45" /></div>
                    <div><Label>Overall Grade</Label><Input value={common.overall_grade} onChange={(e) => setCommon({...common, overall_grade: e.target.value})} placeholder="A" /></div>
                  </div>
                </>
              )}

              {(templateType === "passing_certificate" || templateType === "migration_certificate" || templateType === "character_certificate" || templateType === "transfer_certificate") && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Father's Name</Label><Input value={common.father_name} onChange={(e) => setCommon({...common, father_name: e.target.value})} /></div>
                  <div><Label>Mother's Name</Label><Input value={common.mother_name} onChange={(e) => setCommon({...common, mother_name: e.target.value})} /></div>
                </div>
              )}

              {(templateType === "character_certificate" || templateType === "transfer_certificate") && (
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Municipality</Label><Input value={common.municipality} onChange={(e) => setCommon({...common, municipality: e.target.value})} /></div>
                  <div><Label>Ward No.</Label><Input value={common.ward_no} onChange={(e) => setCommon({...common, ward_no: e.target.value})} /></div>
                  <div><Label>District</Label><Input value={common.district} onChange={(e) => setCommon({...common, district: e.target.value})} /></div>
                </div>
              )}

              {isMarkSheet && (
                <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="flex-1 min-w-[180px]">
                      <Label>Auto-load from Exam</Label>
                      <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                        <SelectTrigger><SelectValue placeholder="Pick a class 11/12 exam" /></SelectTrigger>
                        <SelectContent>
                          {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.title} (Class {e.class})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="button" onClick={handleAutoLoadMarks} disabled={loadingMarks}>
                      <Sparkles className="w-4 h-4 mr-1" /> Auto-fill
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Subjects ({marksRows.length})</span>
                    <Button type="button" size="sm" variant="outline" onClick={addManualRow}>Add row</Button>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-auto">
                    {marksRows.map((r, i) => (
                      <div key={i} className="grid grid-cols-12 gap-1 text-xs">
                        <Input className="col-span-2 h-8" placeholder="Code" value={r.code} onChange={(e) => updateRow(i,{code:e.target.value})} />
                        <Input className="col-span-4 h-8" placeholder="Subject" value={r.name} onChange={(e) => updateRow(i,{name:e.target.value})} />
                        <Input className="col-span-1 h-8" type="number" placeholder="Cr" value={r.credit_hours} onChange={(e) => updateRow(i,{credit_hours:+e.target.value})} />
                        <Input className="col-span-2 h-8" type="number" inputMode="decimal" placeholder={`Th/${r.theory_full}`} value={r.theory_marks ?? ""} onChange={(e) => updateRow(i,{theory_marks: e.target.value===""?null:+e.target.value})} />
                        <Input className="col-span-2 h-8" type="number" inputMode="decimal" placeholder={r.practical_full>0?`Pr/${r.practical_full}`:"—"} value={r.practical_marks ?? ""} onChange={(e) => updateRow(i,{practical_marks: e.target.value===""?null:+e.target.value})} disabled={r.practical_full===0} />
                        <div className="col-span-1 flex items-center justify-center font-bold text-[11px]" style={{ color: "#C9A227" }}>{r.grade || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {templateType === "transfer_certificate" && (
                <div className="space-y-3 rounded-lg border p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Admission Date</Label><Input type="date" value={transferData.admission_date} onChange={(e) => setTransferData({...transferData, admission_date:e.target.value})} /></div>
                    <div><Label>Date of Leaving</Label><Input type="date" value={transferData.date_of_leaving} onChange={(e) => setTransferData({...transferData, date_of_leaving:e.target.value})} /></div>
                  </div>
                  <div><Label>Last Class Attended</Label><Input value={transferData.last_class_attended} onChange={(e) => setTransferData({...transferData, last_class_attended:e.target.value})} /></div>
                  <div><Label>Reason of Leaving</Label><Textarea rows={2} value={transferData.reason_of_leaving} onChange={(e) => setTransferData({...transferData, reason_of_leaving:e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div><Label>Conduct</Label><Input value={transferData.conduct} onChange={(e) => setTransferData({...transferData, conduct:e.target.value})} /></div>
                    <div className="flex items-center gap-2"><Switch checked={transferData.fees_cleared} onCheckedChange={(c) => setTransferData({...transferData, fees_cleared:c})} /><Label>All fees cleared</Label></div>
                  </div>
                </div>
              )}

              {templateType === "migration_certificate" && (
                <div><Label>Purpose</Label><Input value={migrationPurpose} onChange={(e) => setMigrationPurpose(e.target.value)} placeholder="Higher Education" /></div>
              )}
              {templateType === "character_certificate" && (
                <div><Label>Conduct</Label><Input value={characterConduct} onChange={(e) => setCharacterConduct(e.target.value)} placeholder="excellent" /></div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sticky bottom-0 pt-3 bg-background pb-[env(safe-area-inset-bottom)]">
                <Button onClick={handleSave} disabled={saving || !selectedStudent} className="flex-1"><Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save Document"}</Button>
                <Button variant="outline" onClick={handleDownload} disabled={!selectedStudent} className="flex-1"><Download className="w-4 h-4 mr-1" />Download PNG</Button>
              </div>
            </div>
          </ScrollArea>

          <ScrollArea className="h-full border rounded-lg bg-muted/20 p-2">
            <div className="origin-top-left scale-[0.65] sm:scale-75" style={{ transformOrigin: "top left", width: "fit-content" }}>
              {renderTemplate() || <div className="p-6 text-sm text-muted-foreground">Select a student to preview the document.</div>}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentTemplateDialog;
