import { Loader2, Camera, Edit, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoUrl: string | null;
  fullName: string;
  editProfileData: {
    guardian_name: string;
    guardian_phone: string;
    guardian_email: string;
    address: string;
  };
  setEditProfileData: React.Dispatch<React.SetStateAction<{
    guardian_name: string;
    guardian_phone: string;
    guardian_email: string;
    address: string;
  }>>;
  isUploadingPhoto: boolean;
  isUpdatingProfile: boolean;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProfileUpdate: () => void;
}

const EditProfileDialog = ({
  open,
  onOpenChange,
  photoUrl,
  fullName,
  editProfileData,
  setEditProfileData,
  isUploadingPhoto,
  isUpdatingProfile,
  onPhotoUpload,
  onProfileUpdate,
}: EditProfileDialogProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit className="w-5 h-5 text-primary" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile photo and contact details
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="photo" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photo">Photo</TabsTrigger>
            <TabsTrigger value="details">Contact Details</TabsTrigger>
          </TabsList>

          <TabsContent value="photo" className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary via-secondary to-accent rounded-full opacity-30 blur-lg group-hover:opacity-50 transition-opacity" />
                <Avatar className="relative w-32 h-32 border-4 border-card shadow-xl">
                  <AvatarImage src={photoUrl || ""} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="photo-upload-dialog"
                  className="absolute bottom-1 right-1 p-3 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </label>
                <input
                  id="photo-upload-dialog"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPhotoUpload}
                  disabled={isUploadingPhoto}
                />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{fullName}</h3>
                <p className="text-sm text-muted-foreground">Click the camera icon to change your photo</p>
              </div>

              <div className="w-full p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">Photo Guidelines:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use a clear, recent photograph</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Supported formats: JPG, PNG, GIF</li>
                  <li>• Square photos work best</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian_name" className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Guardian Name
                  </Label>
                  <Input
                    id="guardian_name"
                    value={editProfileData.guardian_name}
                    onChange={(e) => setEditProfileData((prev) => ({ ...prev, guardian_name: e.target.value }))}
                    placeholder="Guardian's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian_phone">Guardian Phone</Label>
                  <Input
                    id="guardian_phone"
                    value={editProfileData.guardian_phone}
                    onChange={(e) => setEditProfileData((prev) => ({ ...prev, guardian_phone: e.target.value }))}
                    placeholder="Contact phone number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardian_email">Guardian Email</Label>
                <Input
                  id="guardian_email"
                  type="email"
                  value={editProfileData.guardian_email}
                  onChange={(e) => setEditProfileData((prev) => ({ ...prev, guardian_email: e.target.value }))}
                  placeholder="Contact email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editProfileData.address}
                  onChange={(e) => setEditProfileData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Home address"
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={onProfileUpdate} disabled={isUpdatingProfile}>
                {isUpdatingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
