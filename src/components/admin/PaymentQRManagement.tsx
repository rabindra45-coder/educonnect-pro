import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, QrCode, Upload, Loader2 } from "lucide-react";

interface PaymentQR {
  id: string;
  gateway: string;
  gateway_name: string;
  qr_image_url: string;
  account_name: string | null;
  account_number: string | null;
  instructions: string | null;
  is_active: boolean;
  display_order: number;
}

const gateways = [
  { value: "esewa", label: "eSewa", color: "bg-green-500" },
  { value: "khalti", label: "Khalti", color: "bg-purple-500" },
  { value: "imepay", label: "IME Pay", color: "bg-red-500" },
  { value: "bank_transfer", label: "Bank Transfer", color: "bg-blue-500" },
];

const PaymentQRManagement = () => {
  const [qrCodes, setQrCodes] = useState<PaymentQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQR, setEditingQR] = useState<PaymentQR | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    gateway: "esewa",
    gateway_name: "eSewa",
    qr_image_url: "",
    account_name: "",
    account_number: "",
    instructions: "",
    display_order: 0,
  });

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payment_qr_codes")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error) {
      setQrCodes(data || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `qr_${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .upload(`qr-codes/${fileName}`, file);

    if (error) {
      toast({ title: "Error uploading image", variant: "destructive" });
    } else {
      const { data: publicUrl } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(`qr-codes/${fileName}`);
      setFormData({ ...formData, qr_image_url: publicUrl.publicUrl });
      toast({ title: "Image uploaded successfully" });
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!formData.qr_image_url) {
      toast({ title: "Please upload a QR code image", variant: "destructive" });
      return;
    }

    const qrData = {
      gateway: formData.gateway,
      gateway_name: formData.gateway_name,
      qr_image_url: formData.qr_image_url,
      account_name: formData.account_name || null,
      account_number: formData.account_number || null,
      instructions: formData.instructions || null,
      display_order: formData.display_order,
    };

    if (editingQR) {
      const { error } = await supabase
        .from("payment_qr_codes")
        .update(qrData)
        .eq("id", editingQR.id);

      if (error) {
        toast({ title: "Error updating QR code", variant: "destructive" });
      } else {
        toast({ title: "QR code updated" });
        fetchQRCodes();
      }
    } else {
      const { error } = await supabase.from("payment_qr_codes").insert([qrData]);

      if (error) {
        toast({ title: "Error adding QR code", variant: "destructive" });
      } else {
        toast({ title: "QR code added" });
        fetchQRCodes();
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      gateway: "esewa",
      gateway_name: "eSewa",
      qr_image_url: "",
      account_name: "",
      account_number: "",
      instructions: "",
      display_order: 0,
    });
    setEditingQR(null);
  };

  const handleEdit = (qr: PaymentQR) => {
    setEditingQR(qr);
    setFormData({
      gateway: qr.gateway,
      gateway_name: qr.gateway_name,
      qr_image_url: qr.qr_image_url,
      account_name: qr.account_name || "",
      account_number: qr.account_number || "",
      instructions: qr.instructions || "",
      display_order: qr.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this QR code?")) return;

    const { error } = await supabase.from("payment_qr_codes").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting QR code", variant: "destructive" });
    } else {
      toast({ title: "QR code deleted" });
      fetchQRCodes();
    }
  };

  const toggleActive = async (qr: PaymentQR) => {
    const { error } = await supabase
      .from("payment_qr_codes")
      .update({ is_active: !qr.is_active })
      .eq("id", qr.id);

    if (!error) {
      fetchQRCodes();
    }
  };

  const getGatewayColor = (gateway: string) => {
    return gateways.find((g) => g.value === gateway)?.color || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Payment QR Codes</h2>
          <p className="text-sm text-muted-foreground">
            Upload QR codes for different payment methods
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add QR Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingQR ? "Edit QR Code" : "Add Payment QR Code"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Gateway *</Label>
                  <Select
                    value={formData.gateway}
                    onValueChange={(v) => {
                      const gateway = gateways.find((g) => g.value === v);
                      setFormData({
                        ...formData,
                        gateway: v,
                        gateway_name: gateway?.label || v,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gateways.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>QR Code Image *</Label>
                <div className="mt-2">
                  {formData.qr_image_url ? (
                    <div className="relative">
                      <img
                        src={formData.qr_image_url}
                        alt="QR Code"
                        className="w-full max-w-[200px] mx-auto rounded-lg border"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => setFormData({ ...formData, qr_image_url: "" })}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload QR code
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label>Account Name</Label>
                <Input
                  value={formData.account_name}
                  onChange={(e) =>
                    setFormData({ ...formData, account_name: e.target.value })
                  }
                  placeholder="e.g., School Finance Account"
                />
              </div>

              <div>
                <Label>Account Number / ID</Label>
                <Input
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                  placeholder="e.g., 9812345678"
                />
              </div>

              <div>
                <Label>Payment Instructions</Label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  placeholder="Enter any special instructions for students..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
                {editingQR ? "Update QR Code" : "Add QR Code"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : qrCodes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No payment QR codes added yet. Add your first one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qr) => (
            <Card key={qr.id} className={!qr.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getGatewayColor(qr.gateway)}`} />
                    <CardTitle className="text-base">{qr.gateway_name}</CardTitle>
                  </div>
                  <Badge variant={qr.is_active ? "default" : "secondary"}>
                    {qr.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={qr.qr_image_url}
                  alt={qr.gateway_name}
                  className="w-full max-w-[150px] mx-auto rounded-lg border"
                />
                {qr.account_name && (
                  <p className="text-sm text-center">
                    <span className="text-muted-foreground">Account:</span>{" "}
                    {qr.account_name}
                  </p>
                )}
                {qr.account_number && (
                  <p className="text-sm text-center font-mono">
                    {qr.account_number}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Switch
                    checked={qr.is_active}
                    onCheckedChange={() => toggleActive(qr)}
                  />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(qr)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(qr.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentQRManagement;
