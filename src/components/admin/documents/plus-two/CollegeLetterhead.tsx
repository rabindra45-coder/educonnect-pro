import { COLLEGE_SEAL_URL } from "@/assets/college-seal";

interface SchoolSettings {
  school_name: string;
  school_address: string | null;
  established_year: number | null;
  logo_url: string | null;
  principal_name: string | null;
}

interface Props {
  schoolSettings: SchoolSettings;
  subtitle?: string;
}

const CollegeLetterhead = ({ schoolSettings, subtitle }: Props) => (
  <div className="relative pb-4 mb-6 border-b-4 border-double" style={{ borderColor: "#C9A227" }}>
    <div className="flex items-center gap-5">
      {schoolSettings.logo_url ? (
        <img src={schoolSettings.logo_url} alt="College Logo" className="w-20 h-20 object-contain" />
      ) : (
        <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-xs text-center" style={{ borderColor: "#0B1F3A", color: "#0B1F3A" }}>
          College<br/>Logo
        </div>
      )}
      <div className="flex-1 text-center">
        <h1 className="text-3xl font-bold tracking-wide" style={{ color: "#0B1F3A", fontFamily: "'DM Serif Display', 'Georgia', serif" }}>
          {schoolSettings.school_name || "Milestone International College"}
        </h1>
        <p className="text-sm" style={{ color: "#0B1F3A" }}>
          {schoolSettings.school_address || "Kathmandu, Nepal"}
          {schoolSettings.established_year ? ` · Estd. ${schoolSettings.established_year} B.S.` : ""}
        </p>
        <p className="text-xs font-medium" style={{ color: "#C9A227" }}>
          Affiliated to National Examination Board (NEB) · Higher Secondary Education (10+2)
        </p>
        {subtitle && (
          <p className="text-xs italic mt-1" style={{ color: "#0B1F3A" }}>{subtitle}</p>
        )}
      </div>
      <img src={COLLEGE_SEAL_URL} alt="College Seal" className="w-20 h-20 object-contain" />

    </div>
  </div>
);

export default CollegeLetterhead;
