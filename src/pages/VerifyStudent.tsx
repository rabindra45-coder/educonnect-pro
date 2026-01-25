import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  School, 
  Loader2,
  ArrowLeft,
  Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface StudentInfo {
  id: string;
  full_name: string;
  registration_number: string;
  class: string;
  section: string | null;
  roll_number: number | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  date_of_birth: string | null;
  photo_url: string | null;
  status: string | null;
  gender: string | null;
  admission_year: number | null;
}

interface SchoolSettings {
  school_name: string;
  school_address: string | null;
  school_phone: string | null;
  school_email: string | null;
  logo_url: string | null;
}

const VerifyStudent = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [school, setSchool] = useState<SchoolSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch student data (publicly accessible for verification)
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, full_name, registration_number, class, section, roll_number, guardian_name, guardian_phone, date_of_birth, photo_url, status, gender, admission_year")
        .eq("id", studentId)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) {
        setError("Student not found");
        setIsLoading(false);
        return;
      }

      setStudent(studentData);

      // Fetch school settings
      const { data: schoolData } = await supabase
        .from("school_settings")
        .select("school_name, school_address, school_phone, school_email, logo_url")
        .limit(1)
        .maybeSingle();

      setSchool(schoolData);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Failed to verify student");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying student...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-destructive/5 to-background flex items-center justify-center p-4">
        <Helmet>
          <title>Verification Failed | Student ID</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-6">
              <XCircle className="w-20 h-20 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-destructive mb-2">Verification Failed</h1>
              <p className="text-muted-foreground mb-6">
                {error || "The student ID could not be verified. This may be an invalid or expired ID card."}
              </p>
              <Button asChild variant="outline">
                <Link to="/" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Go to Homepage
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-secondary/5">
      <Helmet>
        <title>Student Verified | {student.full_name}</title>
        <meta name="description" content={`Verified student ID for ${student.full_name} at ${school?.school_name || "School"}`} />
      </Helmet>

      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex items-center gap-4">
          {school?.logo_url && (
            <img src={school.logo_url} alt="School Logo" className="w-12 h-12 object-contain" />
          )}
          <div>
            <h1 className="font-bold text-lg">{school?.school_name || "School"}</h1>
            <p className="text-sm opacity-80">Student Verification System</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Verification Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-full font-medium">
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-lg">Verified Student</span>
          </div>
        </motion.div>

        {/* Student Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            {/* Header with Photo */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="w-28 h-28 border-4 border-white shadow-xl">
                  <AvatarImage src={student.photo_url || ""} alt={student.full_name} />
                  <AvatarFallback className="text-2xl bg-secondary text-secondary-foreground">
                    {getInitials(student.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{student.full_name}</h2>
                  <p className="text-primary-foreground/80 text-lg">{student.registration_number}</p>
                  <Badge 
                    variant={student.status === "active" ? "secondary" : "outline"} 
                    className="mt-2"
                  >
                    {student.status === "active" ? "Active Student" : student.status || "Status Unknown"}
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Academic Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Class</p>
                    <p className="font-semibold text-lg">{student.class}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Section</p>
                    <p className="font-semibold text-lg">{student.section || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-semibold text-lg">{student.roll_number || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Admission Year</p>
                    <p className="font-semibold text-lg">{student.admission_year || "N/A"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  {student.date_of_birth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{formatDate(student.date_of_birth)}</p>
                      </div>
                    </div>
                  )}
                  {student.gender && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium capitalize">{student.gender}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Guardian Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Emergency Contact
                </h3>
                <div className="space-y-3">
                  {student.guardian_name && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Guardian Name</p>
                        <p className="font-medium">{student.guardian_name}</p>
                      </div>
                    </div>
                  )}
                  {student.guardian_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Number</p>
                        <p className="font-medium">{student.guardian_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* School Information */}
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <School className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{school?.school_name || "School"}</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {school?.school_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{school.school_address}</span>
                    </div>
                  )}
                  {school?.school_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{school.school_phone}</span>
                    </div>
                  )}
                  {school?.school_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{school.school_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Footer */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>This verification was performed on {new Date().toLocaleString()}</p>
                <p className="mt-1">ID: {student.id}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button asChild variant="ghost">
            <Link to="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go to School Website
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default VerifyStudent;
