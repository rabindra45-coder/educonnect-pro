import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  UserCog,
  Shield,
  UserPlus,
  Mail,
  Phone,
  Loader2,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  roles: AppRole[];
  created_at: string;
}

const ALL_ROLES: { value: AppRole; label: string; color: string }[] = [
  { value: "super_admin", label: "Super Admin", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  { value: "admin", label: "Admin", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { value: "teacher", label: "Teacher", color: "bg-green-500/10 text-green-600 border-green-200" },
  { value: "staff", label: "Staff", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  { value: "librarian", label: "Librarian", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  { value: "accountant", label: "Accountant", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  { value: "student", label: "Student", color: "bg-cyan-500/10 text-cyan-600 border-cyan-200" },
  { value: "parent", label: "Parent", color: "bg-pink-500/10 text-pink-600 border-pink-200" },
];

const UsersManagement = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Add User Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    selectedRoles: [] as AppRole[],
  });

  // Assign Role Dialog
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole>("staff");

  useEffect(() => {
    if (hasRole("super_admin")) {
      fetchUsers();
    }
  }, [hasRole]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        roles: (roles || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role as AppRole),
        created_at: profile.created_at,
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.email || !newUserData.password || !newUserData.full_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (newUserData.password.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            full_name: newUserData.full_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Update profile with phone if provided
      if (newUserData.phone) {
        await supabase
          .from("profiles")
          .update({ phone: newUserData.phone })
          .eq("id", authData.user.id);
      }

      // Assign selected roles
      if (newUserData.selectedRoles.length > 0) {
        const roleInserts = newUserData.selectedRoles.map((role) => ({
          user_id: authData.user!.id,
          role,
        }));

        const { error: roleError } = await supabase
          .from("user_roles")
          .insert(roleInserts);

        if (roleError) throw roleError;
      }

      toast({
        title: "User Created",
        description: `${newUserData.full_name} has been created successfully.`,
      });

      setIsAddDialogOpen(false);
      setNewUserData({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        selectedRoles: [],
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleRoleSelection = (role: AppRole) => {
    setNewUserData((prev) => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter((r) => r !== role)
        : [...prev.selectedRoles, role],
    }));
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: selectedUser.id,
          role: selectedRole,
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Role already assigned",
            description: "This user already has this role.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({ title: "Role assigned successfully" });
      setIsRoleDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    if (!confirm(`Remove ${role.replace("_", " ")} role from this user?`)) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
      toast({ title: "Role removed successfully" });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openAssignDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setSelectedRole("staff");
    setIsRoleDialogOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter as AppRole);
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: AppRole) => {
    return ALL_ROLES.find((r) => r.value === role)?.color || "bg-gray-100 text-gray-600";
  };

  if (!hasRole("super_admin")) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Shield className="w-20 h-20 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            Only Super Admins can access user management.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create users and manage their roles
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add New User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-purple-600">
                {users.filter((u) => u.roles.includes("super_admin") || u.roles.includes("admin")).length}
              </p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.roles.includes("teacher")).length}
              </p>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-amber-600">
                {users.filter((u) => u.roles.length === 0).length}
              </p>
              <p className="text-sm text-muted-foreground">No Roles</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ALL_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <UserCog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || "N/A"}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="truncate max-w-[180px]">{user.email || "N/A"}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {user.roles.length === 0 ? (
                            <Badge variant="outline" className="text-muted-foreground">
                              No roles
                            </Badge>
                          ) : (
                            user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="outline"
                                className={`${getRoleColor(role)} cursor-pointer hover:opacity-70 transition-opacity`}
                                onClick={() => removeRole(user.id, role)}
                                title="Click to remove"
                              >
                                {role.replace("_", " ")}
                                <X className="w-3 h-3 ml-1" />
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAssignDialog(user)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create New User
              </DialogTitle>
              <DialogDescription>
                Add a new user and assign their roles
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  placeholder="Enter full name"
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  placeholder="+977 98XXXXXXXX"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Assign Roles</Label>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/30">
                  {ALL_ROLES.map((role) => (
                    <div key={role.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`role-${role.value}`}
                        checked={newUserData.selectedRoles.includes(role.value)}
                        onCheckedChange={() => toggleRoleSelection(role.value)}
                      />
                      <Label
                        htmlFor={`role-${role.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {role.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Assign Role Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
              <DialogDescription>
                Add a new role to {selectedUser?.full_name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">{selectedUser.full_name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedUser.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Select Role to Add</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) => setSelectedRole(value as AppRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_ROLES.filter(
                        (role) => !selectedUser.roles.includes(role.value)
                      ).map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={assignRole}>
                    Assign Role
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default UsersManagement;
