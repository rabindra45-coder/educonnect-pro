import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Bot, Send, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Namaste! I'm your AI Academic Assistant. I can help you understand your child's academic progress, attendance patterns, and provide personalized study recommendations.\n\nTry asking me:\n- \"How is my child performing in Math?\"\n- \"Why are my child's grades dropping?\"\n- \"What homework is due this week?\"\n- \"Give tips to improve Science performance\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchChildrenData();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChildrenData = async () => {
    try {
      const { data: parentData } = await supabase
        .from("parents")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!parentData) return;

      const { data: links } = await supabase
        .from("parent_students")
        .select("student_id")
        .eq("parent_id", parentData.id);

      const ids = links?.map((l) => l.student_id) || [];
      if (ids.length === 0) return;

      const [studentsRes, marksRes, attendanceRes, feesRes, homeworkRes] = await Promise.all([
        supabase.from("students").select("id, full_name, class, section").in("id", ids),
        supabase
          .from("exam_marks")
          .select("student_id, total_marks, grade, grade_point, subject:subject_id(name), exam:exam_id(title, exam_type)")
          .in("student_id", ids),
        supabase
          .from("attendance")
          .select("student_id, status, date")
          .in("student_id", ids)
          .order("date", { ascending: false })
          .limit(100),
        supabase
          .from("student_fees")
          .select("student_id, balance, status, month_year")
          .in("student_id", ids)
          .in("status", ["pending", "partial", "overdue"]),
        supabase
          .from("homework")
          .select("title, due_date, class, subject:subject_id(name)")
          .eq("is_published", true)
          .gte("due_date", new Date().toISOString().split("T")[0]),
      ]);

      const data = (studentsRes.data || []).map((student) => {
        const studentMarks = (marksRes.data || []).filter((m) => m.student_id === student.id);
        const studentAttendance = (attendanceRes.data || []).filter((a) => a.student_id === student.id);
        const studentFees = (feesRes.data || []).filter((f) => f.student_id === student.id);
        const totalPresent = studentAttendance.filter((a) => a.status === "present").length;
        const totalRecords = studentAttendance.length;

        return {
          name: student.full_name,
          class: student.class,
          section: student.section,
          marks: studentMarks.map((m) => ({
            subject: m.subject?.name || "Unknown",
            marks: m.total_marks,
            grade: m.grade,
            gpa: m.grade_point,
            exam: m.exam?.title,
          })),
          attendanceRate: totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : "N/A",
          totalAbsent: studentAttendance.filter((a) => a.status === "absent").length,
          pendingFees: studentFees.reduce((sum, f) => sum + Number(f.balance || 0), 0),
          overdueCount: studentFees.filter((f) => f.status === "overdue").length,
        };
      });

      setChildrenData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const contextStr = childrenData.length > 0
        ? `\n\nStudent Data:\n${childrenData.map((c) =>
            `- ${c.name} (Class ${c.class}${c.section ? ` ${c.section}` : ""}): Attendance ${c.attendanceRate}%, ${c.totalAbsent} absences, Pending Fees: Rs.${c.pendingFees}, Overdue: ${c.overdueCount}\n  Marks: ${c.marks.map((m: any) => `${m.subject}: ${m.marks} (${m.grade})`).join(", ") || "No marks data"}`
          ).join("\n")}`
        : "";

      const systemPrompt = `You are an AI Academic Assistant for Shree Durga Saraswati Janata Secondary School (SDSJSS). 
You help parents understand their children's academic performance and provide personalized advice.
You should:
- Analyze academic performance trends
- Identify weak subjects and suggest improvements
- Provide study tips in both English and Nepali when helpful
- Give early warnings if a student is at risk
- Be encouraging and supportive
- Keep responses concise and actionable
${contextStr}`;

      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: input },
          ],
        },
      });

      if (error) throw error;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data?.reply || data?.message || "I'm sorry, I couldn't process that. Please try again.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "How is my child performing overall?",
    "Which subjects need improvement?",
    "Tips to improve Math grades",
    "Is my child's attendance okay?",
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-teal-600" />
          AI Academic Assistant
        </h1>
        <p className="text-muted-foreground">Get personalized insights about your child's academic progress</p>
      </div>

      <Card className="h-[calc(100vh-220px)] flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-teal-600" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium">{msg.role === "assistant" ? "AI Assistant" : "You"}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setInput(q);
                  }}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your child's progress..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
