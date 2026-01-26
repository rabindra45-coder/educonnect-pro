import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface TeacherProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherProfile: TeacherProfile | null;
  onProfileUpdate: () => void;
}

const TeacherProfileEditDialog = ({
  open,
  onOpenChange,
  teacherProfile,
  onProfileUpdate,
}: TeacherProfileEditDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    qualification: "",
    photo_url: "",
  });

  useEffect(() => {
    if (teacherProfile) {
      setFormData({
        email: teacherProfile.email || "",
        phone: teacherProfile.phone || "",
        qualification: teacherProfile.qualification || "",
        photo_url: teacherProfile.photo_url || "",
      });
    }
  }, [teacherProfile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !teacherProfile) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `teacher-${teacherProfile.id}-${Date.now()}.${fileExt}`;
      const filePath = `teachers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("content-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("content-images")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, photo_url: urlData.publicUrl }));

      toast({
        title: "Photo uploaded",
        description: "Your photo has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!teacherProfile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("teachers")
        .update({
          email: formData.email || null,
          phone: formData.phone || null,
          qualification: formData.qualification || null,
          photo_url: formData.photo_url || null,
        })
        .eq("id", teacherProfile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      onProfileUpdate();
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={formData.photo_url} />
              <AvatarFallback className="text-2xl">
                {teacherProfile?.full_name?.charAt(0) || "T"}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={isUploading}
              />
              <label htmlFor="photo-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Change Photo
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Full Name</Label>
              <p className="font-medium text-sm">{teacherProfile?.full_name || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Employee ID</Label>
              <p className="font-medium text-sm">{teacherProfile?.employee_id || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Subject</Label>
              <p className="font-medium text-sm">{teacherProfile?.subject || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Department</Label>
              <p className="font-medium text-sm">{teacherProfile?.department || "N/A"}</p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label htmlFor="qualification">Qualification</Label>
              <Textarea
                id="qualification"
                value={formData.qualification}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, qualification: e.target.value }))
                }
                placeholder="Enter your qualifications"
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherProfileEditDialog;
