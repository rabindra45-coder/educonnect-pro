import { forwardRef } from "react";
import CollegeLetterhead from "./CollegeLetterhead";
import principalSignature from "@/assets/principal-signature.png";
import { COLLEGE_SEAL_URL } from "@/assets/college-seal";

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
export interface MigrationCertificateData {
  serial_number: string;
  symbol_no: string;
  neb_regd_no: string;
  exam_year_bs: string;
  exam_year_ad: string;
  gpa: string;
  issued_date: string;
  father_name?: string;
  mother_name?: string;
  purpose?: string;
}
interface Props { student: Student; schoolSettings: SchoolSettings; data: MigrationCertificateData; }

const MigrationCertificateTemplate = forwardRef<HTMLDivElement, Props>(({ student, schoolSettings, data }, ref) => {
  const pronoun = student.gender === "female" ? "She" : student.gender === "male" ? "He" : "He/She";
  const honorific = student.gender === "female" ? "Miss" : student.gender === "male" ? "Mr." : "Mr./Miss";
  return (
    <div ref={ref} className="bg-white w-[820px] min-h-[1080px] mx-auto p-10 relative" style={{ fontFamily: "'Times New Roman', serif", color: "#0B1F3A" }}>
      <div className="absolute inset-3 border-4 pointer-events-none" style={{ borderColor: "#0B1F3A" }} />
      <div className="absolute inset-6 border-2 border-double pointer-events-none" style={{ borderColor: "#C9A227" }} />

      <img src={COLLEGE_SEAL_URL} alt="" aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] opacity-[0.06] pointer-events-none select-none" />
      <img src={COLLEGE_SEAL_URL} alt="Official Seal" className="absolute bottom-24 left-16 w-24 h-24 opacity-90 pointer-events-none" />

      <CollegeLetterhead schoolSettings={schoolSettings} />

      <div className="text-center my-6">
        <div className="inline-block px-10 py-2 text-white text-xl font-bold tracking-widest" style={{ background: "linear-gradient(135deg,#0B1F3A,#1a3a6b)" }}>
          MIGRATION CERTIFICATE
        </div>
        <p className="text-xs italic mt-2">S. No.: <span className="font-bold">{data.serial_number || "—"}</span></p>
      </div>

      <div className="px-10 text-base leading-relaxed text-justify space-y-4 mt-6">
        <p>This is to certify that <span className="font-semibold">{honorific} <span className="border-b-2 border-dotted px-1">{student.full_name}</span></span>,
        {data.father_name ? <> son/daughter of <span className="font-semibold border-b border-dotted px-1">{data.father_name}</span></> : null}
        {data.mother_name ? <> and <span className="font-semibold border-b border-dotted px-1">{data.mother_name}</span></> : null},
        was a bona-fide student of this college and has completed Class 12 (+2) in the
        <span className="font-bold uppercase"> {student.stream || "—"} </span>
        stream under the National Examination Board (NEB), Nepal, in the year
        <span className="font-semibold"> {data.exam_year_bs} B.S. ({data.exam_year_ad} A.D.)</span> securing a GPA of
        <span className="font-bold" style={{ color: "#C9A227" }}> {data.gpa || "—"}</span>.</p>

        <p>{pronoun} bears NEB Registration No. <span className="font-semibold border-b border-dotted px-1">{data.neb_regd_no || "—"}</span> and Symbol No. <span className="font-semibold border-b border-dotted px-1">{data.symbol_no || "—"}</span>.</p>

        <p>This certificate is issued to enable the student to pursue further studies in any university / board of higher education {data.purpose ? <>for the purpose of <span className="italic">{data.purpose}</span></> : null}. This college has <span className="font-semibold">no objection</span> to {pronoun.toLowerCase()} migrating to another institution / examination board.</p>

        <p className="italic">{pronoun} bears a good moral character. We wish {pronoun.toLowerCase()} every success in {pronoun === "She" ? "her" : pronoun === "He" ? "his" : "their"} future endeavours.</p>
      </div>

      <div className="flex justify-between items-end mt-20 px-10">
        <div className="text-center">
          <div className="h-10" />
          <div className="border-t-2 pt-1 px-6" style={{ borderColor: "#0B1F3A" }}>
            <p className="text-xs font-semibold">Office Assistant</p>
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
MigrationCertificateTemplate.displayName = "MigrationCertificateTemplate";
export default MigrationCertificateTemplate;
