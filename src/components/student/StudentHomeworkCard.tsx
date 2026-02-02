import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, CheckCircle2, AlertCircle, FileText, Upload, Eye, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Homework {
  id: string;
  title: string;
  description: string | null;
  class: string;
  section: string | null;
  subject_id: string;
  due_date: string;
  max_marks: number | null;
  attachment_url: string | null;
  allow_late_submission: boolean | null;
  created_at: string;
  subject?: {
    name: string;
    code: string;
  };
  teacher?: {
    full_name: string;
  };
  submission?: {
    id: string;
    status: string;
    marks: number | null;
    remarks: string | null;
    submitted_at: string | null;
  };
}

interface StudentHomeworkCardProps {
  studentId: string;
  studentClass: string;
  section: string | null;
}

const StudentHomeworkCard = ({ studentId, studentClass, section }: StudentHomeworkCardProps) => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHomework();
  }, [studentId, studentClass]);

  const fetchHomework = async () => {
    setIsLoading(true);
    try {
      // Fetch homework for student's class
      const { data: homeworkData, error } = await supabase
        .from("homework")
        .select(`
          *,
          subject:subjects(name, code),
          teacher:teachers(full_name)
        `)
        .eq("class", studentClass)
        .eq("is_published", true)
        .order("due_date", { ascending: true });

      if (error) throw error;

      // Fetch submissions for this student
      const { data: submissions } = await supabase
        .from("homework_submissions")
        .select("*")
        .eq("student_id", studentId);

      // Merge submissions with homework
      const homeworkWithSubmissions = (homeworkData || []).map((hw: any) => ({
        ...hw,
        submission: submissions?.find((s: any) => s.homework_id === hw.id),
      }));

      setHomework(homeworkWithSubmissions);
    } catch (error) {
      console.error("Error fetching homework:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatus = (hw: Homework) => {
    if (hw.submission?.status === "submitted" || hw.submission?.status === "graded") {
      return hw.submission.status;
    }
    const dueDate = new Date(hw.due_date);
    const now = new Date();
    if (dueDate < now) return "overdue";
    if (dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return "due-soon";
    return "pending";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-blue-500 text-white">Submitted</Badge>;
      case "graded":
        return <Badge className="bg-green-500 text-white">Graded</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "due-soon":
        return <Badge className="bg-orange-500 text-white">Due Soon</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleSubmit = async () => {
    if (!selectedHomework || !submissionText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your submission text",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const isLate = new Date(selectedHomework.due_date) < new Date();

      const { error } = await supabase.from("homework_submissions").upsert({
        homework_id: selectedHomework.id,
        student_id: studentId,
        submission_text: submissionText,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        is_late: isLate,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Homework submitted successfully!",
      });

      setIsSubmitDialogOpen(false);
      setSubmissionText("");
      fetchHomework();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit homework",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const pendingCount = homework.filter(
    (h) => !h.submission || h.submission.status === "pending"
  ).length;
  const submittedCount = homework.filter(
    (h) => h.submission?.status === "submitted" || h.submission?.status === "graded"
  ).length;
  const completionPercentage = homework.length > 0 ? (submittedCount / homework.length) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              Homework & Assignments
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {pendingCount} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion Progress</span>
              <span className="font-medium">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{submittedCount} submitted</span>
              <span>{homework.length} total</span>
            </div>
          </div>

          {homework.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No homework assigned yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[350px] pr-2">
              <div className="space-y-3">
                {homework.map((hw, index) => {
                  const status = getStatus(hw);
                  return (
                    <motion.div
                      key={hw.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        status === "overdue"
                          ? "border-destructive/50 bg-destructive/5"
                          : status === "due-soon"
                          ? "border-orange-500/50 bg-orange-500/5"
                          : status === "graded"
                          ? "border-green-500/50 bg-green-500/5"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium truncate">{hw.title}</h4>
                            {getStatusBadge(status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {hw.subject?.name || "Subject"} • {hw.teacher?.full_name || "Teacher"}
                          </p>
                          {hw.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {hw.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {formatDate(hw.due_date)}
                            </span>
                            {hw.max_marks && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {hw.max_marks} marks
                              </span>
                            )}
                          </div>
                          {hw.submission?.status === "graded" && hw.submission.marks !== null && (
                            <div className="mt-2 p-2 rounded bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
                              <span className="font-medium">
                                Score: {hw.submission.marks}/{hw.max_marks}
                              </span>
                              {hw.submission.remarks && (
                                <p className="text-xs mt-1">{hw.submission.remarks}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {hw.attachment_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => window.open(hw.attachment_url!, "_blank")}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                          {(!hw.submission || hw.submission.status === "pending") && (
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                setSelectedHomework(hw);
                                setIsSubmitDialogOpen(true);
                              }}
                              disabled={status === "overdue" && !hw.allow_late_submission}
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Submit
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Homework</DialogTitle>
            <DialogDescription>
              {selectedHomework?.title} - Due: {selectedHomework && formatDate(selectedHomework.due_date)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="submission">Your Answer / Submission</Label>
              <Textarea
                id="submission"
                placeholder="Enter your homework submission here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentHomeworkCard;
