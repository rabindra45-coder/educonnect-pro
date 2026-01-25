import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toPng } from "html-to-image";
import { Download, Eye, FileText, Save } from "lucide-react";
import { format } from "date-fns";
import CharacterCertificateTemplate from "./CharacterCertificateTemplate";
import GradeSheetTemplate, { DEFAULT_SUBJECTS } from "./GradeSheetTemplate";

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

interface DocumentTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  onDocumentCreated: () => void;
}

const DocumentTemplateDialog = ({
  open,
  onOpenChange,
  students,
  onDocumentCreated,
}: DocumentTemplateDialogProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [templateType, setTemplateType] = useState<"character" | "gradesheet">("character");
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Character Certificate Data
  const [characterData, setCharacterData] = useState({
    serial_number: "",
    exam_year: "",
    gpa: "",
    grade: "",
    see_reg_no: "",
    symbol_no: "",
    issued_date: format(new Date(), "yyyy-MM-dd"),
    father_name: "",
    mother_name: "",
    ward_no: "",
    district: "",
    municipality: "",
  });

  // Grade Sheet Data
  const [gradeSheetData, setGradeSheetData] = useState({
    sr_no: "",
    symbol_no: "",
    roll: "",
    exam_year_bs: "",
    exam_year_ad: "",
    issued_date: format(new Date(), "dd-MMMM-yyyy"),
    subjects: [...DEFAULT_SUBJECTS],
    total_credit: 32,
    gpa: "",
  });

  useEffect(() => {
    fetchSchoolSettings();
  }, []);

  const fetchSchoolSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("school_settings")
        .select("school_name, school_address, established_year, logo_url, principal_name")
        .single();

      if (error) throw error;
      setSchoolSettings(data);
    } catch (error) {
      console.error("Error fetching school settings:", error);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    setSelectedStudent(student || null);

    // Auto-fill character data from student
    if (student) {
      setCharacterData((prev) => ({
        ...prev,
        father_name: student.guardian_name || "",
      }));
      setGradeSheetData((prev) => ({
        ...prev,
        roll: student.section || "",
      }));
    }
  };

  const handleSubjectChange = (index: number, field: keyof typeof DEFAULT_SUBJECTS[0], value: string | number) => {
    setGradeSheetData((prev) => {
      const newSubjects = [...prev.subjects];
      newSubjects[index] = { ...newSubjects[index], [field]: value };
      return { ...prev, subjects: newSubjects };
    });
  };

  const calculateGPA = () => {
    const subjects = gradeSheetData.subjects;
    let totalGradePoints = 0;
    let totalCredits = 0;

    subjects.forEach((subject) => {
      if (subject.grade_point > 0) {
        totalGradePoints += subject.grade_point * subject.credit_hour;
        totalCredits += subject.credit_hour;
      }
    });

    const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "0.00";
    setGradeSheetData((prev) => ({ ...prev, gpa }));
  };

  const handleSaveDocument = async () => {
    if (!selectedStudent || !templateRef.current) return;

    setSaving(true);
    try {
      // Generate image from template
      const dataUrl = await toPng(templateRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Convert to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Upload to storage
      const fileName = `documents/${Date.now()}-${selectedStudent.registration_number}-${templateType}.png`;
      const { error: uploadError } = await supabase.storage
        .from("content-images")
        .upload(fileName, blob, { contentType: "image/png" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("content-images")
        .getPublicUrl(fileName);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Save document record
      const { error } = await supabase
        .from("student_documents")
        .insert([{
          student_id: selectedStudent.id,
          document_type: templateType === "character" ? "character_certificate" : "grade_sheet",
          title: templateType === "character" 
            ? "Character & Transfer Certificate" 
            : "SEE Grade Sheet",
          serial_number: templateType === "character" ? characterData.serial_number : gradeSheetData.sr_no,
          issued_date: templateType === "character" ? characterData.issued_date : gradeSheetData.issued_date,
          document_data: JSON.parse(JSON.stringify(templateType === "character" ? characterData : gradeSheetData)),
          document_image_url: publicUrl,
          created_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document created and saved successfully!",
      });

      onDocumentCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save document. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPreview = async () => {
    if (!templateRef.current || !selectedStudent) return;

    try {
      const dataUrl = await toPng(templateRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `${selectedStudent.full_name.replace(/\s+/g, "_")}_${templateType}_preview.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Downloaded",
        description: "Preview downloaded successfully!",
      });
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setCharacterData({
      serial_number: "",
      exam_year: "",
      gpa: "",
      grade: "",
      see_reg_no: "",
      symbol_no: "",
      issued_date: format(new Date(), "yyyy-MM-dd"),
      father_name: "",
      mother_name: "",
      ward_no: "",
      district: "",
      municipality: "",
    });
    setGradeSheetData({
      sr_no: "",
      symbol_no: "",
      roll: "",
      exam_year_bs: "",
      exam_year_ad: "",
      issued_date: format(new Date(), "dd-MMMM-yyyy"),
      subjects: [...DEFAULT_SUBJECTS],
      total_credit: 32,
      gpa: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Document from Template
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[80vh]">
          {/* Form Section */}
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {/* Student Selection */}
              <div className="space-y-2">
                <Label>Select Student *</Label>
                <Select
                  value={selectedStudent?.id || ""}
                  onValueChange={handleStudentSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} ({student.registration_number}) - Class {student.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Type Selection */}
              <Tabs value={templateType} onValueChange={(v) => setTemplateType(v as "character" | "gradesheet")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="character">Character Certificate</TabsTrigger>
                  <TabsTrigger value="gradesheet">Grade Sheet</TabsTrigger>
                </TabsList>

                {/* Character Certificate Form */}
                <TabsContent value="character" className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Serial Number</Label>
                      <Input
                        value={characterData.serial_number}
                        onChange={(e) => setCharacterData({ ...characterData, serial_number: e.target.value })}
                        placeholder="e.g., 334"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Exam Year (B.S.)</Label>
                      <Input
                        value={characterData.exam_year}
                        onChange={(e) => setCharacterData({ ...characterData, exam_year: e.target.value })}
                        placeholder="e.g., 2080"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">GPA</Label>
                      <Input
                        value={characterData.gpa}
                        onChange={(e) => setCharacterData({ ...characterData, gpa: e.target.value })}
                        placeholder="e.g., 2.94"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Grade</Label>
                      <Input
                        value={characterData.grade}
                        onChange={(e) => setCharacterData({ ...characterData, grade: e.target.value })}
                        placeholder="e.g., B+"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Father's Name</Label>
                      <Input
                        value={characterData.father_name}
                        onChange={(e) => setCharacterData({ ...characterData, father_name: e.target.value })}
                        placeholder="Father's name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Mother's Name</Label>
                      <Input
                        value={characterData.mother_name}
                        onChange={(e) => setCharacterData({ ...characterData, mother_name: e.target.value })}
                        placeholder="Mother's name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Municipality</Label>
                      <Input
                        value={characterData.municipality}
                        onChange={(e) => setCharacterData({ ...characterData, municipality: e.target.value })}
                        placeholder="e.g., Barahathawa"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Ward No.</Label>
                      <Input
                        value={characterData.ward_no}
                        onChange={(e) => setCharacterData({ ...characterData, ward_no: e.target.value })}
                        placeholder="e.g., 7"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">District</Label>
                      <Input
                        value={characterData.district}
                        onChange={(e) => setCharacterData({ ...characterData, district: e.target.value })}
                        placeholder="e.g., Sarlahi"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">SEE Regd. No.</Label>
                      <Input
                        value={characterData.see_reg_no}
                        onChange={(e) => setCharacterData({ ...characterData, see_reg_no: e.target.value })}
                        placeholder="Registration number"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Symbol No.</Label>
                      <Input
                        value={characterData.symbol_no}
                        onChange={(e) => setCharacterData({ ...characterData, symbol_no: e.target.value })}
                        placeholder="Symbol number"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Date of Issue</Label>
                      <Input
                        type="date"
                        value={characterData.issued_date}
                        onChange={(e) => setCharacterData({ ...characterData, issued_date: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Grade Sheet Form */}
                <TabsContent value="gradesheet" className="space-y-3 mt-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">SR No.</Label>
                      <Input
                        value={gradeSheetData.sr_no}
                        onChange={(e) => setGradeSheetData({ ...gradeSheetData, sr_no: e.target.value })}
                        placeholder="e.g., 8022214XXXXX"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Symbol No.</Label>
                      <Input
                        value={gradeSheetData.symbol_no}
                        onChange={(e) => setGradeSheetData({ ...gradeSheetData, symbol_no: e.target.value })}
                        placeholder="e.g., 02209717 C"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Roll</Label>
                      <Input
                        value={gradeSheetData.roll}
                        onChange={(e) => setGradeSheetData({ ...gradeSheetData, roll: e.target.value })}
                        placeholder="e.g., SARLAHI"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Exam Year (B.S.)</Label>
                      <Input
                        value={gradeSheetData.exam_year_bs}
                        onChange={(e) => setGradeSheetData({ ...gradeSheetData, exam_year_bs: e.target.value })}
                        placeholder="e.g., 2080"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Exam Year (A.D.)</Label>
                      <Input
                        value={gradeSheetData.exam_year_ad}
                        onChange={(e) => setGradeSheetData({ ...gradeSheetData, exam_year_ad: e.target.value })}
                        placeholder="e.g., 2024"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Date of Issue</Label>
                      <Input
                        value={gradeSheetData.issued_date}
                        onChange={(e) => setGradeSheetData({ ...gradeSheetData, issued_date: e.target.value })}
                        placeholder="e.g., 28-June-2024"
                      />
                    </div>
                  </div>

                  {/* Subject Marks Table */}
                  <div className="mt-4">
                    <Label className="text-sm font-semibold">Subject Marks (Fill only marks)</Label>
                    <div className="mt-2 max-h-[300px] overflow-y-auto border rounded-lg">
                      <table className="w-full text-xs">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="p-2 text-left">Subject</th>
                            <th className="p-2 w-16">Grade</th>
                            <th className="p-2 w-20">Grade Pt</th>
                            <th className="p-2 w-16">Final</th>
                            <th className="p-2 w-16">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradeSheetData.subjects.map((subject, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-1 text-xs">{subject.subject}</td>
                              <td className="p-1">
                                <Input
                                  className="h-7 text-xs"
                                  value={subject.grade}
                                  onChange={(e) => handleSubjectChange(index, "grade", e.target.value)}
                                  placeholder="B+"
                                />
                              </td>
                              <td className="p-1">
                                <Input
                                  type="number"
                                  step="0.1"
                                  className="h-7 text-xs"
                                  value={subject.grade_point || ""}
                                  onChange={(e) => handleSubjectChange(index, "grade_point", parseFloat(e.target.value) || 0)}
                                  placeholder="2.8"
                                />
                              </td>
                              <td className="p-1">
                                <Input
                                  className="h-7 text-xs"
                                  value={subject.final_grade}
                                  onChange={(e) => handleSubjectChange(index, "final_grade", e.target.value)}
                                  placeholder="B"
                                />
                              </td>
                              <td className="p-1">
                                <Input
                                  className="h-7 text-xs"
                                  value={subject.remarks}
                                  onChange={(e) => handleSubjectChange(index, "remarks", e.target.value)}
                                  placeholder=""
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <Button type="button" variant="outline" size="sm" onClick={calculateGPA}>
                        Calculate GPA
                      </Button>
                      <span className="text-sm font-semibold">
                        GPA: {gradeSheetData.gpa || "0.00"}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleDownloadPreview}
                  disabled={!selectedStudent}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Preview
                </Button>
                <Button
                  onClick={handleSaveDocument}
                  disabled={!selectedStudent || saving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Document"}
                </Button>
              </div>
            </div>
          </ScrollArea>

          {/* Preview Section */}
          <div className="border rounded-lg bg-muted/50 overflow-hidden">
            <div className="p-2 bg-muted border-b flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Live Preview</span>
            </div>
            <ScrollArea className="h-[calc(100%-40px)]">
              <div className="p-4 flex justify-center">
                <div className="transform scale-[0.6] origin-top">
                  {selectedStudent && schoolSettings ? (
                    templateType === "character" ? (
                      <CharacterCertificateTemplate
                        ref={templateRef}
                        student={selectedStudent}
                        schoolSettings={schoolSettings}
                        data={characterData}
                      />
                    ) : (
                      <GradeSheetTemplate
                        ref={templateRef}
                        student={selectedStudent}
                        schoolSettings={schoolSettings}
                        data={gradeSheetData}
                      />
                    )
                  ) : (
                    <div className="w-[800px] h-[1000px] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground bg-white">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>Select a student to see the preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentTemplateDialog;
