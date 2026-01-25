import { forwardRef } from "react";
import { format } from "date-fns";
import nebLogo from "@/assets/neb-logo.png";
import nepalEmblem from "@/assets/nepal-govt-emblem.png";
import nandlalSignature from "@/assets/nandlal-signature.png";

interface Student {
  id: string;
  registration_number: string;
  full_name: string;
  class: string;
  section: string | null;
  photo_url: string | null;
  guardian_name: string | null;
  date_of_birth: string | null;
  address: string | null;
}

interface SchoolSettings {
  school_name: string;
  school_address: string | null;
  established_year: number | null;
  logo_url: string | null;
  principal_name: string | null;
}

interface SubjectMark {
  code: string;
  type: string;
  subject: string;
  credit_hour: number;
  grade: string;
  grade_point: number;
  final_grade: string;
  remarks: string;
}

interface GradeSheetData {
  sr_no: string;
  symbol_no: string;
  roll: string;
  exam_year_bs: string;
  exam_year_ad: string;
  issued_date: string;
  subjects: SubjectMark[];
  total_credit: number;
  gpa: string;
  dob_bs?: string;
  dob_ad?: string;
}

interface GradeSheetTemplateProps {
  student: Student;
  schoolSettings: SchoolSettings;
  data: GradeSheetData;
}

const DEFAULT_SUBJECTS: SubjectMark[] = [
  { code: "1011", type: "COMP.", subject: "ENGLISH (TH)", credit_hour: 3.75, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "1012", type: "COMP.", subject: "ENGLISH (IN)", credit_hour: 1.25, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "1021", type: "COMP.", subject: "NEPALI (TH)", credit_hour: 3.75, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "1022", type: "COMP.", subject: "NEPALI (IN)", credit_hour: 1.25, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "1031", type: "COMP.", subject: "MATHEMATICS (TH)", credit_hour: 3.75, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "1032", type: "COMP.", subject: "MATHEMATICS (IN)", credit_hour: 1.25, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "1041", type: "COMP.", subject: "SCIENCE AND TECHNOLOGY (TH)", credit_hour: 3.75, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "1042", type: "COMP.", subject: "SCIENCE AND TECHNOLOGY (IN)", credit_hour: 1.25, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "1051", type: "COMP.", subject: "SOCIAL STUDIES (TH)", credit_hour: 3.00, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "1052", type: "COMP.", subject: "SOCIAL STUDIES (IN)", credit_hour: 1.00, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "2021", type: "OPT.I", subject: "ADDITIONAL MATHEMATICS (TH)", credit_hour: 3.00, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "2022", type: "OPT.I", subject: "ADDITIONAL MATHEMATICS (IN)", credit_hour: 1.00, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "3011", type: "OPT.II", subject: "OFFICE MGMT & ACCOUNT (TH)", credit_hour: 3.00, grade: "", grade_point: 0, final_grade: "", remarks: "" },
  { code: "3012", type: "OPT.II", subject: "OFFICE MGMT & ACCOUNT (IN)", credit_hour: 1.00, grade: "", grade_point: 0, final_grade: "", remarks: "" },
];

