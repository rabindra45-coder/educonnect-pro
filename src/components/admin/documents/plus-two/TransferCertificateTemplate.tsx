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
  admission_year?: number | null;
}
interface SchoolSettings {
  school_name: string;
  school_address: string | null;
  established_year: number | null;
  logo_url: string | null;
  principal_name: string | null;
}
export interface TransferCertificateData {
  serial_number: string;
  admission_date: string;
  last_class_attended: string;
  date_of_leaving: string;
  reason_of_leaving: string;
  conduct: string;
  fees_cleared: boolean;
  issued_date: string;
  father_name?: string;
  mother_name?: string;
  district?: string;
  municipality?: string;
  ward_no?: string;
}
interface Props { student: Student; schoolSettings: SchoolSettings; data: TransferCertificateData; }

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <tr>
    <td className="py-1 pr-3 align-top font-semibold w-1/3">{label}</td>
    <td className="py-1 border-b border-dotted">{value || "—"}</td>
  </tr>
);

const TransferCertificateTemplate = forwardRef<HTMLDivElement, Props>(({ student, schoolSettings, data }, ref) => (
  <div ref={ref} className="bg-white w-[820px] min-h-[1080px] mx-auto p-10 relative" style={{ fontFamily: "'Times New Roman', serif", color: "#0B1F3A" }}>
    <div className="absolute inset-3 border-4 pointer-events-none" style={{ borderColor: "#C9A227" }} />
    <div className="absolute inset-6 border pointer-events-none" style={{ borderColor: "#0B1F3A" }} />
    <img src={COLLEGE_SEAL_URL} alt="" aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] opacity-[0.06] pointer-events-none select-none" />
    <img src={COLLEGE_SEAL_URL} alt="Official Seal" className="absolute bottom-24 left-16 w-24 h-24 opacity-90 pointer-events-none" />

    <CollegeLetterhead schoolSettings={schoolSettings} />

    <div className="text-center my-4">
      <div className="inline-block px-10 py-2 text-white text-xl font-bold tracking-widest" style={{ background: "linear-gradient(135deg,#0B1F3A,#1a3a6b)" }}>
        TRANSFER CERTIFICATE
      </div>
      <p className="text-xs italic mt-2">(School Leaving Certificate) · S. No.: <span className="font-bold">{data.serial_number || "—"}</span></p>
    </div>

    <table className="w-full text-sm px-2">
      <tbody>
        <Row label="Name of Student" value={student.full_name} />
        <Row label="Father's Name" value={data.father_name || student.guardian_name} />
        <Row label="Mother's Name" value={data.mother_name} />
        <Row label="Registration No." value={student.registration_number} />
        <Row label="Date of Birth" value={student.date_of_birth} />
        <Row label="Address" value={`${data.municipality || ""} - ${data.ward_no || ""}, ${data.district || ""}`} />
        <Row label="Stream / Faculty" value={(student.stream || "—").toString().toUpperCase()} />
        <Row label="Date of Admission" value={data.admission_date} />
        <Row label="Last Class Attended" value={data.last_class_attended} />
        <Row label="Date of Leaving" value={data.date_of_leaving} />
        <Row label="Reason of Leaving" value={data.reason_of_leaving} />
        <Row label="Conduct" value={data.conduct} />
        <Row label="Fees Cleared" value={data.fees_cleared ? "Yes — all dues cleared" : "Pending"} />
      </tbody>
    </table>

    <p className="px-2 mt-6 text-sm italic">Certified that the above particulars are correct as per the records of this college.</p>

    <div className="flex justify-between items-end mt-16 px-6">
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
));
TransferCertificateTemplate.displayName = "TransferCertificateTemplate";
export default TransferCertificateTemplate;
