import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { FileText, Calendar, Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PublishedExam {
  id: string;
  title: string;
  academic_year: string;
  exam_type: string;
  class: string;
  created_at: string;
}

interface Standing {
  student_id: string;
  full_name: string;
  roll_number: string | null;
  class_name: string | null;
  total_marks: number;
  total_full_marks?: number;
  theory_marks?: number;
  practical_marks?: number;
  percentage: number;
  gpa: number;
  grade: string;
  rank: number;
}

const rankIcon = (r: number) => {
  if (r === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
  if (r === 2) return <Medal className="w-4 h-4 text-gray-400" />;
  if (r === 3) return <Award className="w-4 h-4 text-amber-700" />;
  return null;
};

const ExamResults = () => {
  const [exams, setExams] = useState<PublishedExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedExam, setSelectedExam] = useState<PublishedExam | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loadingStandings, setLoadingStandings] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("exams")
        .select("id, title, academic_year, exam_type, class, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      setExams(data || []);
      setLoading(false);
      if (data && data.length > 0) setSelectedExam(data[0]);
    })();
  }, []);

  useEffect(() => {
    if (!selectedExam) return;
    (async () => {
      setLoadingStandings(true);
      const { data: publicRows, error } = await supabase
        .from("public_exam_standings")
        .select("student_id, full_name, roll_number, class_name, total_marks, percentage, gpa, grade, rank")
        .eq("exam_id", selectedExam.id)
        .order("rank", { ascending: true });

      let rows: Standing[] = (publicRows || []).map((r: any) => ({
        student_id: r.student_id,
        full_name: r.full_name || "—",
        roll_number: r.roll_number || null,
        class_name: r.class_name || null,
        total_marks: r.total_marks || 0,
        percentage: r.percentage || 0,
        gpa: r.gpa || 0,
        grade: r.grade || "-",
        rank: r.rank || 0,
      }));

      if (error) rows = [];
      setStandings(rows);
      setLoadingStandings(false);
    })();
  }, [selectedExam]);

  const years = ["all", ...Array.from(new Set(exams.map((r) => r.academic_year)))];
  const filteredExams = selectedYear === "all" ? exams : exams.filter((r) => r.academic_year === selectedYear);

  return (
    <>
      <Helmet>
        <title>Exam Results | Milestone International College</title>
        <meta name="description" content="Published exam results, merit lists and student standings." />
      </Helmet>

      <MainLayout>
        <section className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Exam Results & Merit List</h1>
              <p className="text-lg text-primary-foreground/80">Live standings from published +2 examinations.</p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 space-y-8">
            {exams.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                      selectedYear === year ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                    }`}
                  >
                    {year === "all" ? "All Years" : year}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="grid md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Results Published</h3>
                <p className="text-muted-foreground">Published exam results will appear here.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[320px_1fr] gap-6">
                <div className="space-y-3">
                  {filteredExams.map((exam) => (
                    <Card
                      key={exam.id}
                      onClick={() => setSelectedExam(exam)}
                      className={`cursor-pointer transition-all ${selectedExam?.id === exam.id ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"}`}
                    >
                      <CardHeader className="pb-2">
                        <Badge variant="secondary" className="w-fit mb-1">{exam.exam_type}</Badge>
                        <CardTitle className="text-base leading-tight">{exam.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{exam.academic_year}</span>
                        <span>Class {exam.class}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      {selectedExam ? `${selectedExam.title} — Merit List` : "Select an exam"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingStandings ? (
                      <div className="py-10 text-center text-muted-foreground">Loading standings…</div>
                    ) : standings.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground">No marks recorded for this exam yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Rank</TableHead>
                              <TableHead>Student</TableHead>
                              <TableHead className="hidden md:table-cell">Roll</TableHead>
                              <TableHead className="text-right">Marks</TableHead>
                              <TableHead className="text-right hidden sm:table-cell">%</TableHead>
                              <TableHead className="text-right">GPA</TableHead>
                              <TableHead className="text-right">Grade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {standings.map((s) => (
                              <TableRow key={s.student_id} className={s.rank <= 3 ? "bg-primary/5" : ""}>
                                <TableCell className="font-semibold flex items-center gap-1">
                                  {rankIcon(s.rank)} #{s.rank}
                                </TableCell>
                                <TableCell className="font-medium">{s.full_name}</TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground">{s.roll_number || "—"}</TableCell>
                                <TableCell className="text-right">{s.total_marks}</TableCell>
                                <TableCell className="text-right hidden sm:table-cell">{s.percentage.toFixed(1)}%</TableCell>
                                <TableCell className="text-right font-semibold">{s.gpa.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                  <Badge>{s.grade}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default ExamResults;
