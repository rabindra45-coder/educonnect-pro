import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Plus, Loader2, UserX, UserCheck, Book, History } from "lucide-react";
import { format } from "date-fns";

interface Member {
  id: string;
  member_type: string;
  member_id: string;
  membership_number: string | null;
  max_books: number;
  status: string;
  is_blocked: boolean;
  block_reason: string | null;
  created_at: string;
  student?: { full_name: string; registration_number: string; class: string } | null;
  teacher?: { full_name: string; employee_id: string } | null;
}

interface Student {
  id: string;
  full_name: string;
  registration_number: string;
  class: string;
}

interface Teacher {
  id: string;
  full_name: string;
  employee_id: string;
}

interface LibraryMembersProps {
  onUpdate: () => void;
}

const LibraryMembers = ({ onUpdate }: LibraryMembersProps) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [memberHistory, setMemberHistory] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    member_type: "student",
    member_id: "",
    max_books: 3,
  });

  useEffect(() => {
    fetchMembers();
    fetchStudentsAndTeachers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("library_memberships")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch student and teacher details
      const membersWithDetails = await Promise.all(
        (data || []).map(async (member) => {
          if (member.member_type === "student") {
            const { data: student } = await supabase
              .from("students")
              .select("full_name, registration_number, class")
              .eq("id", member.member_id)
              .maybeSingle();
            return { ...member, student };
          } else {
            const { data: teacher } = await supabase
              .from("teachers")
              .select("full_name, employee_id")
              .eq("id", member.member_id)
              .maybeSingle();
            return { ...member, teacher };
          }
        })
      );

      setMembers(membersWithDetails);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentsAndTeachers = async () => {
    try {
      const { data: studentsData } = await supabase
        .from("students")
        .select("id, full_name, registration_number, class")
        .eq("status", "active")
        .order("full_name");
      setStudents(studentsData || []);

      const { data: teachersData } = await supabase
        .from("teachers")
        .select("id, full_name, employee_id")
        .eq("status", "active")
        .order("full_name");
      setTeachers(teachersData || []);
    } catch (error) {
      console.error("Error fetching students/teachers:", error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Check if member already exists
      const { data: existing } = await supabase
        .from("library_memberships")
        .select("id")
        .eq("member_id", formData.member_id)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Already Exists",
          description: "This member already has a library membership.",
          variant: "destructive",
        });
        return;
      }

      const membershipNumber = `LIB-${Date.now().toString().slice(-8)}`;

      const { error } = await supabase.from("library_memberships").insert({
        member_type: formData.member_type,
        member_id: formData.member_id,
        membership_number: membershipNumber,
        max_books: formData.max_books,
        status: "active",
      });

      if (error) throw error;

      toast({ title: "Success", description: "Member added successfully." });
      setIsDialogOpen(false);
      setFormData({ member_type: "student", member_id: "", max_books: 3 });
      fetchMembers();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBlock = async (member: Member) => {
    const newBlockedState = !member.is_blocked;
    const reason = newBlockedState
      ? prompt("Enter reason for blocking:")
      : null;

    if (newBlockedState && !reason) return;

    try {
      const { error } = await supabase
        .from("library_memberships")
        .update({
          is_blocked: newBlockedState,
          block_reason: reason,
          status: newBlockedState ? "blocked" : "active",
        })
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Member ${newBlockedState ? "blocked" : "unblocked"} successfully.`,
      });
      fetchMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleViewHistory = async (member: Member) => {
    setSelectedMember(member);
    setHistoryDialogOpen(true);

    try {
      const { data, error } = await supabase
        .from("book_issues")
        .select(`
          id,
          issue_date,
          due_date,
          return_date,
          status,
          book:book_id (title, author)
        `)
        .eq("student_id", member.member_id)
        .order("issue_date", { ascending: false })
        .limit(20);

      if (error) throw error;
      setMemberHistory(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredMembers = members.filter((m) => {
    const name = m.student?.full_name || m.teacher?.full_name || "";
    const regNo = m.student?.registration_number || m.teacher?.employee_id || "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.membership_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = memberTypeFilter === "all" || m.member_type === memberTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Library Members
          </CardTitle>
          <CardDescription>Manage student and teacher library memberships</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Library Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label>Member Type</Label>
                <Select
                  value={formData.member_type}
                  onValueChange={(value) => setFormData({ ...formData, member_type: value, member_id: "" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select {formData.member_type === "student" ? "Student" : "Teacher"}</Label>
                <Select
                  value={formData.member_id}
                  onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.member_type === "student"
                      ? students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.full_name} ({s.registration_number}) - Class {s.class}
                          </SelectItem>
                        ))
                      : teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.full_name} ({t.employee_id})
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Books Allowed</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.max_books}
                  onChange={(e) => setFormData({ ...formData, max_books: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-amber-600 hover:bg-amber-700">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Member"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Membership No.</TableHead>
                <TableHead className="text-center">Max Books</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {member.student?.full_name || member.teacher?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.student?.registration_number || member.teacher?.employee_id}
                          {member.student?.class && ` | Class ${member.student.class}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{member.member_type}</TableCell>
                    <TableCell className="font-mono text-sm">{member.membership_number}</TableCell>
                    <TableCell className="text-center">{member.max_books}</TableCell>
                    <TableCell>
                      <Badge variant={member.is_blocked ? "destructive" : "default"}>
                        {member.is_blocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(member.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View History"
                          onClick={() => handleViewHistory(member)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={member.is_blocked ? "Unblock" : "Block"}
                          onClick={() => handleToggleBlock(member)}
                        >
                          {member.is_blocked ? (
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <UserX className="w-4 h-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Borrowing History - {selectedMember?.student?.full_name || selectedMember?.teacher?.full_name}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No borrowing history.
                      </TableCell>
                    </TableRow>
                  ) : (
                    memberHistory.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.book?.title}</p>
                            <p className="text-xs text-muted-foreground">{item.book?.author}</p>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(item.issue_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(new Date(item.due_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {item.return_date ? format(new Date(item.return_date), "MMM d, yyyy") : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === "returned" ? "secondary" : "default"}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LibraryMembers;
