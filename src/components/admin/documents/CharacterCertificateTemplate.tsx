import { forwardRef } from "react";
import { format } from "date-fns";
import principalSignature from "@/assets/principal-signature.png";
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
  dob_bs?: string;
  dob_ad?: string;
  admission_date?: string;
  admission_reg_no?: string;
}
interface CharacterCertificateTemplateProps {
  student: Student;
  schoolSettings: SchoolSettings;
  data: CharacterCertificateData;
}
const CharacterCertificateTemplate = forwardRef<HTMLDivElement, CharacterCertificateTemplateProps>(({
  student,
  schoolSettings,
  data
}, ref) => {
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
  const getPronounHimHer = () => {
    if (student.gender === "male") return "him";
    if (student.gender === "female") return "her";
    return "him/her";
  };
  return <div ref={ref} className="bg-white w-[800px] min-h-[1050px] mx-auto shadow-lg relative" style={{
    fontFamily: "'Times New Roman', serif",
    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)),
            url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dc2626' fill-opacity='0.03'%3E%3Cpath fill-rule='evenodd' d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E")
          `
  }}>
        {/* Outer Decorative Border */}
        <div className="absolute inset-0 border-[5px] border-red-800 m-1 pointer-events-none" />
        
        {/* Inner Decorative Border */}
        <div className="absolute inset-0 border-2 border-red-600 m-3 pointer-events-none" />
        
        {/* Decorative Corner Elements */}
        <div className="absolute top-3 left-3 w-16 h-16 border-l-4 border-t-4 border-red-700" />
        <div className="absolute top-3 right-3 w-16 h-16 border-r-4 border-t-4 border-red-700" />
        <div className="absolute bottom-3 left-3 w-16 h-16 border-l-4 border-b-4 border-red-700" />
        <div className="absolute bottom-3 right-3 w-16 h-16 border-r-4 border-b-4 border-red-700" />

        {/* Left Decorative Bar */}
        <div className="absolute left-4 top-20 bottom-20 w-2 bg-gradient-to-b from-red-700 via-red-600 to-red-700 rounded-full flex flex-col justify-around items-center py-4">
          {Array.from({
        length: 15
      }).map((_, i) => <div key={i} className="w-4 h-4 bg-red-700 rounded-full" />)}
        </div>

        <div className="p-8 pl-12">
          {/* Header Section */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-red-800 italic" style={{
          fontFamily: "'Georgia', serif"
        }}>
              {schoolSettings.school_name || "Shree Durga Saraswati Janta Secondary School"}
            </h1>
            <p className="text-sm text-gray-700">{schoolSettings.school_address || "Municipality Barahathawa-10 Kishanpur Kaltani, Sarlahi"}</p>
            <p className="text-sm text-gray-700">Province No. 2, Nepal</p>
            <p className="text-sm font-medium text-red-700">Estd. {schoolSettings.established_year || 2042} B.S.</p>
          </div>

          {/* Logo, Serial Number, and Photo Row */}
          <div className="flex justify-between items-start mb-4 px-4">
            <div className="w-24 h-24 border-2 border-red-700 flex items-center justify-center bg-white shadow-md">
              {schoolSettings.logo_url ? <img src={schoolSettings.logo_url} alt="School Logo" className="w-full h-full object-contain p-1" /> : <div className="text-center">
                  <span className="text-xs text-gray-500">School</span>
                  <br />
                  <span className="text-xs text-gray-500">Logo</span>
                </div>}
            </div>
            
            <div className="text-center">
              <p className="font-semibold text-sm">S.No. <span className="text-lg text-red-700">{data.serial_number || "334"}</span></p>
            </div>
            
            <div className="w-24 h-30 border-2 border-red-700 flex items-center justify-center overflow-hidden bg-white shadow-md">
              {student.photo_url ? <img src={student.photo_url} alt="Student" className="w-full h-full object-cover" /> : <div className="text-center p-2">
                  <span className="text-xs text-gray-500">Passport</span>
                  <br />
                  <span className="text-xs text-gray-500">Photo</span>
                </div>}
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center my-6">
            <div className="inline-block bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white px-8 py-3 text-xl font-bold tracking-widest shadow-lg transform rotate-0" style={{
          letterSpacing: '0.15em'
        }}>
              CHARACTER &amp; TRANSFER CERTIFICATE
            </div>
          </div>

          {/* Certificate Content */}
          <div className="space-y-4 text-base leading-relaxed px-6 mx-[75px]" style={{
        fontFamily: "'Times New Roman', serif"
      }}>
            <p className="italic text-lg">
              <span className="font-medium">This is to certify that</span> {getGenderText()}{" "}
              <span className="font-bold border-b-2 border-dotted border-black">{student.full_name || ".................."}</span>
            </p>

            <p className="italic text-lg">
              {getRelationText()} of Mr.{" "}
              <span className="font-bold border-b-2 border-dotted border-black">{data.father_name || student.guardian_name || ".................."}</span>
              {" "}Mrs.{" "}
              <span className="font-bold border-b-2 border-dotted border-black">{data.mother_name || ".................."}</span>
            </p>

            <p className="italic text-lg">
              an inhabitant of ............ Municipality{" "}
              <span className="font-bold border-b-2 border-dotted border-black">{data.municipality || ".................."}</span>
              {" "}Ward No.{" "}
              <span className="font-bold border-b-2 border-dotted border-black text-center">{data.ward_no || "..."}</span>
            </p>

            <p className="italic text-lg">
              Dist.{" "}
              <span className="font-bold border-b-2 border-dotted border-black">{data.district || ".................."}</span>
              {" "}passed the S.E.E. /annual examination of class{" "}
              <span className="font-bold border-b-2 border-dotted border-black">{student.class || "10"}</span>
              {" "}held
            </p>

            <p className="italic text-lg">
              in{" "}
              <span className="font-bold border-b-2 border-dotted border-black">{data.exam_year || "2080"}</span>
              {" "}B.S. with{" "}
              <span className="font-bold border-b-2 border-dotted border-black">{data.grade || "B+"}</span>
              {" "}grade, having{" "}
              <span className="font-bold border-b-2 border-dotted border-black text-lg">{data.gpa || "2.94"}</span>
              {" "}GPA. {getGenderPronoun()} bears a
            </p>

            <p className="italic text-lg font-semibold text-center py-2">
              good moral character. We wish {getPronounHimHer()} a successful career and a bright future.
            </p>

            {/* Details Section */}
            <div className="mt-6 space-y-3 text-base">
              <p>
                Date of Birth :{" "}
                <span className="font-bold border-b-2 border-dotted border-black">{data.dob_bs || student.date_of_birth || ".................."}</span>
                {" "}B.S. ({" "}
                <span className="font-bold">{data.dob_ad || "..........................."}</span>
                {" "}A.D.)
              </p>
              <p>
                Basic/S.E.E. Regd. No.{" "}
                <span className="font-bold border-b-2 border-dotted border-black">{data.see_reg_no || ".................."}</span>
                {" "}Date of Admission{" "}
                <span className="font-bold border-b-2 border-dotted border-black">{data.admission_date || "........................"}</span>
              </p>
              <p>
                Basic/S.E.E. Symbol No.{" "}
                <span className="font-bold border-b-2 border-dotted border-black">{data.symbol_no || ".................."}</span>
                {" "}Admission Reg. No.{" "}
                <span className="font-bold border-b-2 border-dotted border-black">{data.admission_reg_no || "........................"}</span>
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="flex justify-between items-end mt-16 px-6">
            <div className="text-center">
              <div className="h-12"></div>
              <div className="border-t-2 border-black pt-1 px-4">
                <p className="italic font-semibold text-sm">Office Asst.</p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-red-700">{data.issued_date || format(new Date(), "yyyy-MM-dd")}</p>
              <p className="italic font-semibold text-sm">Date of Issue</p>
            </div>
            <div className="text-center">
              <img src={principalSignature} alt="Principal Signature" className="h-14 mx-auto object-contain" />
              <div className="border-t-2 border-black pt-1 px-4">
                <p className="italic font-semibold text-sm">Headmaster</p>
                <p className="text-xs text-gray-600">{schoolSettings.principal_name || "Principal Name"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>;
});
CharacterCertificateTemplate.displayName = "CharacterCertificateTemplate";
export default CharacterCertificateTemplate;