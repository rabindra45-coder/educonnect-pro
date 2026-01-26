import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Loader2, FileText } from "lucide-react";

interface FeeStructure {
  id: string;
  class: string;
  fee_type: string;
  amount: number;
  frequency: string;
  academic_year: string;
  description: string | null;
  due_day: number | null;
  late_fee_percentage: number | null;
  is_active: boolean;
}

const FEE_TYPES = [
  { value: "tuition", label: "Tuition Fee" },
  { value: "admission", label: "Admission Fee" },
  { value: "exam", label: "Exam Fee" },
  { value: "library", label: "Library Fee" },
  { value: "sports", label: "Sports Fee" },
  { value: "computer", label: "Computer Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "uniform", label: "Uniform Fee" },
  { value: "other", label: "Other" },
];

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const FeeStructureManagement = () => {
  const { toast } = useToast();
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    class: "",
    fee_type: "",
    amount: "",
    frequency: "monthly",
    academic_year: new Date().getFullYear().toString(),
    description: "",
    due_day: "10",
    late_fee_percentage: "5",
    is_active: true,
  });

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const { data, error } = await supabase
        .from("fee_structures")
        .select("*")
        .order("class")
        .order("fee_type");

      if (error) throw error;
      setStructures(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        class: formData.class,
        fee_type: formData.fee_type as "admission" | "computer" | "exam" | "library" | "other" | "sports" | "transport" | "tuition" | "uniform",
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        academic_year: formData.academic_year,
        description: formData.description || null,
        due_day: parseInt(formData.due_day),
        late_fee_percentage: parseFloat(formData.late_fee_percentage),
        is_active: formData.is_active,
      };

      if (editingStructure) {
        const { error } = await supabase
          .from("fee_structures")
          .update(payload)
          .eq("id", editingStructure.id);

        if (error) throw error;
        toast({ title: "Success", description: "Fee structure updated successfully." });
      } else {
        const { error } = await supabase
          .from("fee_structures")
          .insert([payload]);

        if (error) throw error;
        toast({ title: "Success", description: "Fee structure created successfully." });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchFeeStructures();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (structure: FeeStructure) => {
    setEditingStructure(structure);
    setFormData({
      class: structure.class,
      fee_type: structure.fee_type,
      amount: structure.amount.toString(),
      frequency: structure.frequency,
      academic_year: structure.academic_year,
      description: structure.description || "",
      due_day: (structure.due_day || 10).toString(),
      late_fee_percentage: (structure.late_fee_percentage || 5).toString(),
      is_active: structure.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee structure?")) return;

    try {
      const { error } = await supabase
        .from("fee_structures")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Fee structure deleted successfully." });
      fetchFeeStructures();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingStructure(null);
    setFormData({
      class: "",
      fee_type: "",
      amount: "",
      frequency: "monthly",
      academic_year: new Date().getFullYear().toString(),
      description: "",
      due_day: "10",
      late_fee_percentage: "5",
      is_active: true,
    });
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("fee_structures")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      fetchFeeStructures();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Fee Structure Management
          </CardTitle>
          <CardDescription>Manage class-wise fee structures and rates</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingStructure ? "Edit Fee Structure" : "Create Fee Structure"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) => setFormData({ ...formData, class: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((cls) => (
                        <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fee Type</Label>
                  <Select
                    value={formData.fee_type}
                    onValueChange={(value) => setFormData({ ...formData, fee_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FEE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (रू)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one_time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Day</Label>
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={formData.due_day}
                    onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Late Fee %</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.late_fee_percentage}
                    onChange={(e) => setFormData({ ...formData, late_fee_percentage: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingStructure ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Due Day</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {structures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No fee structures found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                structures.map((structure) => (
                  <TableRow key={structure.id}>
                    <TableCell className="font-medium">Class {structure.class}</TableCell>
                    <TableCell className="capitalize">{structure.fee_type.replace("_", " ")}</TableCell>
                    <TableCell>रू {structure.amount.toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{structure.frequency}</TableCell>
                    <TableCell>{structure.due_day || 10}</TableCell>
                    <TableCell>
                      <Switch
                        checked={structure.is_active}
                        onCheckedChange={() => toggleActive(structure.id, structure.is_active)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(structure)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(structure.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeStructureManagement;