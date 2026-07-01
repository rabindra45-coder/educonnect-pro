import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Calculator, Search, ChevronLeft, CheckCircle2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Exam { id: string; title: string; exam_type: string; class: string; section: string | null; stream: string | null; academic_year: string; is_published: boolean; }
interface Student { id: string; full_name: string; roll_number: number | null; registration_number: string; photo_url: string | null; class: string; stream: string | null; section: string | null; }
interface Subject { id: string; name: string; code: string; credit_hours: number; theory_full_marks: number; practical_full_marks: number; is_practical: boolean; full_marks: number; pass_marks: number; }
interface MarkRow { subject_id: string; theory_marks: number | null; practical_marks: number | null; total_marks: number | null; grade: string | null; grade_point: number | null; remarks: string | null; existing_id?: string; }

const NEB_GRADE = (pct: number) => {
  if (pct >= 90) return { grade: "A+", gp: 4.0 };
  if (pct >= 80) return { grade: "A", gp: 3.6 };
  if (pct >= 70) return { grade: "B+", gp: 3.2 };
  if (pct >= 60) return { grade: "B", gp: 2.8 };
  if (pct >= 50) return { grade: "C+", gp: 2.4 };
  if (pct >= 40) return { grade: "C", gp: 2.0 };
  if (pct >= 30) return { grade: "D+", gp: 1.6 };
  if (pct >= 20) return { grade: "D", gp: 1.2 };
  return { grade: "NG", gp: 0 };
};

