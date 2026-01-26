import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Lock, 
  Bell, 
  Globe,
  Loader2,
  Save,
  Pencil,
} from "lucide-react";
import TeacherProfileEditDialog from "./TeacherProfileEditDialog";

interface TeacherProfile {
  id: string;
  employee_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  department: string | null;
  photo_url: string | null;
  qualification: string | null;
}

interface TeacherSettingsProps {
  teacherProfile: TeacherProfile | null;
  onProfileUpdate: () => void;
}

const TeacherSettings = ({ teacherProfile, onProfileUpdate }: TeacherSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    attendanceReminders: true,
    marksAlerts: true,
    homeworkDeadlines: true,
    announcements: true,
  });

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Edit Dialog */}
      <TeacherProfileEditDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        teacherProfile={teacherProfile}
        onProfileUpdate={onProfileUpdate}
      />

      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              My Profile
            </CardTitle>
            <CardDescription>
              View and manage your profile information
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditProfileOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={teacherProfile?.photo_url || ""} />
                <AvatarFallback className="text-2xl">
                  {teacherProfile?.full_name?.charAt(0) || "T"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{teacherProfile?.full_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Employee ID</Label>
                  <p className="font-medium">{teacherProfile?.employee_id || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{teacherProfile?.email || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{teacherProfile?.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{teacherProfile?.subject || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium">{teacherProfile?.department || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Qualification</Label>
                  <p className="font-medium">{teacherProfile?.qualification || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>
          <Button onClick={handlePasswordChange} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Password
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage your notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Attendance Reminders</p>
              <p className="text-sm text-muted-foreground">
                Get reminded to mark daily attendance
              </p>
            </div>
            <Switch
              checked={notifications.attendanceReminders}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, attendanceReminders: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marks Entry Alerts</p>
              <p className="text-sm text-muted-foreground">
                Alerts for pending marks entry
              </p>
            </div>
            <Switch
              checked={notifications.marksAlerts}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, marksAlerts: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Homework Deadlines</p>
              <p className="text-sm text-muted-foreground">
                Reminders for homework submission deadlines
              </p>
            </div>
            <Switch
              checked={notifications.homeworkDeadlines}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, homeworkDeadlines: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Announcements</p>
              <p className="text-sm text-muted-foreground">
                School announcements and notices
              </p>
            </div>
            <Switch
              checked={notifications.announcements}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, announcements: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language Settings
          </CardTitle>
          <CardDescription>
            Choose your preferred language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              English
            </Button>
            <Button variant="outline" className="flex-1">
              नेपाली
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherSettings;
