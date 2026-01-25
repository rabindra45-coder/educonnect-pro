import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Calendar, 
  QrCode, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Send,
  Search,
  Camera,
  Loader2,
  AlertTriangle,
  Download,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

interface Student {
  id: string;
  full_name: string;
  class: string;
  section: string | null;
  roll_number: number | null;
  registration_number: string;
  guardian_email: string | null;
  photo_url: string | null;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  remarks: string | null;
  notification_sent: boolean;
  students?: Student;
}

const AttendanceManagement = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const classes = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  // Fetch students for selected class
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["students", selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, class, section, roll_number, registration_number, guardian_email, photo_url")
        .eq("class", selectedClass)
        .eq("status", "active")
        .order("roll_number");
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!selectedClass,
  });

  // Fetch attendance for selected date and class
  const { data: attendance = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ["attendance", selectedDate, selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          student_id,
          date,
          status,
          check_in_time,
          remarks,
          notification_sent,
          students (
            id,
            full_name,
            class,
            section,
            roll_number,
            registration_number,
            guardian_email,
            photo_url
          )
        `)
        .eq("date", selectedDate)
        .in("student_id", students.map(s => s.id));
      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!selectedClass && students.length > 0,
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ 
      studentId, 
      status, 
      remarks 
    }: { 
      studentId: string; 
      status: AttendanceStatus; 
      remarks?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("attendance")
        .upsert({
          student_id: studentId,
          date: selectedDate,
          status,
          check_in_time: status === "present" || status === "late" ? format(new Date(), "HH:mm:ss") : null,
          remarks,
          marked_by: user?.id,
        }, {
          onConflict: "student_id,date"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "Attendance marked successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error marking attendance", description: error.message, variant: "destructive" });
    },
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async ({ studentId, date, status, remarks }: { 
      studentId: string; 
      date: string; 
      status: string;
      remarks?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-attendance-notification", {
        body: { studentId, date, status, remarks },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "Notification sent to parent" });
    },
    onError: (error: any) => {
      toast({ title: "Error sending notification", description: error.message, variant: "destructive" });
    },
  });

  // Bulk mark attendance
  const bulkMarkMutation = useMutation({
    mutationFn: async ({ status }: { status: AttendanceStatus }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const records = students.map(student => ({
        student_id: student.id,
        date: selectedDate,
        status,
        check_in_time: status === "present" ? format(new Date(), "HH:mm:ss") : null,
        marked_by: user?.id,
      }));

      const { error } = await supabase
        .from("attendance")
        .upsert(records, { onConflict: "student_id,date" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "Bulk attendance marked successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error marking bulk attendance", description: error.message, variant: "destructive" });
    },
  });

  // QR Scanner functions
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScanning(true);
      scanQRCode();
    } catch (error) {
      console.error("Camera error:", error);
      toast({ 
        title: "Camera access denied", 
        description: "Please allow camera access to scan QR codes",
        variant: "destructive" 
      });
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setScanResult(null);
  };

  const scanQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR detection - look for student ID in URL pattern
      // In production, use a proper QR library like jsQR
      // For now, we'll simulate with manual entry
    }

    if (isScanning) {
      requestAnimationFrame(scanQRCode);
    }
  };

  const handleManualScan = async (studentId: string) => {
    const student = students.find(s => s.id === studentId || s.registration_number === studentId);
    if (student) {
      await markAttendanceMutation.mutateAsync({ 
        studentId: student.id, 
        status: "present" 
      });
      setScanResult(student.full_name);
      toast({ 
        title: "✅ Attendance Marked", 
        description: `${student.full_name} marked as present` 
      });
      setTimeout(() => setScanResult(null), 2000);
    } else {
      toast({ 
        title: "Student not found", 
        description: "Please check the ID and try again",
        variant: "destructive" 
      });
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, { color: string; icon: React.ReactNode }> = {
      present: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
      absent: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
      late: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" /> },
      excused: { color: "bg-blue-100 text-blue-800", icon: <FileText className="w-3 h-3" /> },
    };
    const v = variants[status];
    return (
      <Badge className={`${v.color} flex items-center gap-1`}>
        {v.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAttendanceForStudent = (studentId: string) => {
    return attendance.find(a => a.student_id === studentId);
  };

  const stats = {
    total: students.length,
    present: attendance.filter(a => a.status === "present").length,
    absent: attendance.filter(a => a.status === "absent").length,
    late: attendance.filter(a => a.status === "late").length,
    excused: attendance.filter(a => a.status === "excused").length,
    unmarked: students.length - attendance.length,
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Attendance Management</h1>
            <p className="text-muted-foreground">Mark and manage daily student attendance</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <QrCode className="w-4 h-4" />
                  Scan ID Card
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Scan Student ID Card
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {!isScanning ? (
                    <div className="text-center space-y-4">
                      <div className="p-8 bg-muted rounded-lg">
                        <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Scan student ID card QR code to quickly mark attendance
                        </p>
                        <Button onClick={startScanner} className="gap-2">
                          <Camera className="w-4 h-4" />
                          Start Camera
                        </Button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter Student ID or Registration Number"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleManualScan((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <video ref={videoRef} className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-48 h-48 border-2 border-white/50 rounded-lg" />
                        </div>
                        {scanResult && (
                          <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center">
                            <div className="text-center text-white">
                              <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                              <p className="font-bold text-xl">{scanResult}</p>
                              <p>Marked Present!</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button onClick={stopScanner} variant="outline" className="w-full">
                        Stop Scanner
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c} value={c}>Class {c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => bulkMarkMutation.mutate({ status: "present" })}
                  disabled={!selectedClass || students.length === 0}
                  className="flex-1"
                >
                  Mark All Present
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {selectedClass && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                    <p className="text-xs text-muted-foreground">Late</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                    <p className="text-xs text-muted-foreground">Excused</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{stats.unmarked}</p>
                    <p className="text-xs text-muted-foreground">Unmarked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Table */}
        {selectedClass ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Class {selectedClass} - {format(new Date(selectedDate), "MMMM d, yyyy")}
              </CardTitle>
              <CardDescription>
                {students.length} students • {attendance.length} marked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStudents || loadingAttendance ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found in this class
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const record = getAttendanceForStudent(student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.roll_number || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {student.photo_url ? (
                                <img 
                                  src={student.photo_url} 
                                  alt={student.full_name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {student.full_name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{student.full_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {student.registration_number}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record ? (
                              getStatusBadge(record.status)
                            ) : (
                              <Badge variant="outline">Not Marked</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {record?.check_in_time ? (
                              <span className="text-sm">
                                {record.check_in_time.slice(0, 5)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant={record?.status === "present" ? "default" : "outline"}
                                className="h-7 px-2"
                                onClick={() => markAttendanceMutation.mutate({ 
                                  studentId: student.id, 
                                  status: "present" 
                                })}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={record?.status === "absent" ? "destructive" : "outline"}
                                className="h-7 px-2"
                                onClick={() => markAttendanceMutation.mutate({ 
                                  studentId: student.id, 
                                  status: "absent" 
                                })}
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={record?.status === "late" ? "secondary" : "outline"}
                                className="h-7 px-2"
                                onClick={() => markAttendanceMutation.mutate({ 
                                  studentId: student.id, 
                                  status: "late" 
                                })}
                              >
                                <Clock className="w-3 h-3" />
                              </Button>
                              {record && (record.status === "absent" || record.status === "late") && student.guardian_email && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => sendNotificationMutation.mutate({
                                    studentId: student.id,
                                    date: selectedDate,
                                    status: record.status,
                                    remarks: record.remarks || undefined,
                                  })}
                                  disabled={record.notification_sent || sendNotificationMutation.isPending}
                                >
                                  {record.notification_sent ? (
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Send className="w-3 h-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a class to view and manage attendance</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AttendanceManagement;
