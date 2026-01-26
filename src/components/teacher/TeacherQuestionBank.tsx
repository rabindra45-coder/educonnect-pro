import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  GraduationCap, 
  Plus, 
  Loader2, 
  Edit, 
  Trash2, 
  Search,
  FileText,
  Download,
} from "lucide-react";

interface TeacherQuestionBankProps {
  teacherId: string | undefined;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  marks: number;
  chapter: string | null;
  topic: string | null;
  class: string | null;
  options: any;
  correct_answer: string | null;
  subject: Subject | null;
}

const TeacherQuestionBank = ({ teacherId }: TeacherQuestionBankProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "subjective",
    difficulty: "medium",
    marks: 1,
    chapter: "",
    topic: "",
    class: "",
    subject_id: "",
    options: [] as string[],
    correct_answer: "",
  });

  useEffect(() => {
    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchQuestions(), fetchSubjects()]);
    setIsLoading(false);
  };

  const fetchQuestions = async () => {
    if (!teacherId) return;

    try {
      const { data, error } = await supabase
        .from("question_bank")
        .select(`
          *,
          subject:subject_id (id, name, code)
        `)
        .eq("teacher_id", teacherId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, code")
        .eq("is_active", true);

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleCreateQuestion = async () => {
    if (!teacherId || !formData.question_text || !formData.subject_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("question_bank").insert({
        teacher_id: teacherId,
        question_text: formData.question_text,
        question_type: formData.question_type,
        difficulty: formData.difficulty,
        marks: formData.marks,
        chapter: formData.chapter || null,
        topic: formData.topic || null,
        class: formData.class || null,
        subject_id: formData.subject_id,
        options: formData.question_type === "objective" ? formData.options : null,
        correct_answer: formData.correct_answer || null,
      });

      if (error) throw error;

      toast({
        title: "Question Added",
        description: "Question has been added to your bank.",
      });
      
      setShowCreateDialog(false);
      resetForm();
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase
        .from("question_bank")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Question has been removed.",
      });
      
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: "",
      question_type: "subjective",
      difficulty: "medium",
      marks: 1,
      chapter: "",
      topic: "",
      class: "",
      subject_id: "",
      options: [],
      correct_answer: "",
    });
  };

  const filteredQuestions = questions.filter((q) => {
    if (searchQuery && !q.question_text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterSubject !== "all" && q.subject?.id !== filterSubject) {
      return false;
    }
    if (filterDifficulty !== "all" && q.difficulty !== filterDifficulty) {
      return false;
    }
    if (filterType !== "all" && q.question_type !== filterType) {
      return false;
    }
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-amber-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Question Bank
            </CardTitle>
            <CardDescription>
              Create and manage your question bank for exams
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Question Text *</Label>
                  <Textarea
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    placeholder="Enter the question"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subject *</Label>
                    <Select
                      value={formData.subject_id}
                      onValueChange={(v) => setFormData({ ...formData, subject_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Class</Label>
                    <Input
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      placeholder="e.g., 10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Question Type</Label>
                    <Select
                      value={formData.question_type}
                      onValueChange={(v) => setFormData({ ...formData, question_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="objective">Objective</SelectItem>
                        <SelectItem value="subjective">Subjective</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="long_answer">Long Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Chapter</Label>
                    <Input
                      value={formData.chapter}
                      onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                      placeholder="Chapter name"
                    />
                  </div>
                  <div>
                    <Label>Topic</Label>
                    <Input
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="Topic name"
                    />
                  </div>
                </div>

                {formData.question_type === "objective" && (
                  <div>
                    <Label>Correct Answer</Label>
                    <Input
                      value={formData.correct_answer}
                      onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                      placeholder="Enter the correct answer"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateQuestion}>
                    Add Question
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="objective">Objective</SelectItem>
                <SelectItem value="subjective">Subjective</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
                <SelectItem value="long_answer">Long Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mb-6">
            <Badge variant="secondary">Total: {filteredQuestions.length}</Badge>
            <Badge className="bg-green-500">Easy: {filteredQuestions.filter((q) => q.difficulty === "easy").length}</Badge>
            <Badge className="bg-amber-500">Medium: {filteredQuestions.filter((q) => q.difficulty === "medium").length}</Badge>
            <Badge className="bg-red-500">Hard: {filteredQuestions.filter((q) => q.difficulty === "hard").length}</Badge>
          </div>

          {/* Questions List */}
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No questions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-muted-foreground">Q{index + 1}.</span>
                          <Badge variant="outline">{question.subject?.name}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="secondary">{question.marks} marks</Badge>
                          <Badge variant="outline">{question.question_type}</Badge>
                        </div>
                        <p className="text-sm">{question.question_text}</p>
                        {(question.chapter || question.topic) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {question.chapter && `Chapter: ${question.chapter}`}
                            {question.chapter && question.topic && " | "}
                            {question.topic && `Topic: ${question.topic}`}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherQuestionBank;
