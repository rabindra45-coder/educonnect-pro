import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Search, Edit, Trash2, DollarSign, Users, 
  Receipt, TrendingUp, AlertCircle, CheckCircle2 
} from "lucide-react";

const feeTypes = [
  { value: "admission", label: "Admission Fee" },
  { value: "tuition", label: "Tuition Fee" },
  { value: "exam", label: "Exam Fee" },
  { value: "library", label: "Library Fee" },
  { value: "sports", label: "Sports Fee" },
  { value: "computer", label: "Computer Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "uniform", label: "Uniform Fee" },
  { value: "other", label: "Other" },
];

const frequencies = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "one_time", label: "One Time" },
];

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

interface FeeStructure {
  id: string;
  class: string;
  fee_type: string;
  amount: number;
  frequency: string;
  academic_year: string;
  description: string | null;
  due_day: number;
  late_fee_percentage: number;
  is_active: boolean;
}

const FeeManagement = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    class: "10",
    fee_type: "tuition" as string,
    amount: 1000,
    frequency: "monthly",
    academic_year: "2081/82",
    description: "",
    due_day: 10,
    late_fee_percentage: 5,
  });

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fee_structures")
      .select("*")
      .order("class", { ascending: true })
      .order("fee_type", { ascending: true });

    if (error) {
      toast({ title: "Error fetching fee structures", variant: "destructive" });
    } else {
      setFeeStructures(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.class || !formData.fee_type || !formData.amount) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    const feeData = {
      class: formData.class,
      fee_type: formData.fee_type as any,
      amount: formData.amount,
      frequency: formData.frequency,
      academic_year: formData.academic_year,
      description: formData.description || null,
      due_day: formData.due_day,
      late_fee_percentage: formData.late_fee_percentage,
    };

    if (editingFee) {
      const { error } = await supabase
        .from("fee_structures")
        .update(feeData)
        .eq("id", editingFee.id);

      if (error) {
        toast({ title: "Error updating fee structure", variant: "destructive" });
      } else {
        toast({ title: "Fee structure updated" });
        fetchFeeStructures();
      }
    } else {
      const { error } = await supabase.from("fee_structures").insert([feeData]);

      if (error) {
        if (error.code === "23505") {
          toast({ title: "This fee structure already exists", variant: "destructive" });
        } else {
          toast({ title: "Error creating fee structure", variant: "destructive" });
        }
      } else {
        toast({ title: "Fee structure created" });
        fetchFeeStructures();
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      class: "10",
      fee_type: "tuition",
      amount: 1000,
      frequency: "monthly",
      academic_year: "2081/82",
      description: "",
      due_day: 10,
      late_fee_percentage: 5,
    });
    setEditingFee(null);
  };

  const handleEdit = (fee: FeeStructure) => {
    setEditingFee(fee);
    setFormData({
      class: fee.class,
      fee_type: fee.fee_type,
      amount: fee.amount,
      frequency: fee.frequency,
      academic_year: fee.academic_year,
      description: fee.description || "",
      due_day: fee.due_day,
      late_fee_percentage: fee.late_fee_percentage,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee structure?")) return;

    const { error } = await supabase.from("fee_structures").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting fee structure", variant: "destructive" });
    } else {
      toast({ title: "Fee structure deleted" });
      fetchFeeStructures();
    }
  };

  const toggleActive = async (fee: FeeStructure) => {
    const { error } = await supabase
      .from("fee_structures")
      .update({ is_active: !fee.is_active })
      .eq("id", fee.id);

    if (error) {
      toast({ title: "Error updating status", variant: "destructive" });
    } else {
      fetchFeeStructures();
    }
  };

  const filteredFees = feeStructures.filter((fee) => {
    const matchesSearch = fee.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feeTypes.find(t => t.value === fee.fee_type)?.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === "all" || fee.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const totalMonthlyRevenue = feeStructures
    .filter(f => f.is_active && f.frequency === "monthly")
    .reduce((sum, f) => sum + f.amount, 0);

  const getFeeTypeLabel = (type: string) => feeTypes.find(t => t.value === type)?.label || type;
  const getFrequencyLabel = (freq: string) => frequencies.find(f => f.value === freq)?.label || freq;

  return (
    <>
      <Helmet>
        <title>Fee Management | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Fee Management</h1>
              <p className="text-muted-foreground">Manage fee structures, payments, and receipts</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fee Structure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingFee ? "Edit Fee Structure" : "Add Fee Structure"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Class *</Label>
                      <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c} value={c}>Class {c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Fee Type *</Label>
                      <Select value={formData.fee_type} onValueChange={(v) => setFormData({ ...formData, fee_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {feeTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Amount (रू) *</Label>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Frequency</Label>
                      <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {frequencies.map((f) => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Academic Year</Label>
                      <Input
                        value={formData.academic_year}
                        onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                        placeholder="2081/82"
                      />
                    </div>
                    <div>
                      <Label>Due Day (of month)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="28"
                        value={formData.due_day}
                        onChange={(e) => setFormData({ ...formData, due_day: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Late Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.late_fee_percentage}
                      onChange={(e) => setFormData({ ...formData, late_fee_percentage: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingFee ? "Update Fee Structure" : "Add Fee Structure"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Fee Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feeStructures.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {feeStructures.filter(f => f.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Monthly Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">रू {totalMonthlyRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Classes Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(feeStructures.map(f => f.class)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search fee types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>Class {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Late Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : filteredFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No fee structures found. Create your first one!
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">Class {fee.class}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getFeeTypeLabel(fee.fee_type)}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">रू {fee.amount.toLocaleString()}</TableCell>
                        <TableCell>{getFrequencyLabel(fee.frequency)}</TableCell>
                        <TableCell>{fee.late_fee_percentage}%</TableCell>
                        <TableCell>
                          <Switch checked={fee.is_active} onCheckedChange={() => toggleActive(fee)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(fee)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(fee.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default FeeManagement;
