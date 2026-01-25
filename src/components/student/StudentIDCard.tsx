import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";
import { Download, RotateCcw, CreditCard, Phone, Mail, MapPin, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

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

interface SchoolSettings {
  school_name: string;
  school_address: string | null;
  school_phone: string | null;
  school_email: string | null;
  school_website: string | null;
  logo_url: string | null;
  principal_name: string | null;
}

interface StudentIDCardProps {
  studentInfo: StudentInfo;
  schoolSettings: SchoolSettings;
}

const StudentIDCard = ({ studentInfo, schoolSettings }: StudentIDCardProps) => {
  const [showBack, setShowBack] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate verification URL with student ID
  const verificationUrl = `${window.location.origin}/verify/${studentInfo.id}`;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCurrentYear = () => new Date().getFullYear();
  const getIssueDate = () => {
    const date = new Date();
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  };
  const getValidTill = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const downloadCard = async (side: "front" | "back" | "both") => {
    setIsDownloading(true);
    try {
      if (side === "front" && frontRef.current) {
        const dataUrl = await toPng(frontRef.current, { quality: 1, pixelRatio: 3 });
        downloadImage(dataUrl, `${studentInfo.registration_number}-front.png`);
      } else if (side === "back" && backRef.current) {
        const dataUrl = await toPng(backRef.current, { quality: 1, pixelRatio: 3 });
        downloadImage(dataUrl, `${studentInfo.registration_number}-back.png`);
      } else if (side === "both") {
        if (frontRef.current) {
          const frontUrl = await toPng(frontRef.current, { quality: 1, pixelRatio: 3 });
          downloadImage(frontUrl, `${studentInfo.registration_number}-front.png`);
        }
        if (backRef.current) {
          const backUrl = await toPng(backRef.current, { quality: 1, pixelRatio: 3 });
          downloadImage(backUrl, `${studentInfo.registration_number}-back.png`);
        }
      }
      toast({ title: "Success", description: "ID card downloaded successfully!" });
    } catch (error) {
      console.error("Error downloading card:", error);
      toast({ title: "Error", description: "Failed to download ID card", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="w-5 h-5 text-primary" />
          Student ID Card
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Card Preview */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="perspective-1000"
            animate={{ rotateY: showBack ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {!showBack ? (
              /* Front Side */
              <div
                ref={frontRef}
                className="w-[320px] h-[500px] rounded-2xl overflow-hidden shadow-xl relative"
                style={{
                  background: "linear-gradient(135deg, #1e3a5f 0%, #0d2137 50%, #1e3a5f 100%)",
                }}
              >
                {/* Decorative Wave */}
                <div className="absolute inset-0 overflow-hidden">
                  <svg className="absolute top-20 left-0 w-full" viewBox="0 0 320 100" fill="none">
                    <path
                      d="M0 50 Q80 20 160 50 T320 50 V100 H0 Z"
                      fill="rgba(212, 175, 55, 0.3)"
                    />
                    <path
                      d="M0 60 Q80 30 160 60 T320 60 V100 H0 Z"
                      fill="rgba(212, 175, 55, 0.2)"
                    />
                  </svg>
                </div>

                {/* Header */}
                <div className="relative z-10 pt-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {schoolSettings.logo_url ? (
                      <img src={schoolSettings.logo_url} alt="School Logo" className="w-12 h-12 object-contain" />
                    ) : (
                      <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-secondary font-bold text-lg">📚</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-white font-bold text-sm uppercase tracking-wide leading-tight">
                    {schoolSettings.school_name}
                  </h2>
                  <p className="text-secondary text-[10px] italic mt-1">Knowledge • Discipline • Excellence</p>
                </div>

                {/* Gold Divider */}
                <div className="h-1 bg-gradient-to-r from-transparent via-secondary to-transparent mx-4 mt-3" />

                {/* Photo & Details */}
                <div className="relative z-10 px-6 pt-4">
                  <div className="flex gap-4">
                    {/* Photo */}
                    <div className="shrink-0">
                      <div className="w-24 h-28 border-4 border-white rounded-lg overflow-hidden bg-white shadow-lg">
                        {studentInfo.photo_url ? (
                          <img src={studentInfo.photo_url} alt={studentInfo.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <User className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-white space-y-1.5 flex-1">
                      <h3 className="font-bold text-base leading-tight">{studentInfo.full_name}</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-secondary">Class:</span> {studentInfo.class}</p>
                        <p><span className="text-secondary">Section:</span> {studentInfo.section || "N/A"}</p>
                        <p><span className="text-secondary">Roll No:</span> {studentInfo.roll_number || "N/A"}</p>
                        <p><span className="text-secondary">ID No:</span> {studentInfo.registration_number}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gold Bar */}
                <div className="h-8 bg-gradient-to-r from-secondary via-yellow-400 to-secondary mx-4 mt-4 flex items-center justify-around text-[10px] text-primary-foreground font-medium">
                  <span>Issue Date: {getIssueDate()}</span>
                  <span>Valid Till: {getValidTill()}</span>
                </div>

                {/* Signature Section */}
                <div className="relative z-10 px-6 pt-4 pb-4 flex items-end justify-between">
                  <div className="text-center">
                    <p className="text-secondary italic font-serif text-lg">{schoolSettings.principal_name || "Principal"}</p>
                    <div className="w-20 h-0.5 bg-secondary/50 mt-1 mx-auto" />
                    <p className="text-white text-[10px] mt-1">Principal</p>
                  </div>
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-secondary/30">
                    {schoolSettings.logo_url ? (
                      <img src={schoolSettings.logo_url} alt="School Seal" className="w-10 h-10 object-contain opacity-50" />
                    ) : (
                      <span className="text-secondary/50 text-2xl">🏫</span>
                    )}
                  </div>
                </div>

                {/* Barcode at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent py-2 text-center">
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white"
                        style={{ width: Math.random() > 0.5 ? "2px" : "1px", height: "20px" }}
                      />
                    ))}
                  </div>
                  <p className="text-white text-[8px] mt-1">{studentInfo.registration_number}</p>
                </div>
              </div>
            ) : (
              /* Back Side */
              <div
                ref={backRef}
                className="w-[320px] h-[500px] rounded-2xl overflow-hidden shadow-xl relative bg-gradient-to-b from-white via-slate-50 to-white"
                style={{ transform: "rotateY(180deg)" }}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/90 text-white py-4 px-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{schoolSettings.school_address || "Address"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{schoolSettings.school_phone || "Phone"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{schoolSettings.school_email || "Email"}</span>
                  </div>
                  {schoolSettings.school_website && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Globe className="w-4 h-4" />
                      <span>{schoolSettings.school_website}</span>
                    </div>
                  )}
                </div>

                {/* Gold Divider */}
                <div className="h-2 bg-gradient-to-r from-secondary via-yellow-400 to-secondary" />

                {/* Guidelines */}
                <div className="px-4 py-3">
                  <h4 className="text-primary font-bold text-sm text-center border-b-2 border-secondary pb-1 mb-3">
                    ID CARD GUIDELINES
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-2">
                    <li className="flex gap-2">
                      <span className="text-secondary">•</span>
                      This ID card must be carried at all times.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-secondary">•</span>
                      Loss of card must be reported immediately.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-secondary">•</span>
                      Card is non-transferable.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-secondary">•</span>
                      If found, please return to the school office.
                    </li>
                  </ul>
                </div>

                {/* Emergency Contact */}
                <div className="mx-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <h5 className="font-semibold text-sm text-primary mb-2">In Case of Emergency:</h5>
                  <div className="text-xs space-y-1">
                    <p><span className="font-medium">Guardian Name:</span> {studentInfo.guardian_name || "_________"}</p>
                    <p><span className="font-medium">Emergency Contact:</span> {studentInfo.guardian_phone || "_________"}</p>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex justify-center mt-4">
                  <div className="text-center">
                    <div className="p-2 bg-white rounded-lg shadow-md inline-block">
                      <QRCodeSVG
                        value={verificationUrl}
                        size={80}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">Scan to verify</p>
                  </div>
                </div>

                {/* Watermark */}
                <div className="absolute bottom-16 right-4 opacity-10">
                  {schoolSettings.logo_url ? (
                    <img src={schoolSettings.logo_url} alt="" className="w-20 h-20 object-contain" />
                  ) : (
                    <span className="text-6xl">🏫</span>
                  )}
                </div>

                {/* Barcode at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/90 py-2 text-center">
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white"
                        style={{ width: Math.random() > 0.5 ? "2px" : "1px", height: "25px" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBack(!showBack)}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {showBack ? "Show Front" : "Show Back"}
          </Button>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCard("front")}
            disabled={isDownloading}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download Front
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCard("back")}
            disabled={isDownloading}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download Back
          </Button>
          <Button
            onClick={() => downloadCard("both")}
            disabled={isDownloading}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download Both
          </Button>
        </div>

        {/* Hidden elements for download (to capture both sides) */}
        <div className="fixed -left-[9999px] top-0">
          {/* Front for download */}
          <div
            ref={frontRef}
            className="w-[320px] h-[500px] rounded-2xl overflow-hidden shadow-xl relative"
            style={{
              background: "linear-gradient(135deg, #1e3a5f 0%, #0d2137 50%, #1e3a5f 100%)",
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <svg className="absolute top-20 left-0 w-full" viewBox="0 0 320 100" fill="none">
                <path d="M0 50 Q80 20 160 50 T320 50 V100 H0 Z" fill="rgba(212, 175, 55, 0.3)" />
                <path d="M0 60 Q80 30 160 60 T320 60 V100 H0 Z" fill="rgba(212, 175, 55, 0.2)" />
              </svg>
            </div>
            <div className="relative z-10 pt-4 px-4 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                {schoolSettings.logo_url ? (
                  <img src={schoolSettings.logo_url} alt="School Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <span className="text-amber-500 font-bold text-lg">📚</span>
                  </div>
                )}
              </div>
              <h2 className="text-white font-bold text-sm uppercase tracking-wide leading-tight">
                {schoolSettings.school_name}
              </h2>
              <p className="text-amber-400 text-[10px] italic mt-1">Knowledge • Discipline • Excellence</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-4 mt-3" />
            <div className="relative z-10 px-6 pt-4">
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-24 h-28 border-4 border-white rounded-lg overflow-hidden bg-white shadow-lg">
                    {studentInfo.photo_url ? (
                      <img src={studentInfo.photo_url} alt={studentInfo.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-white space-y-1.5 flex-1">
                  <h3 className="font-bold text-base leading-tight">{studentInfo.full_name}</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-amber-400">Class:</span> {studentInfo.class}</p>
                    <p><span className="text-amber-400">Section:</span> {studentInfo.section || "N/A"}</p>
                    <p><span className="text-amber-400">Roll No:</span> {studentInfo.roll_number || "N/A"}</p>
                    <p><span className="text-amber-400">ID No:</span> {studentInfo.registration_number}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-8 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 mx-4 mt-4 flex items-center justify-around text-[10px] text-slate-900 font-medium">
              <span>Issue Date: {getIssueDate()}</span>
              <span>Valid Till: {getValidTill()}</span>
            </div>
            <div className="relative z-10 px-6 pt-4 pb-4 flex items-end justify-between">
              <div className="text-center">
                <p className="text-amber-400 italic font-serif text-lg">{schoolSettings.principal_name || "Principal"}</p>
                <div className="w-20 h-0.5 bg-amber-500/50 mt-1 mx-auto" />
                <p className="text-white text-[10px] mt-1">Principal</p>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-amber-500/30">
                {schoolSettings.logo_url ? (
                  <img src={schoolSettings.logo_url} alt="School Seal" className="w-10 h-10 object-contain opacity-50" />
                ) : (
                  <span className="text-amber-500/50 text-2xl">🏫</span>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent py-2 text-center">
              <div className="flex justify-center gap-0.5">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="bg-white" style={{ width: Math.random() > 0.5 ? "2px" : "1px", height: "20px" }} />
                ))}
              </div>
              <p className="text-white text-[8px] mt-1">{studentInfo.registration_number}</p>
            </div>
          </div>

          {/* Back for download */}
          <div
            ref={backRef}
            className="w-[320px] h-[500px] rounded-2xl overflow-hidden shadow-xl relative bg-gradient-to-b from-white via-slate-50 to-white"
          >
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-4 px-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{schoolSettings.school_address || "Address"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <Phone className="w-4 h-4" />
                <span>{schoolSettings.school_phone || "Phone"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <Mail className="w-4 h-4" />
                <span>{schoolSettings.school_email || "Email"}</span>
              </div>
              {schoolSettings.school_website && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Globe className="w-4 h-4" />
                  <span>{schoolSettings.school_website}</span>
                </div>
              )}
            </div>
            <div className="h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
            <div className="px-4 py-3">
              <h4 className="text-slate-800 font-bold text-sm text-center border-b-2 border-amber-500 pb-1 mb-3">
                ID CARD GUIDELINES
              </h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex gap-2"><span className="text-amber-500">•</span>This ID card must be carried at all times.</li>
                <li className="flex gap-2"><span className="text-amber-500">•</span>Loss of card must be reported immediately.</li>
                <li className="flex gap-2"><span className="text-amber-500">•</span>Card is non-transferable.</li>
                <li className="flex gap-2"><span className="text-amber-500">•</span>If found, please return to the school office.</li>
              </ul>
            </div>
            <div className="mx-4 p-3 bg-slate-100 rounded-lg border border-slate-200">
              <h5 className="font-semibold text-sm text-slate-800 mb-2">In Case of Emergency:</h5>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Guardian Name:</span> {studentInfo.guardian_name || "_________"}</p>
                <p><span className="font-medium">Emergency Contact:</span> {studentInfo.guardian_phone || "_________"}</p>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="text-center">
                <div className="p-2 bg-white rounded-lg shadow-md inline-block">
                  <QRCodeSVG value={verificationUrl} size={80} level="H" includeMargin={false} />
                </div>
                <p className="text-[9px] text-slate-500 mt-1">Scan to verify</p>
              </div>
            </div>
            <div className="absolute bottom-16 right-4 opacity-10">
              {schoolSettings.logo_url ? (
                <img src={schoolSettings.logo_url} alt="" className="w-20 h-20 object-contain" />
              ) : (
                <span className="text-6xl">🏫</span>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-slate-800 to-slate-700 py-2 text-center">
              <div className="flex justify-center gap-0.5">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="bg-white" style={{ width: Math.random() > 0.5 ? "2px" : "1px", height: "25px" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentIDCard;
