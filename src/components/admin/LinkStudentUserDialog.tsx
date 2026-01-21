import { useState, useEffect } from "react";
import { Link2, Search, User, Mail, Check, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserAccount {
  id: string;
  email: string;
  full_name: string | null;
  hasStudentRole: boolean;
}

interface LinkStudentUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: string;
    full_name: string;
    registration_number: string;
    user_id: string | null;
    guardian_email: string | null;
  } | null;
  onSuccess: () => void;
}

const LinkStudentUserDialog = ({
  open,
  onOpenChange,
  student,
  onSuccess,
}: LinkStudentUserDialogProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedUser(null);
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles (which are linked to auth users)
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("email");

      if (error) throw error;

      // Fetch user roles to check who has student role
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      const studentUserIds = new Set(studentRoles?.map((r) => r.user_id) || []);

      const usersWithRoles: UserAccount[] = (profiles || []).map((p) => ({
        id: p.id,
        email: p.email || "",
        full_name: p.full_name,
        hasStudentRole: studentUserIds.has(p.id),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      (user.full_name?.toLowerCase().includes(query) ?? false)
    );
  });

  const handleLink = async () => {
    if (!student || !selectedUser) return;

    setIsLinking(true);
    try {
      // Update the student's user_id
      const { error: updateError } = await supabase
        .from("students")
        .update({ user_id: selectedUser.id })
        .eq("id", student.id);

      if (updateError) throw updateError;

      // Check if user already has student role
      if (!selectedUser.hasStudentRole) {
        // Add student role if not present
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: selectedUser.id, role: "student" });

        if (roleError && !roleError.message.includes("duplicate")) {
          console.error("Error adding student role:", roleError);
        }
      }

      toast({
        title: "Success",
        description: `${student.full_name} has been linked to ${selectedUser.email}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to link student to user",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!student) return;

    setIsLinking(true);
    try {
      const { error } = await supabase
        .from("students")
        .update({ user_id: null })
        .eq("id", student.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${student.full_name} has been unlinked from user account`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unlink student",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const currentLinkedUser = student?.user_id
    ? users.find((u) => u.id === student.user_id)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Link Student to User Account
          </DialogTitle>
          <DialogDescription>
            Link {student?.full_name} ({student?.registration_number}) to a user
            account so they can log in to the student portal.
          </DialogDescription>
        </DialogHeader>

        {student && (
          <div className="space-y-4">
            {/* Current Link Status */}
            {currentLinkedUser ? (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Currently Linked To:
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-sm">{currentLinkedUser.email}</span>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlink}
                    disabled={isLinking}
                    className="text-destructive hover:text-destructive"
                  >
                    {isLinking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Unlink
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-muted/50 border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  This student is not linked to any user account.
                  {student.guardian_email && (
                    <span className="block mt-1">
                      Guardian email: <strong>{student.guardian_email}</strong>
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Search Users */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Users List */}
            <ScrollArea className="h-[250px] border rounded-lg">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <User className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedUser?.id === user.id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted"
                      } ${
                        user.id === student.user_id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={user.id === student.user_id}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {user.full_name || "No name"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.hasStudentRole && (
                          <Badge variant="outline" className="text-xs">
                            Student
                          </Badge>
                        )}
                        {selectedUser?.id === user.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                        {user.id === student.user_id && (
                          <Badge className="text-xs">Current</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleLink}
                disabled={!selectedUser || isLinking || selectedUser.id === student.user_id}
              >
                {isLinking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Link Account
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LinkStudentUserDialog;
