import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Download, Eye, Calendar, Award, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { toPng } from "html-to-image";
import { useToast } from "@/hooks/use-toast";

interface StudentDocument {
  id: string;
  document_type: string;
  title: string;
  serial_number: string | null;
  document_data: Record<string, unknown>;
  document_image_url: string | null;
  issued_date: string | null;
  issued_by: string | null;
}

interface StudentDocumentsCardProps {
  documents: StudentDocument[];
  loading?: boolean;
}

const DOCUMENT_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  character_certificate: Award,
  grade_sheet: FileText,
  see_certificate: GraduationCap,
  default: FileText,
};

const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  character_certificate: "bg-green-100 text-green-800 border-green-200",
  grade_sheet: "bg-blue-100 text-blue-800 border-blue-200",
  see_certificate: "bg-purple-100 text-purple-800 border-purple-200",
  admission_letter: "bg-orange-100 text-orange-800 border-orange-200",
  bonafide_certificate: "bg-teal-100 text-teal-800 border-teal-200",
  other: "bg-gray-100 text-gray-800 border-gray-200",
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  character_certificate: "Character & Transfer Certificate",
  grade_sheet: "Grade Sheet",
  see_certificate: "SEE Certificate",
  admission_letter: "Admission Letter",
  bonafide_certificate: "Bonafide Certificate",
  other: "Document",
};

const StudentDocumentsCard = ({ documents, loading }: StudentDocumentsCardProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<StudentDocument | null>(null);
  const [downloading, setDownloading] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const handlePreview = (doc: StudentDocument) => {
    setSelectedDocument(doc);
    setPreviewOpen(true);
  };

  const handleDownload = async (doc: StudentDocument) => {
    if (!doc.document_image_url) return;

    setDownloading(true);
    try {
      // Create a temporary image element for high-quality download
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = doc.document_image_url;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create canvas to get the image
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      // Download as PNG
      const link = document.createElement("a");
      link.download = `${doc.title.replace(/\s+/g, "_")}_${doc.serial_number || "document"}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      console.error("Download error:", error);
      // Fallback to direct download
      const link = document.createElement("a");
      link.href = doc.document_image_url;
      link.download = `${doc.title}.png`;
      link.target = "_blank";
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    const Icon = DOCUMENT_TYPE_ICONS[type] || DOCUMENT_TYPE_ICONS.default;
    return <Icon className="w-5 h-5" />;
  };

  const getDocumentColor = (type: string) => {
    return DOCUMENT_TYPE_COLORS[type] || DOCUMENT_TYPE_COLORS.other;
  };

  const getDocumentLabel = (type: string) => {
    return DOCUMENT_TYPE_LABELS[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading documents...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No documents available yet.</p>
            <p className="text-sm">Your certificates and documents will appear here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getDocumentColor(doc.document_type)}`}>
                    {getDocumentIcon(doc.document_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">{doc.title}</h3>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {getDocumentLabel(doc.document_type)}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {doc.serial_number && (
                    <p className="flex items-center gap-1">
                      <span className="font-medium">S.No:</span> {doc.serial_number}
                    </p>
                  )}
                  {doc.issued_date && (
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(doc.issued_date), "dd MMM yyyy")}
                    </p>
                  )}
                </div>

                {/* Document Preview Thumbnail */}
                {doc.document_image_url && (
                  <div className="mt-3 relative group">
                    <img
                      src={doc.document_image_url}
                      alt={doc.title}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handlePreview(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(doc)}
                        disabled={downloading}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePreview(doc)}
                    disabled={!doc.document_image_url}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(doc)}
                    disabled={!doc.document_image_url || downloading}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getDocumentIcon(selectedDocument.document_type)}
              {selectedDocument?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument?.document_image_url && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <img
                  ref={imageRef}
                  src={selectedDocument.document_image_url}
                  alt={selectedDocument.title}
                  className="w-full h-auto"
                  crossOrigin="anonymous"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {selectedDocument.serial_number && (
                    <span className="mr-4">Serial No: {selectedDocument.serial_number}</span>
                  )}
                  {selectedDocument.issued_date && (
                    <span>
                      Issued: {format(new Date(selectedDocument.issued_date), "dd MMMM yyyy")}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => handleDownload(selectedDocument)}
                  disabled={downloading}
                  className="w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? "Downloading..." : "Download Document"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentDocumentsCard;
