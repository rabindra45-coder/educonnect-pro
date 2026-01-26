import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Eye, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface TeacherStudentsProps {
  teacherId: string | undefined;
}

interface Student {
  id: string;
  registration_number: string;
  full_name: string;
  class: string;
  section: string | null;
  roll_number: number | null;
  photo_url: string | null;
  gender: string | null;
  date_of_birth: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  address: string | null;
  status: string;
}

const TeacherStudents = ({ teacherId }: TeacherStudentsProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [assignedClasses, setAssignedClasses] = useState<{ class: string; section: string | null }[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    if (teacherId) {
      fetchAssignedClasses();
    }
  }, [teacherId]);

  useEffect(() => {
    if (assignedClasses.length > 0) {
      fetchStudents();
    }
  }, [assignedClasses]);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, selectedClass, selectedSection]);

  const fetchAssignedClasses = async () => {
    if (!teacherId) return;

    try {
      const { data, error } = await supabase
        .from("teacher_assignments")
        .select("class, section")
        .eq("teacher_id", teacherId);

      if (error) throw error;
      setAssignedClasses(data || []);
    } catch (error) {
      console.error("Error fetching assigned classes:", error);
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const classes = [...new Set(assignedClasses.map((a) => a.class))];
      
      if (classes.length === 0) {
        setStudents([]);
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .in("class", classes)
        .eq("status", "active")
        .order("class")
        .order("roll_number");

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.full_name.toLowerCase().includes(query) ||
          s.registration_number.toLowerCase().includes(query) ||
          s.roll_number?.toString().includes(query)
      );
    }

    if (selectedClass !== "all") {
      filtered = filtered.filter((s) => s.class === selectedClass);
    }

    if (selectedSection !== "all") {
      filtered = filtered.filter((s) => s.section === selectedSection);
    }

    setFilteredStudents(filtered);
  };

  const uniqueClasses = [...new Set(assignedClasses.map((a) => a.class))].sort();
  const uniqueSections = [...new Set(assignedClasses.map((a) => a.section).filter(Boolean))].sort();

  const viewStudentProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfileDialog(true);
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, roll number, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {uniqueSections.length > 0 && (
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {uniqueSections.map((sec) => (
                    <SelectItem key={sec} value={sec!}>
                      Section {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 mb-6">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              Total: {filteredStudents.length} students
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              Boys: {filteredStudents.filter((s) => s.gender?.toLowerCase() === "male").length}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              Girls: {filteredStudents.filter((s) => s.gender?.toLowerCase() === "female").length}
            </Badge>
          </div>

          {/* Student List */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.photo_url || ""} />
                          <AvatarFallback>
                            {student.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.roll_number || "-"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.registration_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.class}
                        {student.section && `-${student.section}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.gender?.toLowerCase() === "male" ? "default" : "secondary"}>
                          {student.gender || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{student.guardian_name || "N/A"}</p>
                          {student.guardian_phone && (
                            <p className="text-xs text-muted-foreground">
                              {student.guardian_phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewStudentProfile(student)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedStudent.photo_url || ""} />
                  <AvatarFallback className="text-2xl">
                    {selectedStudent.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedStudent.full_name}</h3>
                  <p className="text-muted-foreground">{selectedStudent.registration_number}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge>Class {selectedStudent.class}</Badge>
                    {selectedStudent.section && (
                      <Badge variant="outline">Section {selectedStudent.section}</Badge>
                    )}
                    {selectedStudent.roll_number && (
                      <Badge variant="secondary">Roll #{selectedStudent.roll_number}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{selectedStudent.gender || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {selectedStudent.date_of_birth
                      ? format(new Date(selectedStudent.date_of_birth), "MMMM d, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Guardian Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedStudent.guardian_name || "N/A"}</span>
                  </div>
                  {selectedStudent.guardian_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedStudent.guardian_phone}`} className="text-blue-600 hover:underline">
                        {selectedStudent.guardian_phone}
                      </a>
                    </div>
                  )}
                  {selectedStudent.guardian_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${selectedStudent.guardian_email}`} className="text-blue-600 hover:underline">
                        {selectedStudent.guardian_email}
                      </a>
                    </div>
                  )}
                  {selectedStudent.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedStudent.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherStudents;
