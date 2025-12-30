import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, School, Bell, Shield, User } from "lucide-react";

const Settings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });

  const [schoolSettings, setSchoolSettings] = useState({
    school_name: "Shree Secondary School",
    school_address: "Kathmandu, Nepal",
    school_phone: "+977-1-1234567",
    school_email: "info@shreeschool.edu.np",
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    admission_alerts: true,
    notice_reminders: true,
  });

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast({ title: "Profile updated successfully" });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, full_name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                />
              </div>
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* School Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>
                Basic school details (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input value={schoolSettings.school_name} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={schoolSettings.school_address} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={schoolSettings.school_phone} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={schoolSettings.school_email} disabled className="bg-muted" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email_notifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_notifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Admission Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new admissions
                  </p>
                </div>
                <Switch
                  checked={notifications.admission_alerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, admission_alerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notice Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for expiring notices
                  </p>
                </div>
                <Switch
                  checked={notifications.notice_reminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, notice_reminders: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Password</Label>
                <p className="text-sm text-muted-foreground">
                  Last changed: Never
                </p>
                <Button variant="outline">Change Password</Button>
              </div>
              <div className="space-y-2">
                <Label>Active Sessions</Label>
                <p className="text-sm text-muted-foreground">
                  1 active session
                </p>
                <Button variant="outline">Manage Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