const GradeSheetTemplate = forwardRef<HTMLDivElement, GradeSheetTemplateProps>(
  ({ student, schoolSettings, data }, ref) => {
    const subjects = data.subjects.length > 0 ? data.subjects : DEFAULT_SUBJECTS;
    
    const calculateTotal = () => {
      return subjects.reduce((sum, s) => sum + s.credit_hour, 0);
    };

    const formatBSDate = (dateStr: string | null) => {
      if (!dateStr) return "............................";
      return dateStr;
    };

    return (
      <div
        ref={ref}
        className="bg-white w-[800px] min-h-[1100px] mx-auto shadow-lg relative"
        style={{
          fontFamily: "'Times New Roman', serif",
          fontSize: "12px",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.97), rgba(255,255,255,0.97)),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `,
        }}
      >
        {/* Decorative Border */}
        <div className="absolute inset-0 border-[3px] border-blue-900 m-2 pointer-events-none" />
        <div className="absolute inset-0 border border-blue-700 m-3 pointer-events-none" />

        <div className="p-8 pt-6">
          {/* Header with SR NO */}
          <div className="flex justify-end mb-2">
            <div className="text-right">
              <p className="text-sm">SR NO: <span className="font-bold text-red-700">{data.sr_no || "8022214XXXXX"}</span></p>
            </div>
          </div>

          {/* Nepal Government Header */}
          <div className="text-center mb-4">
            <div className="flex justify-center items-center gap-6 mb-3">
              {/* Nepal Government Emblem */}
              <div className="w-20 h-20">
                <img 
                  src={nepalEmblem} 
                  alt="Nepal Government" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>नेपाल सरकार</p>
                <p className="font-bold text-lg tracking-wide">GOVERNMENT OF NEPAL</p>
                <p className="text-sm font-semibold text-red-700" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>राष्ट्रिय परीक्षा बोर्ड</p>
                <p className="font-bold text-lg text-red-700 tracking-wide">NATIONAL EXAMINATIONS BOARD</p>
              </div>
              
              {/* NEB Logo */}
              <div className="w-20 h-20">
                <img 
                  src={nebLogo} 
                  alt="NEB" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-sm font-semibold text-red-700" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>माध्यमिक शिक्षा परीक्षा, कक्षा-१०</p>
              <p className="font-bold text-red-800 tracking-wide">SECONDARY EDUCATION EXAMINATION, GRADE-10</p>
            </div>
            
            <div className="mt-4 mb-2">
              <h1 className="text-3xl font-bold tracking-[0.2em] text-blue-900" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                GRADE-SHEET
              </h1>
              <p className="text-lg font-semibold text-blue-800" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ग्रेड-सीट</p>
            </div>
          </div>

          {/* Student Info Section */}
          <div className="space-y-2 text-sm mb-4 px-4">
            <div className="flex items-baseline">
              <span className="w-48">THE GRADE(S) SECURED BY</span>
              <span className="flex-1 border-b-2 border-dotted border-black font-bold uppercase px-2 text-base">
                {student.full_name}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-32">DATE OF BIRTH</span>
              <span className="flex-1 border-b-2 border-dotted border-black font-semibold px-2">
                {formatBSDate(student.date_of_birth)}
              </span>
            </div>
            <div className="flex gap-8">
              <div className="flex items-baseline flex-1">
                <span className="w-16">ROLL</span>
                <span className="flex-1 border-b-2 border-dotted border-black font-bold uppercase px-2">
                  {data.roll || student.section || "SARLAHI"}
                </span>
              </div>
              <div className="flex items-baseline flex-1">
                <span className="w-28">SYMBOL NO.</span>
                <span className="flex-1 border-b-2 border-dotted border-black font-bold px-2">
                  {data.symbol_no || "0220XXXX C"}
                </span>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="w-8">OF</span>
              <span className="flex-1 border-b-2 border-dotted border-black font-bold uppercase px-2">
                {schoolSettings.school_name || "DURGA SARASWATI JANATA SECONDARY SCHOOL"}
              </span>
            </div>
            <div className="flex items-baseline flex-wrap">
              <span>IN THE ANNUAL S E EXAMINATION, GRADE-10 OF</span>
              <span className="border-b-2 border-dotted border-black font-bold px-3 mx-1">
                {data.exam_year_bs || "2080"} BS ({data.exam_year_ad || "2024"} AD)
              </span>
              <span>ARE GIVEN BELOW:</span>
            </div>
          </div>

          {/* Grade Table */}
          <div className="border-2 border-black mb-4 mx-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-black p-1.5 w-14 font-bold">CODE</th>
                  <th className="border border-black p-1.5 text-left font-bold" colSpan={2}>SUBJECTS</th>
                  <th className="border border-black p-1.5 w-20 font-bold">CREDIT<br/>HOUR</th>
                  <th className="border border-black p-1.5 w-14 font-bold">GRADE</th>
                  <th className="border border-black p-1.5 w-16 font-bold">GRADE<br/>POINT</th>
                  <th className="border border-black p-1.5 w-14 font-bold">FINAL<br/>GRADE</th>
                  <th className="border border-black p-1.5 w-20 font-bold">REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-black p-1 text-center font-medium">{subject.code}</td>
                    <td className="border border-black p-1 w-14 text-center">{subject.type}</td>
                    <td className="border border-black p-1 font-medium">{subject.subject}</td>
                    <td className="border border-black p-1 text-center">{subject.credit_hour.toFixed(2)}</td>
                    <td className="border border-black p-1 text-center font-bold text-blue-800">{subject.grade}</td>
                    <td className="border border-black p-1 text-center">{subject.grade_point || ""}</td>
                    <td className="border border-black p-1 text-center font-bold text-blue-800">{subject.final_grade}</td>
                    <td className="border border-black p-1 text-center text-red-600">{subject.remarks}</td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="font-bold bg-blue-100">
                  <td className="border border-black p-1.5 text-center" colSpan={3}>TOTAL</td>
                  <td className="border border-black p-1.5 text-center">{data.total_credit || calculateTotal()}</td>
                  <td className="border border-black p-1.5 text-center" colSpan={2}>GRADE POINT AVERAGE (GPA):</td>
                  <td className="border border-black p-1.5 text-center text-xl text-red-700" colSpan={2}>{data.gpa || "0.00"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes Section */}
          <div className="text-xs space-y-0.5 mb-6 px-4 text-gray-700">
            <p><span className="font-bold">1.</span> One Credit Hour equals 32 Clock Hours.</p>
            <p><span className="font-bold">2.</span> TH : Theory, IN : Internal</p>
            <p><span className="font-bold">3.</span> *Abs : Absent, *T : Theory Grade Missing, *I : Internal Grade Missing</p>
            <p className="ml-4"># : Subject(s) Appeared in the Supplementary/Grade Increment Examination</p>
          </div>

          {/* Footer Section */}
          <div className="flex justify-between items-end text-xs px-4 mt-8">
            <div>
              <p className="font-bold text-sm">CHECKED BY:</p>
              <p>NEB, SANOTHIMI, BHAKTAPUR, NEPAL</p>
              <p className="mt-2">DATE OF ISSUE: <span className="font-bold">{data.issued_date || format(new Date(), "dd-MMMM-yyyy")}</span></p>
            </div>
            <div className="text-center">
              <img 
                src={nandlalSignature} 
                alt="Controller Signature" 
                className="h-14 mx-auto object-contain"
              />
              <div className="border-t-2 border-black pt-1 px-8">
                <p className="italic text-sm">Nanda Lal Pandel</p>
                <p className="font-bold text-sm">CONTROLLER OF EXAMINATIONS</p>
              </div>
            </div>
          </div>

          {/* Page Number */}
          <div className="text-center text-xs mt-6 text-gray-500">
            Page 2300 OF 2451
          </div>
        </div>
      </div>
    );
  }
);

GradeSheetTemplate.displayName = "GradeSheetTemplate";

export { DEFAULT_SUBJECTS };
export default GradeSheetTemplate;