const MarksEntry = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set());
  const [marks, setMarks] = useState<Record<string, MarkRow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { if (examId) fetchExam(); }, [examId]);
  useEffect(() => { if (selectedStudent && exam) fetchSubjectsAndMarks(); }, [selectedStudent?.id, exam?.id]);

  const fetchExam = async () => {
    setLoading(true);
    const { data: examData, error } = await supabase.from("exams").select("*").eq("id", examId).single();
    if (error || !examData) { toast({ title: "Exam not found", variant: "destructive" }); navigate("/admin/exams"); return; }
    setExam(examData as Exam);

    // Students store granular class like "12-Science-Physical" plus a normalized `grade` ("11"/"12").
    // Match on grade first, and also accept class starting with the exam class number.
    let q = supabase.from("students")
      .select("id, full_name, roll_number, registration_number, photo_url, class, grade, stream, section")
      .eq("status", "active")
      .or(`grade.eq.${examData.class},class.eq.${examData.class},class.ilike.${examData.class}-%`);
    if (examData.stream && examData.stream !== "common") q = q.eq("stream", examData.stream);
    if (examData.section) q = q.eq("section", examData.section);
    const { data: studs } = await q.order("roll_number", { ascending: true });
    setStudents(studs || []);
    setLoading(false);
  };

  const fetchSubjectsAndMarks = async () => {
    if (!selectedStudent || !exam) return;
    const streamFilter = selectedStudent.stream || "common";
    const { data: subs } = await supabase.from("subjects")
      .select("id, name, code, credit_hours, theory_full_marks, practical_full_marks, is_practical, full_marks, pass_marks, class, stream, display_order")
      .eq("is_active", true)
      .or(`class.eq.${selectedStudent.class},class.eq.both`)
      .order("display_order", { ascending: true });
    const filtered = (subs || []).filter((s: any) => s.stream === streamFilter || s.stream === "common");
    setSubjects(filtered);

    const { data: existing } = await supabase.from("exam_marks").select("*")
      .eq("exam_id", exam.id).eq("student_id", selectedStudent.id);

    const next: Record<string, MarkRow> = {};
    filtered.forEach((s) => {
      const ex = existing?.find((m) => m.subject_id === s.id);
      next[s.id] = ex ? {
        subject_id: s.id, theory_marks: ex.theory_marks as any, practical_marks: ex.practical_marks as any,
        total_marks: ex.total_marks as any, grade: ex.grade, grade_point: ex.grade_point as any,
        remarks: ex.remarks, existing_id: ex.id,
      } : { subject_id: s.id, theory_marks: null, practical_marks: null, total_marks: null, grade: null, grade_point: null, remarks: null };
    });
    setMarks(next);
    // Preselect subjects that already have marks; otherwise start with none — admin picks the 6 required.
    const preselected = new Set<string>(
      filtered.filter((s) => existing?.some((m) => m.subject_id === s.id)).map((s) => s.id)
    );
    setSelectedSubjectIds(preselected);
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const updateMark = (subjectId: string, patch: Partial<MarkRow>) => {
    const sub = subjects.find(s => s.id === subjectId)!;
    setMarks((prev) => {
      const cur = prev[subjectId];
      const merged = { ...cur, ...patch };
      const t = merged.theory_marks ?? 0; const p = (sub.is_practical ? (merged.practical_marks ?? 0) : 0);
      const total = (merged.theory_marks ?? 0) + (sub.is_practical ? (merged.practical_marks ?? 0) : 0);
      const fullSum = sub.theory_full_marks + (sub.is_practical ? sub.practical_full_marks : 0);
      const pct = fullSum > 0 ? (total / fullSum) * 100 : 0;
      const { grade, gp } = NEB_GRADE(pct);
      return { ...prev, [subjectId]: { ...merged, total_marks: total, grade, grade_point: gp } };
    });
  };

  const enteredCount = useMemo(() => Object.values(marks).filter(m => m.theory_marks != null).length, [marks]);

  const saveAll = async () => {
    if (!selectedStudent || !exam) return;
    setSaving(true);
    const rows = Object.values(marks)
      .filter(m => m.theory_marks != null || m.practical_marks != null)
      .map(m => ({
        exam_id: exam.id, student_id: selectedStudent.id, subject_id: m.subject_id,
        theory_marks: m.theory_marks, practical_marks: m.practical_marks,
        total_marks: m.total_marks, grade: m.grade, grade_point: m.grade_point, remarks: m.remarks,
      }));
    const { error } = await supabase.from("exam_marks").upsert(rows, { onConflict: "exam_id,student_id,subject_id" });
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Saved ${rows.length} subjects for ${selectedStudent.full_name}` });
    fetchSubjectsAndMarks();
  };

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.registration_number.toLowerCase().includes(search.toLowerCase()) ||
    String(s.roll_number || "").includes(search)
  );

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></AdminLayout>;

  return (
    <>
      <Helmet><title>Enter Marks | Admin</title></Helmet>
      <AdminLayout>
        <div className="space-y-4 pb-32">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/exams")}><ArrowLeft className="w-5 h-5" /></Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{exam?.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Class {exam?.class}{exam?.stream && exam.stream !== "common" ? ` · ${exam.stream}` : ""}{exam?.section ? ` · Sec ${exam.section}` : ""} · {exam?.academic_year}
              </p>
            </div>
          </div>

          {!selectedStudent ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select a student</CardTitle>
                <CardDescription>{students.length} eligible · search by name, roll, or reg. no.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-10 h-12" placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-auto">
                  {filteredStudents.map((s) => (
                    <button key={s.id} onClick={() => setSelectedStudent(s)} className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary hover:bg-muted/40 transition text-left">
                      <Avatar><AvatarImage src={s.photo_url || undefined} /><AvatarFallback>{s.full_name[0]}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{s.full_name}</p>
                        <p className="text-xs text-muted-foreground">Roll {s.roll_number || "—"} · {s.registration_number}</p>
                      </div>
                      {s.stream && <Badge variant="outline" className="text-[10px]">{s.stream}</Badge>}
                    </button>
                  ))}
                  {filteredStudents.length === 0 && <p className="col-span-full text-center text-muted-foreground py-6">No students match.</p>}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(null)}><ChevronLeft className="w-5 h-5" /></Button>
                  <Avatar><AvatarImage src={selectedStudent.photo_url || undefined} /><AvatarFallback>{selectedStudent.full_name[0]}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{selectedStudent.full_name}</p>
                    <p className="text-xs text-muted-foreground">Roll {selectedStudent.roll_number || "—"} · {selectedStudent.stream || "—"}</p>
                  </div>
                  <Badge className="gap-1"><CheckCircle2 className="w-3 h-3" />{enteredCount}/{subjects.length}</Badge>
                </CardContent>
              </Card>

              {subjects.length === 0 ? (
                <Card><CardContent className="py-10 text-center text-muted-foreground">No subjects mapped to {selectedStudent.stream || "this stream"} / Class {selectedStudent.class}. Add them in Subjects Management.</CardContent></Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subjects.map((sub) => {
                    const m = marks[sub.id];
                    return (
                      <Card key={sub.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-base">{sub.name}</CardTitle>
                              <p className="text-xs text-muted-foreground">{sub.code} · {sub.credit_hours} cr</p>
                            </div>
                            <Badge variant="outline" className="text-[11px] font-bold" style={{ color: m?.grade && m.grade !== "NG" ? "#C9A227" : undefined }}>{m?.grade || "—"} {m?.grade_point != null ? `(${m.grade_point.toFixed(1)})` : ""}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className={`grid ${sub.is_practical ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                            <div>
                              <Label className="text-xs">Theory / {sub.theory_full_marks}</Label>
                              <Input type="number" inputMode="decimal" min={0} max={sub.theory_full_marks} className="h-12 text-base"
                                value={m?.theory_marks ?? ""} onChange={(e) => updateMark(sub.id, { theory_marks: e.target.value === "" ? null : Number(e.target.value) })} />
                            </div>
                            {sub.is_practical && (
                              <div>
                                <Label className="text-xs">Practical / {sub.practical_full_marks}</Label>
                                <Input type="number" inputMode="decimal" min={0} max={sub.practical_full_marks} className="h-12 text-base"
                                  value={m?.practical_marks ?? ""} onChange={(e) => updateMark(sub.id, { practical_marks: e.target.value === "" ? null : Number(e.target.value) })} />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-bold">{m?.total_marks ?? "—"} / {sub.theory_full_marks + (sub.is_practical ? sub.practical_full_marks : 0)}</span>
                          </div>
                          <Textarea rows={1} placeholder="Remarks (optional)" value={m?.remarks ?? ""} onChange={(e) => updateMark(sub.id, { remarks: e.target.value })} />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calculator className="w-4 h-4" />NEB Grading</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-[11px]">
                {[{g:"A+",r:"90+",p:"4.0"},{g:"A",r:"80–89",p:"3.6"},{g:"B+",r:"70–79",p:"3.2"},{g:"B",r:"60–69",p:"2.8"},{g:"C+",r:"50–59",p:"2.4"},{g:"C",r:"40–49",p:"2.0"},{g:"D+",r:"30–39",p:"1.6"},{g:"D",r:"20–29",p:"1.2"},{g:"NG",r:"<20",p:"0.0"}].map(x => (
                  <div key={x.g} className="text-center p-2 bg-muted rounded"><div className="font-bold">{x.g}</div><div className="text-muted-foreground">{x.r}%</div><div>GP {x.p}</div></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedStudent && subjects.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 md:left-64 z-40 border-t bg-background/95 backdrop-blur p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
            <div className="max-w-4xl mx-auto flex gap-2">
              <Button variant="outline" onClick={() => setSelectedStudent(null)} className="hidden sm:flex">Back to list</Button>
              <Button onClick={saveAll} disabled={saving} className="flex-1 h-12 text-base">
                <Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : `Save ${enteredCount} subjects`}
              </Button>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default MarksEntry;
