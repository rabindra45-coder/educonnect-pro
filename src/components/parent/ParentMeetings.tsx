import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarClock, Plus, Clock, Video, MapPin } from "lucide-react";
import { format } from "date-fns";

const ParentMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    teacher_id: "",
    student_id: "",
    meeting_date: format(new Date(), "yyyy-MM-dd"),
    meeting_time: "10:00",
    purpose: "",
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: parentData } = await supabase.from("parents").select("id").eq("user_id", user!.id).maybeSingle();
      if (!parentData) { setIsLoading(false); return; }
      setParentId(parentData.id);

      const [meetingsRes, linksRes, teachersRes] = await Promise.all([
        supabase.from("parent_teacher_meetings")
          .select("*, teacher:teacher_id(full_name, subject), student:student_id(full_name, class)")
          .eq("parent_id", parentData.id)
          .order("meeting_date", { ascending: false }),
        supabase.from("parent_students").select("student_id").eq("parent_id", parentData.id),
        supabase.from("teachers").select("id, full_name, subject").eq("status", "active"),
      ]);

      setMeetings(meetingsRes.data || []);
      setTeachers(teachersRes.data || []);

      const ids = linksRes.data?.map((l) => l.student_id) || [];
      if (ids.length > 0) {
        const { data: students } = await supabase.from("students").select("id, full_name, class").in("id", ids);
        setChildren(students || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("parent_teacher_meetings").insert({
        parent_id: parentId,
        teacher_id: formData.teacher_id,
        student_id: formData.student_id,
        meeting_date: formData.meeting_date,
        meeting_time: formData.meeting_time,
        purpose: formData.purpose,
        status: "scheduled",
      });
      if (error) throw error;
      setIsDialogOpen(false);
      setFormData({ teacher_id: "", student_id: "", meeting_date: format(new Date(), "yyyy-MM-dd"), meeting_time: "10:00", purpose: "" });
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      rescheduled: "bg-amber-100 text-amber-700",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Meetings</h1>
          <p className="text-muted-foreground">Schedule and track parent-teacher meetings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Book Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule a Meeting</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select value={formData.teacher_id} onValueChange={(v) => setFormData({ ...formData, teacher_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name} ({t.subject || "N/A"})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={formData.student_id} onValueChange={(v) => setFormData({ ...formData, student_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name} (Class {c.class})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={formData.meeting_date} onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={formData.meeting_time} onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Textarea value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} placeholder="What would you like to discuss?" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Schedule"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CalendarClock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No meetings scheduled. Book a meeting with a teacher!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{meeting.teacher?.full_name || "Teacher"}</h3>
                      <Badge className={`text-xs capitalize ${getStatusColor(meeting.status)}`}>{meeting.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Re: {meeting.student?.full_name || "Student"} (Class {meeting.student?.class})
                    </p>
                    {meeting.purpose && <p className="text-sm mt-1">{meeting.purpose}</p>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarClock className="w-4 h-4" />
                      {new Date(meeting.meeting_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meeting.meeting_time}
                    </div>
                    {meeting.meeting_link && (
                      <a href={meeting.meeting_link} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        Join
                      </a>
                    )}
                  </div>
                </div>
                {meeting.notes && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Meeting Notes:</p>
                    <p className="text-sm">{meeting.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentMeetings;
