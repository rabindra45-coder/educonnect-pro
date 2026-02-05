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
import schoolLogo from "@/assets/logo.png";
import nebLogo from "@/assets/neb-logo.png";
import nepalEmblem from "@/assets/nepal-govt-emblem.png";
import principalSignature from "@/assets/principal-signature.png";

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
        pixelRatio: 3,
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
            <div 
              ref={marksheetRef} 
              className="bg-white border-4 border-double border-primary/30 rounded-lg overflow-hidden"
              style={{ fontFamily: "'Times New Roman', serif" }}
            >
              {/* Header with gradient and logos */}
              <div className="bg-gradient-to-r from-primary via-primary/90 to-primary p-4">
                <div className="flex items-center justify-between">
                  {/* Left Logo */}
                  <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                    <img src={nepalEmblem} alt="Nepal Emblem" className="w-full h-full object-contain" />
                  </div>
                  
                  {/* Center Content */}
                  <div className="text-center flex-1 px-4">
                    <p className="text-white/90 text-xs tracking-wider mb-1">नेपाल सरकार • शिक्षा मन्त्रालय</p>
                    <h1 className="text-white text-2xl font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                      श्री दुर्गा सरस्वती जनता माध्यमिक विद्यालय
                    </h1>
                    <h2 className="text-white/95 text-lg font-semibold mt-1">
                      Shree Durga Saraswati Janata Secondary School
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      Dumarwana, Saptari, Province No. 2, Nepal
                    </p>
                    <p className="text-white/70 text-xs mt-1">Estd. 2016 B.S. | School Code: 27-01-5-009</p>
                  </div>
                  
                  {/* Right Logo */}
                  <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                    <img src={schoolLogo} alt="School Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
              
              {/* Title Banner */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-2 text-center">
                <h3 className="text-white font-bold text-lg tracking-widest uppercase drop-shadow">
                  GRADE SHEET / मार्कशीट
                </h3>
              </div>
              
              {/* Exam Info */}
              <div className="bg-primary/5 py-3 text-center border-b-2 border-primary/20">
                <h4 className="text-primary font-bold text-lg">{result.exam_title}</h4>
                <p className="text-gray-600 text-sm">Academic Year: {result.academic_year}</p>
              </div>
              
              {/* Student Info */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 text-sm border-2 border-primary/10 rounded-lg p-4 bg-gray-50/50">
                  <div className="flex">
                    <span className="text-gray-500 w-32">Student Name:</span>
                    <span className="font-semibold text-gray-800">{studentName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Registration No:</span>
                    <span className="font-semibold text-gray-800">{registrationNumber}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Class:</span>
                    <span className="font-semibold text-gray-800">{className}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Class Rank:</span>
                    <span className="font-semibold text-gray-800">{result.rank > 0 ? `#${result.rank}` : "N/A"}</span>
                  </div>
                </div>

                {/* Marks Table */}
                <div className="border-2 border-primary/20 rounded-lg overflow-hidden mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="py-3 px-4 text-left font-semibold">Subject</th>
                        <th className="py-3 px-3 text-center font-semibold">Theory</th>
                        <th className="py-3 px-3 text-center font-semibold">Practical</th>
                        <th className="py-3 px-3 text-center font-semibold">Total</th>
                        <th className="py-3 px-3 text-center font-semibold">Grade</th>
                        <th className="py-3 px-3 text-center font-semibold">GP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjects.map((subject, index) => (
                        <tr 
                          key={index} 
                          className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        >
                          <td className="py-2.5 px-4 font-medium text-gray-800">{subject.name}</td>
                          <td className="py-2.5 px-3 text-center text-gray-700">{subject.theory_marks ?? "-"}</td>
                          <td className="py-2.5 px-3 text-center text-gray-700">{subject.practical_marks ?? "-"}</td>
                          <td className="py-2.5 px-3 text-center font-semibold text-primary">{subject.total_marks}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white ${GRADE_COLORS[subject.grade] || 'bg-gray-500'}`}>
                              {subject.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium text-gray-700">{subject.grade_point.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">{result.total_marks}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Marks</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg border border-amber-200">
                    <div className="text-2xl font-bold text-amber-600">{result.percentage.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500 mt-1">Percentage</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{result.gpa.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">GPA</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg border border-purple-200">
                    <span className={`inline-block px-3 py-1 rounded-full text-lg font-bold text-white ${GRADE_COLORS[result.grade] || 'bg-gray-500'}`}>
                      {result.grade}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">Overall Grade</div>
                  </div>
                </div>

                {/* Grading Scale */}
                <div className="border border-gray-200 rounded-lg p-3 mb-6 bg-gray-50/50">
                  <p className="text-xs text-gray-500 text-center font-medium mb-2">NEB GRADING SCALE</p>
                  <div className="flex justify-center gap-2 flex-wrap text-xs">
                    <span className="px-2 py-1 bg-green-500 text-white rounded">A+ (90-100)</span>
                    <span className="px-2 py-1 bg-green-400 text-white rounded">A (80-89)</span>
                    <span className="px-2 py-1 bg-yellow-500 text-white rounded">B+ (70-79)</span>
                    <span className="px-2 py-1 bg-yellow-400 text-white rounded">B (60-69)</span>
                    <span className="px-2 py-1 bg-orange-500 text-white rounded">C+ (50-59)</span>
                    <span className="px-2 py-1 bg-orange-400 text-white rounded">C (40-49)</span>
                    <span className="px-2 py-1 bg-red-400 text-white rounded">D+ (30-39)</span>
                    <span className="px-2 py-1 bg-red-500 text-white rounded">D (20-29)</span>
                    <span className="px-2 py-1 bg-gray-500 text-white rounded">NG (0-19)</span>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="grid grid-cols-3 gap-8 pt-4 border-t-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="h-12 mb-2"></div>
                    <div className="border-t border-gray-400 pt-1">
                      <p className="text-xs text-gray-600">Class Teacher</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="h-12 flex items-end justify-center mb-2">
                      <img src={principalSignature} alt="Principal Signature" className="h-10 object-contain opacity-80" />
                    </div>
                    <div className="border-t border-gray-400 pt-1">
                      <p className="text-xs font-semibold text-gray-700">Principal</p>
                      <p className="text-xs text-gray-500">Headmaster</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="h-12 mb-2"></div>
                    <div className="border-t border-gray-400 pt-1">
                      <p className="text-xs text-gray-600">Date & Seal</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="bg-primary/5 py-2 px-4 text-center border-t border-primary/20">
                <p className="text-xs text-gray-500">
                  This is a computer-generated document. For official use, please obtain a signed copy from the school office.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentResultsCard;
