import { forwardRef } from "react";
import CollegeLetterhead from "./CollegeLetterhead";
import principalSignature from "@/assets/principal-signature.png";
import { COLLEGE_SEAL_URL } from "@/assets/college-seal";

export interface MarkRow {
  code: string;
  name: string;
  credit_hours: number;
  theory_full: number;
  theory_marks: number | null;
  practical_full: number;
  practical_marks: number | null;
  total: number | null;
  grade: string | null;
  grade_point: number | null;
}

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
}

interface SchoolSettings {
  school_name: string;
  school_address: string | null;
  established_year: number | null;
  logo_url: string | null;
  principal_name: string | null;
}

export interface MarkSheetData {
  serial_number: string;
  symbol_no: string;
  neb_regd_no: string;
  exam_year_bs: string;
  exam_year_ad: string;
  issued_date: string;
  gpa: string;
  overall_grade: string;
  result_status: "PASSED" | "PROMOTED" | "FAILED" | string;
  subjects: MarkRow[];
  variant?: "class11" | "class12";
}

interface Props {
  student: Student;
  schoolSettings: SchoolSettings;
  data: MarkSheetData;
}

const Class12MarkSheetTemplate = forwardRef<HTMLDivElement, Props>(({ student, schoolSettings, data }, ref) => {
  const isClass12 = (data.variant ?? (student.class === "12" ? "class12" : "class11")) === "class12";
  const title = isClass12 ? "GRADE SHEET — CLASS 12 (NEB)" : "INTERNAL GRADE SHEET — CLASS 11";

  return (
    <div ref={ref} className="bg-white w-[820px] min-h-[1080px] mx-auto p-10 relative" style={{ fontFamily: "'Times New Roman', serif", color: "#0B1F3A" }}>
      <div className="absolute inset-3 border-2 pointer-events-none" style={{ borderColor: "#C9A227" }} />
      <div className="absolute inset-5 border pointer-events-none" style={{ borderColor: "#0B1F3A" }} />

      <CollegeLetterhead schoolSettings={schoolSettings} subtitle="Office of the Controller of Examinations" />

      <div className="flex justify-between items-start mb-4 px-2">
        <div className="text-sm">
          <p><span className="font-semibold">S. No.:</span> {data.serial_number || "—"}</p>
          <p><span className="font-semibold">NEB Regd. No.:</span> {data.neb_regd_no || "—"}</p>
          <p><span className="font-semibold">Symbol No.:</span> {data.symbol_no || "—"}</p>
        </div>
        <div className="text-center">
          <div className="inline-block px-6 py-2 text-white text-sm font-bold tracking-widest" style={{ background: "linear-gradient(135deg,#0B1F3A,#1a3a6b)" }}>
            {title}
          </div>
          <p className="text-xs mt-1">Examination Year: {data.exam_year_bs} B.S. ({data.exam_year_ad} A.D.)</p>
        </div>
        <div className="w-20 h-24 border-2 overflow-hidden bg-white" style={{ borderColor: "#0B1F3A" }}>
          {student.photo_url ? (
            <img src={student.photo_url} alt="Student" className="w-full h-full object-cover" />
          ) : (
            <div className="text-[10px] text-center p-2 text-muted-foreground">Passport<br/>Photo</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm border rounded p-3 mb-4" style={{ borderColor: "#C9A227", background: "#FFFCF3" }}>
        <p><span className="font-semibold">Name of Student:</span> {student.full_name}</p>
        <p><span className="font-semibold">Reg. No.:</span> {student.registration_number}</p>
        <p><span className="font-semibold">Date of Birth:</span> {student.date_of_birth || "—"}</p>
        <p><span className="font-semibold">Guardian:</span> {student.guardian_name || "—"}</p>
        <p><span className="font-semibold">Stream / Faculty:</span> {(student.stream || "—").toString().toUpperCase()}</p>
        <p><span className="font-semibold">Class / Section:</span> {student.class}{student.section ? ` — ${student.section}` : ""}</p>
      </div>

      <table className="w-full text-sm border border-collapse" style={{ borderColor: "#0B1F3A" }}>
        <thead style={{ background: "#0B1F3A", color: "white" }}>
          <tr>
            <th className="border px-2 py-1 text-left" style={{ borderColor: "#C9A227" }}>Code</th>
            <th className="border px-2 py-1 text-left" style={{ borderColor: "#C9A227" }}>Subject</th>
            <th className="border px-2 py-1" style={{ borderColor: "#C9A227" }}>Credit</th>
            <th className="border px-2 py-1" style={{ borderColor: "#C9A227" }}>Theory<br/><span className="text-[10px] font-normal">(FM)</span></th>
            <th className="border px-2 py-1" style={{ borderColor: "#C9A227" }}>Practical<br/><span className="text-[10px] font-normal">(FM)</span></th>
            <th className="border px-2 py-1" style={{ borderColor: "#C9A227" }}>Total</th>
            <th className="border px-2 py-1" style={{ borderColor: "#C9A227" }}>Grade</th>
            <th className="border px-2 py-1" style={{ borderColor: "#C9A227" }}>GP</th>
          </tr>
        </thead>
        <tbody>
          {data.subjects.map((s, i) => (
            <tr key={i} className={i % 2 ? "bg-[#FFFCF3]" : ""}>
              <td className="border px-2 py-1" style={{ borderColor: "#0B1F3A" }}>{s.code}</td>
              <td className="border px-2 py-1" style={{ borderColor: "#0B1F3A" }}>{s.name}</td>
              <td className="border px-2 py-1 text-center" style={{ borderColor: "#0B1F3A" }}>{s.credit_hours}</td>
              <td className="border px-2 py-1 text-center" style={{ borderColor: "#0B1F3A" }}>{s.theory_marks ?? "—"}<span className="text-[10px] text-muted-foreground"> / {s.theory_full}</span></td>
              <td className="border px-2 py-1 text-center" style={{ borderColor: "#0B1F3A" }}>{s.practical_full > 0 ? `${s.practical_marks ?? "—"} / ${s.practical_full}` : "—"}</td>
              <td className="border px-2 py-1 text-center font-semibold" style={{ borderColor: "#0B1F3A" }}>{s.total ?? "—"}</td>
              <td className="border px-2 py-1 text-center font-bold" style={{ borderColor: "#0B1F3A", color: "#C9A227" }}>{s.grade ?? "—"}</td>
              <td className="border px-2 py-1 text-center" style={{ borderColor: "#0B1F3A" }}>{s.grade_point?.toFixed(1) ?? "—"}</td>
            </tr>
          ))}
          {data.subjects.length === 0 && (
            <tr><td colSpan={8} className="border px-2 py-6 text-center text-muted-foreground" style={{ borderColor: "#0B1F3A" }}>No subjects entered.</td></tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between mt-4 px-2">
        <div className="text-sm space-y-1">
          <p><span className="font-semibold">GPA:</span> <span className="text-lg font-bold" style={{ color: "#C9A227" }}>{data.gpa || "—"}</span></p>
          <p><span className="font-semibold">Overall Grade:</span> {data.overall_grade || "—"}</p>
          <p><span className="font-semibold">Result:</span> <span className="font-bold">{data.result_status || "—"}</span></p>
        </div>
        <div className="text-xs text-right text-muted-foreground max-w-xs">
          <p className="italic">NEB Grading Scale: A+ (90+), A (80–89), B+ (70–79), B (60–69), C+ (50–59), C (40–49), D+ (30–39), D (20–29), NG (&lt;20).</p>
        </div>
      </div>

      <div className="flex justify-between items-end mt-12 px-2">
        <div className="text-center">
          <div className="h-10" />
          <div className="border-t-2 pt-1 px-6" style={{ borderColor: "#0B1F3A" }}>
            <p className="text-xs font-semibold">Class Teacher</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs">Issued on</p>
          <p className="font-bold">{data.issued_date}</p>
        </div>
        <div className="text-center">
          <p className="text-xs italic">Controller of Examinations</p>
          <div className="h-8" />
          <div className="border-t-2 pt-1 px-6" style={{ borderColor: "#0B1F3A" }}>
            <p className="text-xs font-semibold">{schoolSettings.principal_name || "Principal"}</p>
            <p className="text-[10px] text-muted-foreground">Principal</p>
          </div>
        </div>
        <img src={principalSignature} alt="Signature" className="h-10 absolute right-12 bottom-20 opacity-80" />
      </div>
    </div>
  );
});
Class12MarkSheetTemplate.displayName = "Class12MarkSheetTemplate";
export default Class12MarkSheetTemplate;
