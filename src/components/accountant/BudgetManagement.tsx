import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Plus, Loader2, Edit } from "lucide-react";

interface Budget {
  id: string;
  department: string;
  academic_year: string;
  allocated_amount: number;
  spent_amount: number;
  description: string | null;
}

const DEPARTMENTS = [
  "Administration",
  "Academic",
  "Library",
  "Sports",
  "IT",
  "Maintenance",
  "Transport",
  "Hostel",
  "Events",
  "Infrastructure",
];

const BudgetManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    department: "",
    allocated_amount: "",
    description: "",
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const currentYear = new Date().getFullYear().toString();
      
      const { data, error } = await supabase
        .from("budget_allocations")
        .select("*")
        .eq("academic_year", currentYear)
        .order("department");

      if (error) throw error;
      setBudgets(data || []);
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
      const currentYear = new Date().getFullYear().toString();
      const payload = {
        department: formData.department,
        academic_year: currentYear,
        allocated_amount: parseFloat(formData.allocated_amount),
        description: formData.description || null,
        created_by: user?.id,
      };

      if (editingBudget) {
        const { error } = await supabase
          .from("budget_allocations")
          .update({
            allocated_amount: payload.allocated_amount,
            description: payload.description,
          })
          .eq("id", editingBudget.id);

        if (error) throw error;
        toast({ title: "Success", description: "Budget updated successfully." });
      } else {
        const { error } = await supabase
          .from("budget_allocations")
          .insert([payload]);

        if (error) throw error;
        toast({ title: "Success", description: "Budget allocated successfully." });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchBudgets();
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

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      department: budget.department,
      allocated_amount: budget.allocated_amount.toString(),
      description: budget.description || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBudget(null);
    setFormData({
      department: "",
      allocated_amount: "",
      description: "",
    });
  };

  const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_amount), 0);

  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return "bg-emerald-500";
    if (percentage < 80) return "bg-amber-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <p className="text-blue-100 text-sm">Total Allocated</p>
            <p className="text-3xl font-bold mt-1">रू {totalAllocated.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <p className="text-red-100 text-sm">Total Spent</p>
            <p className="text-3xl font-bold mt-1">रू {totalSpent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <p className="text-emerald-100 text-sm">Remaining</p>
            <p className="text-3xl font-bold mt-1">रू {(totalAllocated - totalSpent).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Department Budgets
            </CardTitle>
            <CardDescription>Allocate and track budgets by department</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Allocate Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBudget ? "Edit Budget Allocation" : "Allocate New Budget"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                    disabled={!!editingBudget}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.filter(
                        (dept) => editingBudget || !budgets.find((b) => b.department === dept)
                      ).map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Allocated Amount (रू)</Label>
                  <Input
                    type="number"
                    value={formData.allocated_amount}
                    onChange={(e) => setFormData({ ...formData, allocated_amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingBudget ? "Update" : "Allocate"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No budgets allocated yet. Click "Allocate Budget" to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => {
                const percentage = budget.allocated_amount > 0 
                  ? (Number(budget.spent_amount) / Number(budget.allocated_amount)) * 100 
                  : 0;
                const remaining = Number(budget.allocated_amount) - Number(budget.spent_amount);

                return (
                  <Card key={budget.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{budget.department}</h4>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Allocated</span>
                          <span className="font-medium">रू {Number(budget.allocated_amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Spent</span>
                          <span className="font-medium text-red-600">रू {Number(budget.spent_amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className={`font-medium ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            रू {remaining.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="pt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Utilization</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={Math.min(percentage, 100)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetManagement;