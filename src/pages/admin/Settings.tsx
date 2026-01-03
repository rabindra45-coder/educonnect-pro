import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { School, Bell, Shield, User, Loader2, MessageSquare, Upload, X, Camera } from "lucide-react";

interface SchoolSettings {
  id: string;
  school_name: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  school_website: string;
  principal_name: string;
  principal_message: string;
  principal_photo_url: string;
  established_year: number;
}

const Settings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [fetchingSchool, setFetchingSchool] = useState(true);
  
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });

  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    id: "",
    school_name: "",
    school_address: "",
    school_phone: "",
    school_email: "",
    school_website: "",
    principal_name: "",
    principal_message: "",
    principal_photo_url: "",
    established_year: 2000,
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    admission_alerts: true,
    notice_reminders: true,
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchSchoolSettings();
  }, []);

  const fetchSchoolSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("school_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setSchoolSettings({
          id: data.id,
          school_name: data.school_name || "",
          school_address: data.school_address || "",
          school_phone: data.school_phone || "",
          school_email: data.school_email || "",
          school_website: data.school_website || "",
          principal_name: data.principal_name || "",
          principal_message: data.principal_message || "",
          principal_photo_url: (data as any).principal_photo_url || "",
          established_year: data.established_year || 2000,
        });
      }
    } catch (error: any) {
      console.error("Error fetching school settings:", error);
    } finally {
      setFetchingSchool(false);
    }
  };

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

  const handleUpdateSchoolSettings = async () => {
    if (!schoolSettings.id) return;
    
    setSchoolLoading(true);
    try {
      const { error } = await supabase
        .from("school_settings")
        .update({
          school_name: schoolSettings.school_name,
          school_address: schoolSettings.school_address,
          school_phone: schoolSettings.school_phone,
          school_email: schoolSettings.school_email,
          school_website: schoolSettings.school_website,
          principal_name: schoolSettings.principal_name,
          principal_message: schoolSettings.principal_message,
          principal_photo_url: schoolSettings.principal_photo_url,
          established_year: schoolSettings.established_year,
        } as any)
        .eq("id", schoolSettings.id);

      if (error) throw error;
      toast({ title: "School settings updated successfully" });
    } catch (error: any) {
      toast({
        title: "Error updating school settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSchoolLoading(false);
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
                Update basic school details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fetchingSchool ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="school_name">School Name</Label>
                    <Input
                      id="school_name"
                      value={schoolSettings.school_name}
                      onChange={(e) =>
                        setSchoolSettings({ ...schoolSettings, school_name: e.target.value })
                      }
                      placeholder="Enter school name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school_address">Address</Label>
                    <Input
                      id="school_address"
                      value={schoolSettings.school_address}
                      onChange={(e) =>
                        setSchoolSettings({ ...schoolSettings, school_address: e.target.value })
                      }
                      placeholder="Enter school address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school_phone">Phone</Label>
                    <Input
                      id="school_phone"
                      value={schoolSettings.school_phone}
                      onChange={(e) =>
                        setSchoolSettings({ ...schoolSettings, school_phone: e.target.value })
                      }
                      placeholder="Enter school phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school_email">Email</Label>
                    <Input
                      id="school_email"
                      type="email"
                      value={schoolSettings.school_email}
                      onChange={(e) =>
                        setSchoolSettings({ ...schoolSettings, school_email: e.target.value })
                      }
                      placeholder="Enter school email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school_website">Website</Label>
                    <Input
                      id="school_website"
                      value={schoolSettings.school_website}
                      onChange={(e) =>
                        setSchoolSettings({ ...schoolSettings, school_website: e.target.value })
                      }
                      placeholder="Enter school website"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="principal_name">Principal Name</Label>
                    <Input
                      id="principal_name"
                      value={schoolSettings.principal_name}
                      onChange={(e) =>
                        setSchoolSettings({ ...schoolSettings, principal_name: e.target.value })
                      }
                      placeholder="Enter principal name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="established_year">Established Year</Label>
                    <Input
                      id="established_year"
                      type="number"
                      value={schoolSettings.established_year}
                      onChange={(e) =>
                        setSchoolSettings({ ...schoolSettings, established_year: parseInt(e.target.value) || 2000 })
                      }
                      placeholder="Enter established year"
                    />
                  </div>
                  <Button onClick={handleUpdateSchoolSettings} disabled={schoolLoading}>
                    {schoolLoading ? "Saving..." : "Save School Settings"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Principal Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Principal's Section
              </CardTitle>
              <CardDescription>
                Update the principal's photo and message displayed on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fetchingSchool ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Principal Photo Upload */}
                  <div className="space-y-3">
                    <Label>Principal Photo</Label>
                    <div className="flex items-start gap-6">
                      <div className="relative">
                        {schoolSettings.principal_photo_url ? (
                          <div className="relative group">
                            <img
                              src={schoolSettings.principal_photo_url}
                              alt="Principal"
                              className="w-32 h-40 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => setSchoolSettings({ ...schoolSettings, principal_photo_url: "" })}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-40 bg-muted rounded-lg border-2 border-dashed flex items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          ref={photoInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setUploadingPhoto(true);
                            try {
                              const fileExt = file.name.split('.').pop();
                              const fileName = `principal-photo-${Date.now()}.${fileExt}`;
                              const filePath = `principal/${fileName}`;

                              const { error: uploadError } = await supabase.storage
                                .from('content-images')
                                .upload(filePath, file);

                              if (uploadError) throw uploadError;

                              const { data: { publicUrl } } = supabase.storage
                                .from('content-images')
                                .getPublicUrl(filePath);

                              setSchoolSettings({ ...schoolSettings, principal_photo_url: publicUrl });
                              toast({ title: "Photo uploaded successfully" });
                            } catch (error: any) {
                              toast({
                                title: "Error uploading photo",
                                description: error.message,
                                variant: "destructive",
                              });
                            } finally {
                              setUploadingPhoto(false);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          {uploadingPhoto ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Photo
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Recommended: Portrait photo (4:5 aspect ratio)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Principal Message */}
                  <div className="space-y-2">
                    <Label htmlFor="principal_message">Message</Label>
                    <Textarea
                      id="principal_message"
                      rows={8}
                      value={schoolSettings.principal_message}
                      onChange={(e) =>
                        setSchoolSettings({ ...schoolSettings, principal_message: e.target.value })
                      }
                      placeholder="Enter the principal's message that will be displayed on the homepage..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Use blank lines to separate paragraphs. The first paragraph will be shown as a quote.
                    </p>
                  </div>
                  <Button onClick={handleUpdateSchoolSettings} disabled={schoolLoading}>
                    {schoolLoading ? "Saving..." : "Save Principal Section"}
                  </Button>
                </>
              )}
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
