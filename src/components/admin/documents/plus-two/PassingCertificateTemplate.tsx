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
export interface PassingCertificateData {
  serial_number: string;
  exam_year_bs: string;
  exam_year_ad: string;
  symbol_no: string;
  neb_regd_no: string;
  gpa: string;
  overall_grade: string;
  issued_date: string;
  father_name?: string;
  mother_name?: string;
}
interface Props { student: Student; schoolSettings: SchoolSettings; data: PassingCertificateData; }

const PassingCertificateTemplate = forwardRef<HTMLDivElement, Props>(({ student, schoolSettings, data }, ref) => {
  const pronoun = student.gender === "female" ? "She" : student.gender === "male" ? "He" : "He/She";
  const honorific = student.gender === "female" ? "Miss" : student.gender === "male" ? "Mr." : "Mr./Miss";
  return (
    <div ref={ref} className="bg-white w-[820px] min-h-[1080px] mx-auto p-10 relative" style={{ fontFamily: "'Times New Roman', serif", color: "#0B1F3A", background: "linear-gradient(135deg,#FFFDF5 0%,#FFFCF3 100%)" }}>
      <div className="absolute inset-3 border-[6px] pointer-events-none" style={{ borderColor: "#C9A227" }} />
      <div className="absolute inset-7 border pointer-events-none" style={{ borderColor: "#0B1F3A" }} />
      {[ "tl","tr","bl","br" ].map(c => (
        <div key={c} className={`absolute w-16 h-16 border-4 ${c==="tl"?"top-4 left-4 border-l-4 border-t-4 border-r-0 border-b-0":c==="tr"?"top-4 right-4 border-r-4 border-t-4 border-l-0 border-b-0":c==="bl"?"bottom-4 left-4 border-l-4 border-b-4 border-r-0 border-t-0":"bottom-4 right-4 border-r-4 border-b-4 border-l-0 border-t-0"}`} style={{ borderColor: "#0B1F3A" }} />
      ))}

      <div className="relative">
        <CollegeLetterhead schoolSettings={schoolSettings} subtitle="Office of the Controller of Examinations" />

        <div className="text-center my-6">
          <div className="inline-block px-10 py-3 text-white text-2xl font-bold tracking-[0.25em]" style={{ background: "linear-gradient(135deg,#0B1F3A,#1a3a6b)", boxShadow: "0 8px 24px rgba(11,31,58,0.25)" }}>
            PASSING CERTIFICATE
          </div>
          <p className="text-xs italic mt-2">S. No.: <span className="font-bold">{data.serial_number || "—"}</span></p>
        </div>

        <div className="text-lg leading-relaxed px-10 space-y-4 text-justify mt-8">
          <p>This is to certify that <span className="font-semibold">{honorific} <span className="border-b-2 border-dotted px-2">{student.full_name}</span></span>,
          {data.father_name ? <> son/daughter of <span className="font-semibold border-b border-dotted px-1">{data.father_name}</span></> : null}
          {data.mother_name ? <> and <span className="font-semibold border-b border-dotted px-1">{data.mother_name}</span></> : null},
          bearing NEB Registration No. <span className="font-semibold border-b border-dotted px-1">{data.neb_regd_no || "—"}</span> and Symbol No. <span className="font-semibold border-b border-dotted px-1">{data.symbol_no || "—"}</span>,
          has successfully completed the <span className="font-bold">Higher Secondary Education (Class 12 / +2)</span> in the
          <span className="font-bold uppercase"> {student.stream || "—"} </span>
          stream from this college in the year <span className="font-semibold">{data.exam_year_bs} B.S. ({data.exam_year_ad} A.D.)</span>.</p>

          <p>{pronoun} has secured a Grade Point Average (GPA) of <span className="text-2xl font-bold align-middle" style={{ color: "#C9A227" }}>{data.gpa || "—"}</span> with an overall grade of <span className="font-semibold">{data.overall_grade || "—"}</span> as per the National Examination Board (NEB) grading system.</p>

          <p>We wish {pronoun.toLowerCase()} a bright academic and professional future ahead.</p>
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
            <p className="font-bold text-lg" style={{ color: "#C9A227" }}>{data.issued_date}</p>
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
    </div>
  );
});
PassingCertificateTemplate.displayName = "PassingCertificateTemplate";
export default PassingCertificateTemplate;
