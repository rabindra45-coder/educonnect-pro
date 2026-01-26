import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ClipboardCheck, 
  CalendarIcon, 
  Loader2, 
  Save, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TeacherAttendanceProps {
  teacherId: string | undefined;
}

interface Student {
  id: string;
  full_name: string;
  roll_number: number | null;
  photo_url: string | null;
  class: string;
  section: string | null;
}

type AttendanceStatus = "present" | "absent" | "late" | "excused";

interface AttendanceRecord {
  student_id: string;
  status: AttendanceStatus;
  remarks: string;
}

const TeacherAttendance = ({ teacherId }: TeacherAttendanceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [assignedClasses, setAssignedClasses] = useState<{ class: string; section: string | null }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const [existingAttendance, setExistingAttendance] = useState<boolean>(false);

  useEffect(() => {
    if (teacherId) {
      fetchAssignedClasses();
    }
  }, [teacherId]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      checkExistingAttendance();
    }
  }, [selectedClass, selectedSection, selectedDate]);

  const fetchAssignedClasses = async () => {
    if (!teacherId) return;

    try {
      const { data, error } = await supabase
        .from("teacher_assignments")
        .select("class, section")
        .eq("teacher_id", teacherId);

      if (error) throw error;
      setAssignedClasses(data || []);
      
      if (data && data.length > 0) {
        setSelectedClass(data[0].class);
        if (data[0].section) {
          setSelectedSection(data[0].section);
        }
      }
    } catch (error) {
      console.error("Error fetching assigned classes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;
    setIsLoading(true);

    try {
      let query = supabase
        .from("students")
        .select("id, full_name, roll_number, photo_url, class, section")
        .eq("class", selectedClass)
        .eq("status", "active")
        .order("roll_number");

      if (selectedSection !== "all") {
        query = query.eq("section", selectedSection);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setStudents(data || []);
      
      // Initialize attendance records
      const records = new Map<string, AttendanceRecord>();
      data?.forEach((student) => {
        records.set(student.id, {
          student_id: student.id,
          status: "present",
          remarks: "",
        });
      });
      setAttendanceRecords(records);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingAttendance = async () => {
    if (!selectedClass) return;

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("attendance")
        .select("student_id, status, remarks")
        .eq("date", dateStr)
        .in("student_id", students.map((s) => s.id));

      if (error) throw error;

      if (data && data.length > 0) {
        setExistingAttendance(true);
        const records = new Map<string, AttendanceRecord>();
        
        // First set defaults
        students.forEach((student) => {
          records.set(student.id, {
            student_id: student.id,
            status: "present",
            remarks: "",
          });
        });
        
        // Then override with existing data
        data.forEach((record) => {
          records.set(record.student_id, {
            student_id: record.student_id,
            status: record.status as AttendanceStatus,
            remarks: record.remarks || "",
          });
        });
        
        setAttendanceRecords(records);
      } else {
        setExistingAttendance(false);
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
    }
  };

  const updateAttendance = (studentId: string, field: keyof AttendanceRecord, value: any) => {
    setAttendanceRecords((prev) => {
      const updated = new Map(prev);
      const record = updated.get(studentId) || { student_id: studentId, status: "present", remarks: "" };
      updated.set(studentId, { ...record, [field]: value });
      return updated;
    });
  };

  const markAllAs = (status: AttendanceStatus) => {
    setAttendanceRecords((prev) => {
      const updated = new Map(prev);
      students.forEach((student) => {
        const record = updated.get(student.id) || { student_id: student.id, status: "present", remarks: "" };
        updated.set(student.id, { ...record, status });
      });
      return updated;
    });
  };

  const saveAttendance = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const records = Array.from(attendanceRecords.values()).map((record) => ({
        student_id: record.student_id,
        date: dateStr,
        status: record.status,
        remarks: record.remarks || null,
        marked_by: user.id,
      }));

      // Delete existing records for this date
      await supabase
        .from("attendance")
        .delete()
        .eq("date", dateStr)
        .in("student_id", students.map((s) => s.id));

      // Insert new records
      const { error } = await supabase
        .from("attendance")
        .insert(records);

      if (error) throw error;

      toast({
        title: "Attendance Saved",
        description: `Attendance for Class ${selectedClass} on ${format(selectedDate, "MMM d, yyyy")} has been saved.`,
      });
      
      setExistingAttendance(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const uniqueClasses = [...new Set(assignedClasses.map((a) => a.class))].sort();
  const sectionsForClass = assignedClasses
    .filter((a) => a.class === selectedClass)
    .map((a) => a.section)
    .filter(Boolean);

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-500">Absent</Badge>;
      case "late":
        return <Badge className="bg-amber-500">Late</Badge>;
      case "excused":
        return <Badge className="bg-blue-500">Excused</Badge>;
    }
  };

  const stats = {
    present: Array.from(attendanceRecords.values()).filter((r) => r.status === "present").length,
    absent: Array.from(attendanceRecords.values()).filter((r) => r.status === "absent").length,
    late: Array.from(attendanceRecords.values()).filter((r) => r.status === "late").length,
    excused: Array.from(attendanceRecords.values()).filter((r) => r.status === "excused").length,
  };

  if (isLoading && assignedClasses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Mark Attendance
          </CardTitle>
          <CardDescription>
            Select a class and date to mark attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {uniqueClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {sectionsForClass.length > 0 && (
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sectionsForClass.map((sec) => (
                    <SelectItem key={sec} value={sec!}>
                      Section {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-48 justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {existingAttendance && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Attendance already marked - editing mode
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => markAllAs("present")}>
              <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => markAllAs("absent")}>
              <XCircle className="w-4 h-4 mr-1 text-red-600" />
              Mark All Absent
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mb-6">
            <Badge className="bg-green-500">Present: {stats.present}</Badge>
            <Badge className="bg-red-500">Absent: {stats.absent}</Badge>
            <Badge className="bg-amber-500">Late: {stats.late}</Badge>
            <Badge className="bg-blue-500">Excused: {stats.excused}</Badge>
          </div>

          {/* Student List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No students found for this class</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Excused</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const record = attendanceRecords.get(student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.roll_number || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={student.photo_url || ""} />
                                <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{student.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={record?.status === "present"}
                              onCheckedChange={() => updateAttendance(student.id, "status", "present")}
                              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={record?.status === "absent"}
                              onCheckedChange={() => updateAttendance(student.id, "status", "absent")}
                              className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={record?.status === "late"}
                              onCheckedChange={() => updateAttendance(student.id, "status", "late")}
                              className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={record?.status === "excused"}
                              onCheckedChange={() => updateAttendance(student.id, "status", "excused")}
                              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Optional remarks"
                              value={record?.remarks || ""}
                              onChange={(e) => updateAttendance(student.id, "remarks", e.target.value)}
                              className="w-40"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={saveAttendance} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAttendance;
