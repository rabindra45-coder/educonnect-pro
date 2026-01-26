import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Settings, Loader2, Save, Lock, Bell, Globe, User, Shield } from "lucide-react";

interface LibrarySettingsData {
  id: string;
  fine_per_day: number;
  max_books_per_student: number;
  default_issue_days: number;
  lost_book_fine_multiplier: number;
}

const LibrarySettings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<LibrarySettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    overdueAlerts: true,
    fineReminders: true,
    reservationAlerts: true,
    dailyReport: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("library_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const { data: newSettings, error: insertError } = await supabase
          .from("library_settings")
          .insert({
            fine_per_day: 5,
            max_books_per_student: 3,
            default_issue_days: 14,
            lost_book_fine_multiplier: 2,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("library_settings")
        .update({
          fine_per_day: settings.fine_per_day,
          max_books_per_student: settings.max_books_per_student,
          default_issue_days: settings.default_issue_days,
          lost_book_fine_multiplier: settings.lost_book_fine_multiplier,
        })
        .eq("id", settings.id);

      if (error) throw error;

      toast({ title: "Success", description: "Library settings updated successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Password updated successfully." });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Library Rules</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Library Rules */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Library Rules & Policies
              </CardTitle>
              <CardDescription>Configure library policies without code changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="fine_per_day">Fine Per Day (रू)</Label>
                  <Input
                    id="fine_per_day"
                    type="number"
                    min={0}
                    step={0.5}
                    value={settings?.fine_per_day || 0}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, fine_per_day: parseFloat(e.target.value) } : null
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount charged per day for late book returns
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_books">Max Books Per Member</Label>
                  <Input
                    id="max_books"
                    type="number"
                    min={1}
                    value={settings?.max_books_per_student || 0}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, max_books_per_student: parseInt(e.target.value) } : null
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of books a member can borrow at once
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue_days">Default Issue Period (Days)</Label>
                  <Input
                    id="issue_days"
                    type="number"
                    min={1}
                    value={settings?.default_issue_days || 0}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, default_issue_days: parseInt(e.target.value) } : null
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Default number of days books can be borrowed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lost_multiplier">Lost Book Fine Multiplier</Label>
                  <Input
                    id="lost_multiplier"
                    type="number"
                    min={1}
                    step={0.5}
                    value={settings?.lost_book_fine_multiplier || 0}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, lost_book_fine_multiplier: parseFloat(e.target.value) } : null
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Multiplier applied to book price for lost books
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-amber-600 hover:bg-amber-700">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Librarian Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={profile?.full_name || ""} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={isChangingPassword} className="bg-amber-600 hover:bg-amber-700">
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure your notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Overdue Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about overdue books</p>
                </div>
                <Switch
                  checked={notifications.overdueAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, overdueAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Fine Reminders</p>
                  <p className="text-sm text-muted-foreground">Alerts for pending fine collections</p>
                </div>
                <Switch
                  checked={notifications.fineReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, fineReminders: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reservation Alerts</p>
                  <p className="text-sm text-muted-foreground">New book reservation requests</p>
                </div>
                <Switch
                  checked={notifications.reservationAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, reservationAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Report</p>
                  <p className="text-sm text-muted-foreground">Receive daily summary email</p>
                </div>
                <Switch
                  checked={notifications.dailyReport}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, dailyReport: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Language & Region
              </CardTitle>
              <CardDescription>Set your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="default" className="bg-amber-600 hover:bg-amber-700">English</Button>
                <Button variant="outline">नेपाली</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LibrarySettings;
