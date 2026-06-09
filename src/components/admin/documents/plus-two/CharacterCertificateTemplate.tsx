import { forwardRef } from "react";
import CollegeLetterhead from "./CollegeLetterhead";
import principalSignature from "@/assets/principal-signature.png";

interface Student {
  id: string;
  registration_number: string;
  full_name: string;
  class: string;
  stream?: string | null;
  section?: string | null;
  photo_url: string | null;
  date_of_birth?: string | null;
  guardian_name?: string | null;
  gender?: string | null;
}
interface SchoolSettings {
  school_name: string;
  school_address: string | null;
  established_year: number | null;
  logo_url: string | null;
  principal_name: string | null;
}
export interface CharacterCertificateData {
  serial_number: string;
  exam_year_bs: string;
  exam_year_ad: string;
  gpa: string;
  overall_grade: string;
  issued_date: string;
  father_name?: string;
  mother_name?: string;
  district?: string;
  municipality?: string;
  ward_no?: string;
  conduct?: string;
}
interface Props { student: Student; schoolSettings: SchoolSettings; data: CharacterCertificateData; }

const CharacterCertificateTemplate = forwardRef<HTMLDivElement, Props>(({ student, schoolSettings, data }, ref) => {
  const pronoun = student.gender === "female" ? "She" : student.gender === "male" ? "He" : "He/She";
  const honorific = student.gender === "female" ? "Miss" : student.gender === "male" ? "Mr." : "Mr./Miss";
  return (
    <div ref={ref} className="bg-white w-[820px] min-h-[1080px] mx-auto p-10 relative" style={{ fontFamily: "'Times New Roman', serif", color: "#0B1F3A" }}>
      <div className="absolute inset-3 border-[5px] pointer-events-none" style={{ borderColor: "#C9A227" }} />
      <div className="absolute inset-7 border pointer-events-none" style={{ borderColor: "#0B1F3A" }} />

      <CollegeLetterhead schoolSettings={schoolSettings} />

      <div className="flex justify-between items-start px-2 mt-2 mb-4">
        <div className="text-sm"><span className="font-semibold">S. No.:</span> {data.serial_number || "—"}</div>
        <div className="text-center">
          <div className="inline-block px-8 py-2 text-white text-lg font-bold tracking-widest" style={{ background: "linear-gradient(135deg,#0B1F3A,#1a3a6b)" }}>
            CHARACTER CERTIFICATE
          </div>
        </div>
        <div className="w-20 h-24 border-2 overflow-hidden bg-white" style={{ borderColor: "#0B1F3A" }}>
          {student.photo_url ? <img src={student.photo_url} alt="" className="w-full h-full object-cover" /> : <div className="text-[10px] text-center p-2 text-muted-foreground">Passport<br/>Photo</div>}
        </div>
      </div>

      <div className="px-10 text-base leading-relaxed text-justify space-y-4 mt-6">
        <p>This is to certify that <span className="font-semibold">{honorific} <span className="border-b-2 border-dotted px-2">{student.full_name}</span></span>,
        {data.father_name ? <> son/daughter of <span className="font-semibold border-b border-dotted px-1">{data.father_name}</span></> : null}
        {data.mother_name ? <> and <span className="font-semibold border-b border-dotted px-1">{data.mother_name}</span></> : null},
        a permanent resident of {data.municipality ? <span className="font-semibold border-b border-dotted px-1">{data.municipality}</span> : "—"}-<span className="font-semibold border-b border-dotted px-1">{data.ward_no || "—"}</span>,
        <span className="font-semibold border-b border-dotted px-1"> {data.district || "—"} </span>, Nepal,
        was a bona-fide student of this college bearing Registration No.
        <span className="font-semibold border-b border-dotted px-1"> {student.registration_number}</span>.</p>

        <p>{pronoun} completed Class 12 (+2) in the <span className="font-bold uppercase">{student.stream || "—"}</span> stream from this college in
        <span className="font-semibold"> {data.exam_year_bs} B.S. ({data.exam_year_ad} A.D.)</span> with a GPA of
        <span className="font-bold" style={{ color: "#C9A227" }}> {data.gpa || "—"}</span> and an overall grade of
        <span className="font-semibold"> {data.overall_grade || "—"}</span>.</p>

        <p>During {pronoun === "She" ? "her" : pronoun === "He" ? "his" : "their"} academic tenure at this institution, {pronoun.toLowerCase()} bore an <span className="font-semibold">{data.conduct || "excellent"}</span> moral character and {pronoun.toLowerCase()} was never involved in any anti-institutional activity.</p>

        <p className="italic">We wish {pronoun.toLowerCase()} a successful career and a bright future ahead.</p>
      </div>

      <div className="flex justify-between items-end mt-20 px-10">
        <div className="text-center">
          <div className="h-10" />
          <div className="border-t-2 pt-1 px-6" style={{ borderColor: "#0B1F3A" }}>
            <p className="text-xs font-semibold">Class Teacher</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs">Date of Issue</p>
          <p className="font-bold" style={{ color: "#C9A227" }}>{data.issued_date}</p>
        </div>
        <div className="text-center">
          <img src={principalSignature} alt="Principal Signature" className="h-12 mx-auto opacity-90" />
          <div className="border-t-2 pt-1 px-6" style={{ borderColor: "#0B1F3A" }}>
            <p className="text-xs font-semibold">{schoolSettings.principal_name || "Principal"}</p>
            <p className="text-[10px] text-muted-foreground">Principal</p>
          </div>
        </div>
      </div>
    </div>
  );
});
CharacterCertificateTemplate.displayName = "PlusTwoCharacterCertificateTemplate";
export default CharacterCertificateTemplate;
