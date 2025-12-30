import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  GraduationCap,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";

interface Student {
  id: string;
  registration_number: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  class: string;
  section: string | null;
  roll_number: number | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  status: string;
  created_at: string;
}

const StudentsManagement = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    class: "",
    section: "",
    roll_number: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_email: "",
    address: "",
    admission_year: new Date().getFullYear().toString(),
    status: "active",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const studentData = {
        ...formData,
        roll_number: formData.roll_number ? parseInt(formData.roll_number) : null,
        admission_year: parseInt(formData.admission_year),
      };

      if (editingStudent) {
        const { error } = await supabase
          .from("students")
          .update(studentData)
          .eq("id", editingStudent.id);

        if (error) throw error;
        toast({ title: "Student updated successfully" });
      } else {
        const { error } = await supabase
          .from("students")
          .insert([studentData]);

        if (error) throw error;
        toast({ title: "Student added successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Student deleted successfully" });
      fetchStudents();
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
      full_name: "",
      date_of_birth: "",
      gender: "",
      class: "",
      section: "",
      roll_number: "",
      guardian_name: "",
      guardian_phone: "",
      guardian_email: "",
      address: "",
      admission_year: new Date().getFullYear().toString(),
      status: "active",
    });
    setEditingStudent(null);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name,
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "",
      class: student.class,
      section: student.section || "",
      roll_number: student.roll_number?.toString() || "",
      guardian_name: student.guardian_name || "",
      guardian_phone: student.guardian_phone || "",
      guardian_email: "",
      address: "",
      admission_year: new Date().getFullYear().toString(),
      status: student.status,
    });
    setIsDialogOpen(true);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.registration_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === "all" || student.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const classes = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Student Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage student records and information
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingStudent ? "Edit Student" : "Add New Student"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="class">Class *</Label>
                      <Select
                        value={formData.class}
                        onValueChange={(value) => setFormData({ ...formData, class: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls} value={cls}>
                              Class {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="section">Section</Label>
                      <Select
                        value={formData.section}
                        onValueChange={(value) => setFormData({ ...formData, section: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="roll_number">Roll Number</Label>
                      <Input
                        id="roll_number"
                        type="number"
                        value={formData.roll_number}
                        onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guardian_name">Guardian Name</Label>
                      <Input
                        id="guardian_name"
                        value={formData.guardian_name}
                        onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guardian_phone">Guardian Phone</Label>
                      <Input
                        id="guardian_phone"
                        value={formData.guardian_phone}
                        onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pass-out">Pass Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingStudent ? "Update" : "Add"} Student
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or registration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  Class {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="p-6 text-muted-foreground">Loading...</p>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No students found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg. No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.registration_number}
                      </TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.section || "-"}</TableCell>
                      <TableCell>{student.roll_number || "-"}</TableCell>
                      <TableCell>
                        {student.guardian_name || "-"}
                        {student.guardian_phone && (
                          <span className="block text-xs text-muted-foreground">
                            {student.guardian_phone}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            student.status === "active"
                              ? "bg-green-500/10 text-green-600"
                              : student.status === "pass-out"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(student.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default StudentsManagement;
