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
  gender?: string | null;
}
interface SchoolSettings {
  school_name: string;
  school_address: string | null;
  established_year: number | null;
  logo_url: string | null;
  principal_name: string | null;
}
interface SEECertificateData {
  sr_no: string;
  symbol_no: string;
  roll: string;
  exam_year_bs: string;
  exam_year_ad: string;
  gpa: string;
  dob_bs: string;
  dob_ad: string;
  issued_date: string;
}
interface SEECertificateTemplateProps {
  student: Student;
  schoolSettings: SchoolSettings;
  data: SEECertificateData;
}
const SEECertificateTemplate = forwardRef<HTMLDivElement, SEECertificateTemplateProps>(({
  student,
  schoolSettings,
  data
}, ref) => {
  const getGenderPronoun = () => {
    if (student.gender === "male") return "his";
    if (student.gender === "female") return "her";
    return "his/her";
  };
  return <div ref={ref} className="bg-white w-[800px] min-h-[1000px] mx-auto shadow-lg relative" style={{
    fontFamily: "'Times New Roman', serif",
    fontSize: "14px",
    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.96), rgba(255,255,255,0.96)),
            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")
          `
  }}>
        {/* Decorative Border */}
        <div className="absolute inset-0 border-[4px] border-red-800 m-2 pointer-events-none" />
        <div className="absolute inset-0 border-2 border-red-600 m-4 pointer-events-none" />

        <div className="p-10 pt-8">
          {/* SR Number - Top Right */}
          <div className="flex justify-end mb-2">
            <p className="text-sm">SR NO: <span className="font-bold text-red-700">{data.sr_no || "8022214XXXXX"}</span></p>
          </div>

          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-8 mb-4">
              {/* Nepal Government Emblem */}
              <div className="w-24 h-24">
                <img alt="Nepal Government" className="w-full h-full object-contain" src="/lovable-uploads/f48e7eed-03dc-465e-bc69-b002671a178f.png" />
              </div>
              
              <div className="text-center flex-1">
                <p className="text-base font-semibold" style={{
              fontFamily: "'Noto Sans Devanagari', sans-serif"
            }}>नेपाल सरकार</p>
                <p className="font-bold text-xl tracking-wider">GOVERNMENT OF NEPAL</p>
                <p className="text-base font-semibold text-red-700" style={{
              fontFamily: "'Noto Sans Devanagari', sans-serif"
            }}>राष्ट्रिय परीक्षा बोर्ड</p>
                <p className="font-bold text-xl text-red-700 tracking-wider">NATIONAL EXAMINATIONS BOARD</p>
                <div className="mt-2">
                  <p className="text-sm font-semibold" style={{
                fontFamily: "'Noto Sans Devanagari', sans-serif"
              }}>माध्यमिक शिक्षा परीक्षा, कक्षा-१०</p>
                  <p className="font-bold text-red-800 tracking-wide">SECONDARY EDUCATION EXAMINATION, GRADE-10</p>
                </div>
              </div>
              
              {/* NEB Logo */}
              <div className="w-24 h-24">
                <img alt="NEB" className="w-full h-full object-contain" src="/lovable-uploads/aa945b20-0f69-4be4-ba9a-d280d543d58e.jpg" />
              </div>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-red-800 mb-1" style={{
          fontFamily: "'Noto Sans Devanagari', sans-serif"
        }}>
              प्रमाण-पत्र
            </h2>
            <h1 className="text-4xl font-bold tracking-wider text-blue-900" style={{
          fontFamily: "'Times New Roman', serif"
        }}>
              Certificate
            </h1>
          </div>

          {/* Certificate Content */}
          <div className="space-y-5 text-base leading-relaxed px-[50px] py-[20px] pl-[29px] pt-[17px] my-0 mx-[10px] mr-0 mb-0 pr-0 pb-px">
            <p className="italic text-left">
              <span className="font-medium">This is to certify that</span>
              <span className="border-b-2 border-dotted border-black font-bold uppercase ml-2 pb-1 inline-block min-w-[250px] text-center">
                {student.full_name || "RABINDRA PANDIT"}
              </span>
              <span className="ml-1">, a student</span>
            </p>

            <p className="italic">
              of
              <span className="border-b-2 border-dotted border-black font-bold uppercase mx-2 pb-1 inline-block min-w-[350px] my-0">
                {schoolSettings.school_name || "DURGA SARASWATI JANATA SECONDARY SCHOOL"}
              </span>
            </p>

            <p className="italic">
              Roll
              <span className="border-b-2 border-dotted border-black font-bold uppercase mx-2 pb-1 inline-block min-w-[200px] text-center">
                {data.roll || "SARLAHI"}
              </span>
              <span>, has duly completed the</span>
            </p>

            <p className="italic">
              Secondary Education Examination, Grade-10 in the year
              <span className="border-b-2 border-dotted border-black font-bold mx-2 pb-1 inline-block">
                {data.exam_year_bs || "2080"} BS ({data.exam_year_ad || "2024"} AD)
              </span>
            </p>

            <p className="italic">
              with Grade Point Average (GPA)
              <span className="border-b-2 border-dotted border-black font-bold text-lg mx-2 pb-1 inline-block min-w-[60px] text-center">
                {data.gpa || "2.94"}
              </span>
              <span>. According to the record of this</span>
            </p>

            <p className="italic">
              office, {getGenderPronoun()} date of birth is
              <span className="border-b-2 border-dotted border-black font-bold mx-2 pb-1 inline-block min-w-[200px] text-center">
                {data.dob_bs || "2064-08-10"} BS ({data.dob_ad || "2007-11-26"} AD)
              </span>
            </p>
          </div>

          {/* Symbol Number and Issue Date */}
          <div className="mt-10 px-6 space-y-3 text-base">
            <p>
              Symbol No.: <span className="font-bold text-lg text-center">{data.symbol_no || "02209717 C"}</span>
            </p>
            <p>
              Date of Issue: <span className="font-bold">{data.issued_date || format(new Date(), "dd-MMMM-yyyy")}</span>
            </p>
          </div>

          {/* Signature Section */}
          <div className="flex justify-between items-end mt-12 px-6">
            <div className="text-sm">
              <p className="font-bold">CHECKED BY:</p>
              <p>NEB, SANOTHIMI, BHAKTAPUR, NEPAL</p>
            </div>
            <div className="text-center">
              <img src={nandlalSignature} alt="Controller Signature" className="h-14 mx-auto object-contain" />
              <div className="border-t-2 border-black pt-1 px-4">
                <p className="italic text-sm">Nanda Lal Pandel</p>
                <p className="font-bold text-sm">CONTROLLER OF EXAMINATIONS</p>
              </div>
            </div>
          </div>

          {/* Page Number */}
          <div className="text-center text-xs mt-8 text-gray-500">
            Page 2300 OF 2451
          </div>
        </div>
      </div>;
});
SEECertificateTemplate.displayName = "SEECertificateTemplate";
export default SEECertificateTemplate;