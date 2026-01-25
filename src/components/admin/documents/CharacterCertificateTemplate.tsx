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
  gender?: string | null;
}

interface SchoolSettings {
  school_name: string;
  school_address: string | null;
  established_year: number | null;
  logo_url: string | null;
  principal_name: string | null;
}

interface CharacterCertificateData {
  serial_number: string;
  exam_year: string;
  gpa: string;
  grade: string;
  see_reg_no: string;
  symbol_no: string;
  issued_date: string;
  father_name?: string;
  mother_name?: string;
  ward_no?: string;
  district?: string;
  municipality?: string;
}

interface CharacterCertificateTemplateProps {
  student: Student;
  schoolSettings: SchoolSettings;
  data: CharacterCertificateData;
}

const CharacterCertificateTemplate = forwardRef<HTMLDivElement, CharacterCertificateTemplateProps>(
  ({ student, schoolSettings, data }, ref) => {
    const getGenderText = () => {
      if (student.gender === "male") return "Mr.";
      if (student.gender === "female") return "Miss.";
      return "Mr./Miss.";
    };

    const getGenderPronoun = () => {
      if (student.gender === "male") return "He";
      if (student.gender === "female") return "She";
      return "He/She";
    };

    const getRelationText = () => {
      if (student.gender === "male") return "Son";
      if (student.gender === "female") return "Daughter";
      return "Son/Daughter";
    };

    const formatBSDate = (dateStr: string | null) => {
      if (!dateStr) return "..................";
      return dateStr;
    };

    return (
      <div
        ref={ref}
        className="bg-white p-8 w-[800px] min-h-[1000px] mx-auto shadow-lg border-4 border-red-700"
        style={{
          fontFamily: "'Times New Roman', serif",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95))",
        }}
      >
        {/* Decorative Border */}
        <div className="border-2 border-red-600 p-6 relative">
          {/* Left decorative line */}
          <div className="absolute left-2 top-0 bottom-0 w-1 bg-red-700 flex flex-col justify-around">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-red-700 -ml-1 rounded-full" />
            ))}
          </div>

          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-black italic">
              {schoolSettings.school_name || "Shree Durga Saraswati Janta Secondary School"}
            </h1>
            <p className="text-sm">{schoolSettings.school_address || "Municipality Barahathawa-10 Kishanpur Kaltani, Sarlahi"}</p>
            <p className="text-sm">Province No. 2 Nepal</p>
            <p className="text-sm">Estd. {schoolSettings.established_year || 2042} B.S.</p>
          </div>

          {/* Logo and Photo */}
          <div className="flex justify-between items-start mb-4">
            <div className="w-24 h-24 border-2 border-gray-400 flex items-center justify-center">
              {schoolSettings.logo_url ? (
                <img src={schoolSettings.logo_url} alt="School Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-center text-gray-500">School Logo</span>
              )}
            </div>
            <div className="text-left">
              <p className="font-semibold">S.No. ..........{data.serial_number || "___"}</p>
            </div>
            <div className="w-24 h-28 border-2 border-gray-400 flex items-center justify-center overflow-hidden">
              {student.photo_url ? (
                <img src={student.photo_url} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-center text-gray-500">Photo</span>
              )}
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center my-6">
            <div className="inline-block bg-red-700 text-white px-6 py-2 text-xl font-bold tracking-wide">
              CHARACTER &amp; TRANSFER CERTIFICATE
            </div>
          </div>

          {/* Certificate Content */}
          <div className="space-y-3 text-base leading-relaxed px-4">
            <p className="italic">
              This is to certify that {getGenderText()}{" "}
              <span className="font-semibold underline decoration-dotted">{student.full_name || ".................."}</span>
            </p>

            <p className="italic">
              {getRelationText()} of Mr.{" "}
              <span className="font-semibold underline decoration-dotted">{data.father_name || student.guardian_name || ".................."}</span>
              {" "}Mrs.{" "}
              <span className="font-semibold underline decoration-dotted">{data.mother_name || ".................."}</span>
            </p>

            <p className="italic">
              an inhabitant of ............ Municipality{" "}
              <span className="font-semibold underline decoration-dotted">{data.municipality || ".................."}</span>
              {" "}Ward No.{" "}
              <span className="font-semibold underline decoration-dotted">{data.ward_no || "..."}</span>
            </p>

            <p className="italic">
              Dist.{" "}
              <span className="font-semibold underline decoration-dotted">{data.district || ".................."}</span>
              {" "}passed the S.E.E. /annual examination of class{" "}
              <span className="font-semibold underline decoration-dotted">{student.class || "..."}</span>
              {" "}held
            </p>

            <p className="italic">
              in{" "}
              <span className="font-semibold underline decoration-dotted">{data.exam_year || "........"}</span>
              {" "}B.S. with .............. grade, having{" "}
              <span className="font-semibold underline decoration-dotted">{data.gpa || "..."}</span>
              {" "}GPA. {getGenderPronoun()} bears a
            </p>

            <p className="italic font-semibold">
              good moral character. we wish him/her a successful career and a bright future.
            </p>

            <div className="mt-4 space-y-2">
              <p>
                Date of Birth :{" "}
                <span className="font-semibold underline decoration-dotted">{formatBSDate(student.date_of_birth)}</span>
                {" "}B.S. ( ............................. A.D.)
              </p>
              <p>
                Basic/S.E.E. Regd. No.{" "}
                <span className="font-semibold underline decoration-dotted">{data.see_reg_no || ".................."}</span>
                {" "}Date of Admission ..........................
              </p>
              <p>
                Basic/S.E.E. Symbol No.{" "}
                <span className="font-semibold underline decoration-dotted">{data.symbol_no || ".................."}</span>
                {" "}Admission Reg. No. ..........................
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="flex justify-between items-end mt-12 px-4">
            <div className="text-center">
              <div className="h-10"></div>
              <div className="border-t border-black pt-1">
                <p className="italic font-semibold">Office Asst.</p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold">{data.issued_date || format(new Date(), "yyyy-MM-dd")}</p>
              <p className="italic font-semibold">Date of Issue</p>
            </div>
            <div className="text-center">
              <div className="h-10"></div>
              <div className="border-t border-black pt-1">
                <p className="italic font-semibold">Headmaster</p>
                <p className="text-xs">{schoolSettings.principal_name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CharacterCertificateTemplate.displayName = "CharacterCertificateTemplate";

export default CharacterCertificateTemplate;
