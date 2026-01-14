import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  Camera,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Users,
  Edit,
  Shield,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface StudentInfo {
  id: string;
  full_name: string;
  registration_number: string;
  class: string;
  section: string | null;
  roll_number: number | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  date_of_birth: string | null;
  address: string | null;
  photo_url: string | null;
  status: string | null;
  gender: string | null;
  admission_year: number | null;
}

interface ProfileCardProps {
  studentInfo: StudentInfo;
  isUploadingPhoto: boolean;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditProfile: () => void;
}

const ProfileCard = ({ studentInfo, isUploadingPhoto, onPhotoUpload, onEditProfile }: ProfileCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    const fields = [
      studentInfo.full_name,
      studentInfo.registration_number,
      studentInfo.class,
      studentInfo.photo_url,
      studentInfo.date_of_birth,
      studentInfo.guardian_name,
      studentInfo.guardian_phone,
      studentInfo.address,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="overflow-hidden">
        {/* Profile Header with Gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 pb-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          <div className="relative flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
              <Shield className="w-3 h-3 mr-1" />
              {studentInfo.status === "active" ? "Active Student" : studentInfo.status || "Active"}
            </Badge>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onEditProfile}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>

        {/* Avatar - Overlapping the gradient */}
        <div className="relative px-6">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-card shadow-xl">
                <AvatarImage src={studentInfo.photo_url || ""} className="object-cover" />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-bold">
                  {getInitials(studentInfo.full_name)}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="photo-upload-profile"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all hover:scale-110 group-hover:opacity-100"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </label>
              <input
                id="photo-upload-profile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPhotoUpload}
                disabled={isUploadingPhoto}
              />
            </div>
          </div>
        </div>

        <CardContent className="pt-16 pb-6">
          {/* Name & Registration */}
          <div className="text-center mb-6">
            <h3 className="font-display font-bold text-xl">{studentInfo.full_name}</h3>
            <p className="text-sm text-muted-foreground font-mono">{studentInfo.registration_number}</p>
          </div>

          {/* Profile Completion */}
          <div className="mb-6 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                Profile Completion
              </span>
              <span className="text-sm font-bold text-primary">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
            {profileCompletion < 100 && (
              <p className="text-xs text-muted-foreground mt-2">
                Complete your profile to unlock all features
              </p>
            )}
          </div>

          <Separator className="my-4" />

          {/* Academic Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <GraduationCap className="w-5 h-5 text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="font-semibold">
                {studentInfo.class} {studentInfo.section && `(${studentInfo.section})`}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10">
              <Award className="w-5 h-5 text-secondary mb-1" />
              <p className="text-xs text-muted-foreground">Roll No</p>
              <p className="font-semibold">{studentInfo.roll_number || "-"}</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
              <BookOpen className="w-5 h-5 text-accent mb-1" />
              <p className="text-xs text-muted-foreground">Admitted</p>
              <p className="font-semibold">{studentInfo.admission_year || "-"}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <User className="w-5 h-5 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Gender</p>
              <p className="font-semibold capitalize">{studentInfo.gender || "-"}</p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-3">
            {studentInfo.date_of_birth && (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="text-sm font-medium">
                    {formatDate(studentInfo.date_of_birth)} ({calculateAge(studentInfo.date_of_birth)} yrs)
                  </p>
                </div>
              </div>
            )}

            {studentInfo.address && (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-full bg-accent/10">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium">{studentInfo.address}</p>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Guardian Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              Guardian Information
            </h4>

            {studentInfo.guardian_name && (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-full bg-secondary/10">
                  <User className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{studentInfo.guardian_name}</p>
                </div>
              </div>
            )}

            {studentInfo.guardian_phone && (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-full bg-green-500/10">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{studentInfo.guardian_phone}</p>
                </div>
              </div>
            )}

            {studentInfo.guardian_email && (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{studentInfo.guardian_email}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;
