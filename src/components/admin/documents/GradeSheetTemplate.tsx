import { forwardRef } from "react";
import { format } from "date-fns";

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
        className="bg-white p-6 w-[800px] min-h-[1100px] mx-auto shadow-lg"
        style={{
          fontFamily: "'Arial', sans-serif",
          fontSize: "11px",
        }}
      >
        {/* Header with SR NO */}
        <div className="flex justify-between items-start mb-2">
          <div className="w-20"></div>
          <div className="text-right text-xs">
            <p>SR NO: <span className="font-bold">{data.sr_no || "8022214XXXXX"}</span></p>
          </div>
        </div>

        {/* Nepal Government Header */}
        <div className="text-center mb-4">
          <div className="flex justify-center items-center gap-4 mb-2">
            <div className="w-16 h-16 flex items-center justify-center">
              {/* Nepal Government Emblem placeholder */}
              <div className="w-14 h-14 border rounded-full flex items-center justify-center text-xs text-center bg-red-50">
                🇳🇵
              </div>
            </div>
            <div>
              <p className="text-xs">नेपाल सरकार</p>
              <p className="font-bold text-sm">GOVERNMENT OF NEPAL</p>
              <p className="text-xs">राष्ट्रिय परीक्षा बोर्ड</p>
              <p className="font-bold text-sm">NATIONAL EXAMINATIONS BOARD</p>
            </div>
            <div className="w-16 h-16 flex items-center justify-center">
              <div className="w-14 h-14 border rounded-full flex items-center justify-center text-xs text-center bg-blue-50">
                NEB
              </div>
            </div>
          </div>
          
          <p className="font-bold text-red-700 text-sm">SECONDARY EDUCATION EXAMINATION, GRADE-10</p>
          <h1 className="text-2xl font-bold mt-2 tracking-wide">GRADE-SHEET</h1>
        </div>

        {/* Student Info Section */}
        <div className="space-y-1 text-sm mb-4">
          <div className="flex">
            <span className="w-40">THE GRADE(S) SECURED BY</span>
            <span className="flex-1 border-b border-black font-semibold uppercase px-2">
              {student.full_name}
            </span>
          </div>
          <div className="flex">
            <span className="w-40">DATE OF BIRTH</span>
            <span className="flex-1 border-b border-black font-semibold px-2">
              {formatBSDate(student.date_of_birth)}
            </span>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-1">
              <span className="w-20">ROLL</span>
              <span className="flex-1 border-b border-black font-semibold uppercase px-2">
                {data.roll || student.section || "SARLAHI"}
              </span>
            </div>
            <div className="flex flex-1">
              <span className="w-24">SYMBOL NO.</span>
              <span className="flex-1 border-b border-black font-semibold px-2">
                {data.symbol_no || "0220XXXX C"}
              </span>
            </div>
          </div>
          <div className="flex">
            <span className="w-10">OF</span>
            <span className="flex-1 border-b border-black font-semibold uppercase px-2">
              {schoolSettings.school_name || "DURGA SARASWATI JANATA SECONDARY SCHOOL"}
            </span>
          </div>
          <div className="flex">
            <span className="w-64">IN THE ANNUAL S E EXAMINATION, GRADE-10 OF</span>
            <span className="flex-1 border-b border-black font-semibold px-2 text-center">
              {data.exam_year_bs || "2080"} BS ({data.exam_year_ad || "2024"} AD)
            </span>
            <span className="ml-2">ARE GIVEN BELOW:</span>
          </div>
        </div>

        {/* Grade Table */}
        <div className="border border-black mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1 w-14">CODE</th>
                <th className="border border-black p-1 text-left" colSpan={2}>SUBJECTS</th>
                <th className="border border-black p-1 w-16">CREDIT HOUR</th>
                <th className="border border-black p-1 w-14">GRADE</th>
                <th className="border border-black p-1 w-16">GRADE POINT</th>
                <th className="border border-black p-1 w-14">FINAL GRADE</th>
                <th className="border border-black p-1 w-16">REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={index}>
                  <td className="border border-black p-1 text-center">{subject.code}</td>
                  <td className="border border-black p-1 w-14">{subject.type}</td>
                  <td className="border border-black p-1">{subject.subject}</td>
                  <td className="border border-black p-1 text-center">{subject.credit_hour.toFixed(2)}</td>
                  <td className="border border-black p-1 text-center font-semibold">{subject.grade}</td>
                  <td className="border border-black p-1 text-center">{subject.grade_point || ""}</td>
                  <td className="border border-black p-1 text-center font-semibold">{subject.final_grade}</td>
                  <td className="border border-black p-1 text-center">{subject.remarks}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="font-bold bg-gray-50">
                <td className="border border-black p-1 text-center" colSpan={3}>TOTAL</td>
                <td className="border border-black p-1 text-center">{data.total_credit || calculateTotal()}</td>
                <td className="border border-black p-1 text-center" colSpan={2}>GRADE POINT AVERAGE (GPA):</td>
                <td className="border border-black p-1 text-center text-lg" colSpan={2}>{data.gpa || "0.00"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes Section */}
        <div className="text-xs space-y-0.5 mb-6">
          <p><span className="font-bold">1.</span> One Credit Hour equals 32 Clock Hours.</p>
          <p><span className="font-bold">2.</span> TH : Theory, IN : Internal</p>
          <p><span className="font-bold">3.</span> *Abs : Absent</p>
          <p className="ml-4">*T : Theory Grade Missing</p>
          <p className="ml-4">*I : Internal Grade Missing</p>
          <p className="ml-4"># : Subject(s) Appeared in the Supplementary/Grade Increment Examination</p>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end text-xs">
          <div>
            <p className="font-bold">CHECKED BY:</p>
            <p>NEB, SANOTHIMI, BHAKTAPUR, NEPAL</p>
            <p>DATE OF ISSUE: <span className="font-semibold">{data.issued_date || format(new Date(), "dd-MMMM-yyyy")}</span></p>
          </div>
          <div className="text-center">
            <div className="h-8"></div>
            <p className="italic">___________________</p>
            <p className="font-bold">CONTROLLER OF EXAMINATIONS</p>
          </div>
        </div>
      </div>
    );
  }
);

GradeSheetTemplate.displayName = "GradeSheetTemplate";

export { DEFAULT_SUBJECTS };
export default GradeSheetTemplate;
