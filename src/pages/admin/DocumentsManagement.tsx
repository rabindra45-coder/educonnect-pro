import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Trash2, Eye, FileText, Upload, Download, Search } from "lucide-react";
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

interface StudentDocument {
  id: string;
  student_id: string;
  document_type: string;
  title: string;
  serial_number: string | null;
  document_data: unknown;
  document_image_url: string | null;
  issued_date: string | null;
  issued_by: string | null;
  is_active: boolean;
  created_at: string;
  students?: Student;
}

const DOCUMENT_TYPES = [
  { value: "character_certificate", label: "Character & Transfer Certificate" },
  { value: "grade_sheet", label: "Grade Sheet" },
  { value: "see_certificate", label: "SEE Certificate" },
  { value: "admission_letter", label: "Admission Letter" },
  { value: "bonafide_certificate", label: "Bonafide Certificate" },
  { value: "other", label: "Other Document" },
];

const DocumentsManagement = () => {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<StudentDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    student_id: "",
    document_type: "",
    title: "",
    serial_number: "",
    issued_date: format(new Date(), "yyyy-MM-dd"),
    issued_by: "",
    document_data: {
      exam_year: "",
      gpa: "",
      grade: "",
      remarks: "",
    },
  });
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
    fetchStudents();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("student_documents")
        .select(`
          *,
          students (
            id,
            registration_number,
            full_name,
            class,
            section,
            photo_url,
            guardian_name,
            date_of_birth,
            address
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: unknown) {
      console.error("Error fetching documents:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch documents",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, registration_number, full_name, class, section, photo_url, guardian_name, date_of_birth, address")
        .eq("status", "active")
        .order("full_name");

      if (error) throw error;
      setStudents(data || []);
    } catch (error: unknown) {
      console.error("Error fetching students:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `documents/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("content-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("content-images")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = null;

      if (documentImage) {
        imageUrl = await uploadImage(documentImage);
        if (!imageUrl) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to upload document image",
          });
          setUploading(false);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();

      const documentPayload = {
        student_id: formData.student_id,
        document_type: formData.document_type,
        title: formData.title,
        serial_number: formData.serial_number || null,
        issued_date: formData.issued_date || null,
        issued_by: formData.issued_by || null,
        document_data: formData.document_data,
        document_image_url: imageUrl,
        created_by: user?.id,
      };

      const { error } = await supabase
        .from("student_documents")
        .insert(documentPayload);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document created successfully",
      });

      setDialogOpen(false);
      resetForm();
      fetchDocuments();
    } catch (error: unknown) {
      console.error("Error creating document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create document",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const { error } = await supabase
        .from("student_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      fetchDocuments();
    } catch (error: unknown) {
      console.error("Error deleting document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      document_type: "",
      title: "",
      serial_number: "",
      issued_date: format(new Date(), "yyyy-MM-dd"),
      issued_by: "",
      document_data: {
        exam_year: "",
        gpa: "",
        grade: "",
        remarks: "",
      },
    });
    setDocumentImage(null);
    setImagePreview(null);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.students?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.students?.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Documents Management</h1>
            <p className="text-muted-foreground">
              Create and manage student documents like certificates, grade sheets, etc.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student">Select Student *</Label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, student_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
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

                  <div className="space-y-2">
                    <Label htmlFor="document_type">Document Type *</Label>
                    <Select
                      value={formData.document_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, document_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Document Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Character & Transfer Certificate"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serial_number">Serial Number</Label>
                    <Input
                      id="serial_number"
                      value={formData.serial_number}
                      onChange={(e) =>
                        setFormData({ ...formData, serial_number: e.target.value })
                      }
                      placeholder="e.g., 334"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issued_date">Date of Issue</Label>
                    <Input
                      id="issued_date"
                      type="date"
                      value={formData.issued_date}
                      onChange={(e) =>
                        setFormData({ ...formData, issued_date: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="issued_by">Issued By</Label>
                    <Input
                      id="issued_by"
                      value={formData.issued_by}
                      onChange={(e) =>
                        setFormData({ ...formData, issued_by: e.target.value })
                      }
                      placeholder="e.g., Principal / Headmaster"
                    />
                  </div>

                  {(formData.document_type === "grade_sheet" ||
                    formData.document_type === "see_certificate") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="exam_year">Exam Year (B.S.)</Label>
                        <Input
                          id="exam_year"
                          value={formData.document_data.exam_year}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              document_data: {
                                ...formData.document_data,
                                exam_year: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., 2080"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gpa">GPA</Label>
                        <Input
                          id="gpa"
                          value={formData.document_data.gpa}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              document_data: {
                                ...formData.document_data,
                                gpa: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., 2.94"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grade">Grade</Label>
                        <Input
                          id="grade"
                          value={formData.document_data.grade}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              document_data: {
                                ...formData.document_data,
                                grade: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., B+"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={formData.document_data.remarks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          document_data: {
                            ...formData.document_data,
                            remarks: e.target.value,
                          },
                        })
                      }
                      placeholder="Any additional remarks..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Upload Document Image (Scanned Copy)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDocumentImage(null);
                              setImagePreview(null);
                            }}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Creating..." : "Create Document"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by student name, registration number, or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Student Documents ({filteredDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading documents...</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents found. Create your first document!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{doc.students?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.students?.registration_number}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getDocumentTypeLabel(doc.document_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.title}</TableCell>
                        <TableCell>{doc.serial_number || "-"}</TableCell>
                        <TableCell>
                          {doc.issued_date
                            ? format(new Date(doc.issued_date), "dd MMM yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={doc.is_active ? "default" : "secondary"}>
                            {doc.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {doc.document_image_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setPreviewOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDocument?.title}</DialogTitle>
            </DialogHeader>
            {selectedDocument?.document_image_url && (
              <div className="space-y-4">
                <img
                  src={selectedDocument.document_image_url}
                  alt={selectedDocument.title}
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = selectedDocument.document_image_url!;
                      link.download = `${selectedDocument.title}.png`;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Document
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default DocumentsManagement;
