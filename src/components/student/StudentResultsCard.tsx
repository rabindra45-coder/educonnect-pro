import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Trophy, TrendingUp } from "lucide-react";
import { toPng } from "html-to-image";

interface StudentResultsCardProps {
  studentId: string;
  studentName: string;
  className: string;
  registrationNumber: string;
}

interface ExamResult {
  exam_id: string;
  exam_title: string;
  exam_type: string;
  academic_year: string;
  total_marks: number;
  percentage: number;
  gpa: number;
  grade: string;
  rank: number;
  subjects: {
    name: string;
    code: string;
    theory_marks: number | null;
    practical_marks: number | null;
    total_marks: number;
    grade: string;
    grade_point: number;
  }[];
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "bg-green-500",
  A: "bg-green-400",
  "B+": "bg-yellow-500",
  B: "bg-yellow-400",
  "C+": "bg-orange-500",
  C: "bg-orange-400",
  "D+": "bg-red-400",
  D: "bg-red-500",
  NG: "bg-gray-500",
};

const StudentResultsCard = ({
  studentId,
  studentName,
  className,
  registrationNumber,
}: StudentResultsCardProps) => {
  const [exams, setExams] = useState<{ id: string; title: string; academic_year: string }[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const marksheetRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPublishedExams();
  }, [className]);

  useEffect(() => {
    if (selectedExam) {
      fetchResult();
    }
  }, [selectedExam]);

  const fetchPublishedExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select("id, title, academic_year")
      .eq("class", className)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching exams", variant: "destructive" });
    } else {
      setExams(data || []);
      if (data && data.length > 0) {
        setSelectedExam(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchResult = async () => {
    // Fetch exam details
    const { data: examData } = await supabase
      .from("exams")
      .select("*")
      .eq("id", selectedExam)
      .single();

    // Fetch marks
    const { data: marksData } = await supabase
      .from("exam_marks")
      .select(`
        *,
        subjects!inner(name, code, full_marks, credit_hours)
      `)
      .eq("exam_id", selectedExam)
      .eq("student_id", studentId);

    // Fetch student result
    const { data: resultData } = await supabase
      .from("student_results")
      .select("*")
      .eq("exam_id", selectedExam)
      .eq("student_id", studentId)
      .maybeSingle();

    if (marksData && marksData.length > 0 && examData) {
      const subjects = marksData.map((mark: any) => ({
        name: mark.subjects.name,
        code: mark.subjects.code,
        theory_marks: mark.theory_marks,
        practical_marks: mark.practical_marks,
        total_marks: mark.total_marks || 0,
        grade: mark.grade || "NG",
        grade_point: mark.grade_point || 0,
      }));

      const totalMarks = subjects.reduce((sum, s) => sum + s.total_marks, 0);
      const totalFullMarks = marksData.reduce((sum: number, m: any) => sum + (m.subjects.full_marks || 100), 0);
      const percentage = totalFullMarks > 0 ? (totalMarks / totalFullMarks) * 100 : 0;
      
      const totalCredits = marksData.reduce((sum: number, m: any) => sum + (m.subjects.credit_hours || 4), 0);
      const weightedGP = subjects.reduce((sum, s, i) => sum + s.grade_point * (marksData[i].subjects.credit_hours || 4), 0);
      const gpa = totalCredits > 0 ? weightedGP / totalCredits : 0;

      setResult({
        exam_id: selectedExam,
        exam_title: examData.title,
        exam_type: examData.exam_type,
        academic_year: examData.academic_year,
        total_marks: totalMarks,
        percentage: Math.round(percentage * 100) / 100,
        gpa: Math.round(gpa * 100) / 100,
        grade: resultData?.grade || getOverallGrade(gpa),
        rank: resultData?.rank || 0,
        subjects,
      });
    } else {
      setResult(null);
    }
  };

  const getOverallGrade = (gpa: number): string => {
    if (gpa >= 3.6) return "A+";
    if (gpa >= 3.2) return "A";
    if (gpa >= 2.8) return "B+";
    if (gpa >= 2.4) return "B";
    if (gpa >= 2.0) return "C+";
    if (gpa >= 1.6) return "C";
    if (gpa >= 1.2) return "D+";
    if (gpa >= 0.8) return "D";
    return "NG";
  };

  const downloadMarksheet = async () => {
    if (!marksheetRef.current) return;

    try {
      const dataUrl = await toPng(marksheetRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `Marksheet_${registrationNumber}_${result?.academic_year || ""}.png`;
      link.href = dataUrl;
      link.click();

      toast({ title: "Marksheet downloaded!" });
    } catch (error) {
      toast({ title: "Error downloading marksheet", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading results...
        </CardContent>
      </Card>
    );
  }

  if (exams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No published exam results available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Exam Results
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title} ({exam.academic_year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {result && (
              <Button variant="outline" size="sm" onClick={downloadMarksheet}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No results found for this exam.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{result.gpa.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">GPA</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Badge className={`${GRADE_COLORS[result.grade]} text-white text-lg px-3 py-1`}>
                  {result.grade}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Grade</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{result.percentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Percentage</div>
              </div>
              {result.rank > 0 && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold">#{result.rank}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Class Rank</div>
                </div>
              )}
            </div>

            {/* Printable Marksheet */}
            <div ref={marksheetRef} className="bg-white p-6 border rounded-lg">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">Shree Durga Saraswati Janata Secondary School</h2>
                <p className="text-sm text-muted-foreground">Dumarwana, Saptari, Nepal</p>
                <div className="mt-2 border-t border-b py-2">
                  <h3 className="font-semibold">{result.exam_title}</h3>
                  <p className="text-sm">Academic Year: {result.academic_year}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium">Student Name:</span> {studentName}
                </div>
                <div>
                  <span className="font-medium">Reg. No:</span> {registrationNumber}
                </div>
                <div>
                  <span className="font-medium">Class:</span> {className}
                </div>
                <div>
                  <span className="font-medium">Rank:</span> {result.rank > 0 ? `#${result.rank}` : "N/A"}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">Theory</TableHead>
                    <TableHead className="text-center">Practical</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">GP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.subjects.map((subject, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell className="text-center">{subject.theory_marks ?? "-"}</TableCell>
                      <TableCell className="text-center">{subject.practical_marks ?? "-"}</TableCell>
                      <TableCell className="text-center font-medium">{subject.total_marks}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={subject.grade === "NG" ? "destructive" : "outline"}>
                          {subject.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{subject.grade_point.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div>
                  <span className="font-medium">Total Marks:</span> {result.total_marks}
                </div>
                <div>
                  <span className="font-medium">Percentage:</span> {result.percentage.toFixed(2)}%
                </div>
                <div>
                  <span className="font-medium">GPA:</span> {result.gpa.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Overall Grade:</span>{" "}
                  <Badge className={`${GRADE_COLORS[result.grade]} text-white`}>{result.grade}</Badge>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t text-xs text-muted-foreground text-center">
                <p>NEB Grading: A+ (90-100), A (80-89), B+ (70-79), B (60-69), C+ (50-59), C (40-49), D+ (30-39), D (20-29), NG (0-19)</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentResultsCard;
