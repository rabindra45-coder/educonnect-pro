import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarCheck, CalendarX, Clock, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

const AttendanceView = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchChildren();
  }, [user]);

  useEffect(() => {
    if (selectedChild) fetchAttendance();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const { data: parentData } = await supabase.from("parents").select("id").eq("user_id", user!.id).maybeSingle();
      if (!parentData) { setIsLoading(false); return; }
      const { data: links } = await supabase.from("parent_students").select("student_id").eq("parent_id", parentData.id);
      const ids = links?.map((l) => l.student_id) || [];
      if (ids.length === 0) { setIsLoading(false); return; }
      const { data: students } = await supabase.from("students").select("id, full_name, class").in("id", ids);
      setChildren(students || []);
      if (students && students.length > 0) setSelectedChild(students[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const threeMonthsAgo = format(subMonths(new Date(), 3), "yyyy-MM-dd");
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", selectedChild)
        .gte("date", threeMonthsAgo)
        .order("date", { ascending: false });
      setAttendance(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
  }

  const present = attendance.filter((a) => a.status === "present").length;
  const absent = attendance.filter((a) => a.status === "absent").length;
  const late = attendance.filter((a) => a.status === "late").length;
  const excused = attendance.filter((a) => a.status === "excused").length;
  const total = attendance.length;
  const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : "0";

  const pieData = [
    { name: "Present", value: present, color: "#10b981" },
    { name: "Absent", value: absent, color: "#ef4444" },
    { name: "Late", value: late, color: "#f59e0b" },
    { name: "Excused", value: excused, color: "#6366f1" },
  ].filter((d) => d.value > 0);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      present: "bg-green-100 text-green-700",
      absent: "bg-red-100 text-red-700",
      late: "bg-amber-100 text-amber-700",
      excused: "bg-indigo-100 text-indigo-700",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Last 3 months attendance record</p>
        </div>
        {children.length > 1 && (
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select child" /></SelectTrigger>
            <SelectContent>
              {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarCheck className="w-6 h-6 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-600">{present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarX className="w-6 h-6 mx-auto text-red-600 mb-1" />
            <p className="text-2xl font-bold text-red-600">{absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-amber-600 mb-1" />
            <p className="text-2xl font-bold text-amber-600">{late}</p>
            <p className="text-xs text-muted-foreground">Late</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto text-indigo-600 mb-1" />
            <p className="text-2xl font-bold text-indigo-600">{excused}</p>
            <p className="text-xs text-muted-foreground">Excused</p>
          </CardContent>
        </Card>
        <Card className={Number(percentage) < 80 ? "border-red-200 bg-red-50 dark:bg-red-950/20" : ""}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold ${Number(percentage) < 80 ? "text-red-600" : "text-teal-600"}`}>{percentage}%</p>
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
            {Number(percentage) < 80 && <p className="text-xs text-red-500 mt-1">⚠️ Below 80%</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Records */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Records</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attendance.slice(0, 15).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                  <span className="text-sm">{format(new Date(a.date), "MMM d, yyyy (EEE)")}</span>
                  <Badge className={`text-xs capitalize ${getStatusBadge(a.status)}`}>{a.status}</Badge>
                </div>
              ))}
              {attendance.length === 0 && <p className="text-center text-muted-foreground py-4">No attendance records</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceView;
