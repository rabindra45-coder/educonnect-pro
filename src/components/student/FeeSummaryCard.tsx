import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, AlertTriangle, CheckCircle, ArrowRight, IndianRupee } from "lucide-react";
import { format, isPast } from "date-fns";

interface FeeSummaryCardProps {
  studentId: string;
  onViewAll?: () => void;
}

interface PendingFee {
  id: string;
  amount: number;
  due_date: string;
  month_year: string | null;
  balance: number;
  status: string;
  fee_type: string;
}

const FeeSummaryCard = ({ studentId, onViewAll }: FeeSummaryCardProps) => {
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingFees();
  }, [studentId]);

  const fetchPendingFees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_fees")
      .select(`
        id, amount, due_date, month_year, balance, status,
        fee_structures!inner(fee_type)
      `)
      .eq("student_id", studentId)
      .in("status", ["pending", "partial", "overdue"])
      .order("due_date", { ascending: true })
      .limit(5);

    if (!error && data) {
      const fees = data.map((f: any) => ({
        ...f,
        fee_type: f.fee_structures.fee_type,
      }));
      setPendingFees(fees);
      setTotalDue(fees.reduce((sum, f) => sum + Number(f.balance), 0));
      setOverdueCount(fees.filter((f) => f.status === "overdue").length);
    }
    setLoading(false);
  };

  const feeTypeLabels: Record<string, string> = {
    admission: "Admission",
    tuition: "Tuition",
    exam: "Exam",
    library: "Library",
    sports: "Sports",
    computer: "Computer",
    transport: "Transport",
    uniform: "Uniform",
    other: "Other",
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          Loading fees...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-600" />
            Fee Summary
          </CardTitle>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {overdueCount} Overdue
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {pendingFees.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-green-700">All Fees Paid!</p>
            <p className="text-sm text-muted-foreground">No pending dues</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Total Due */}
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div>
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-2xl font-bold text-orange-600 flex items-center">
                  रू {totalDue.toLocaleString()}
                </p>
              </div>
              <IndianRupee className="w-10 h-10 text-orange-400 opacity-50" />
            </div>

            {/* Pending Fees List */}
            <div className="space-y-2">
              {pendingFees.slice(0, 3).map((fee) => (
                <div
                  key={fee.id}
                  className={`flex items-center justify-between p-2 rounded-lg border ${
                    fee.status === "overdue"
                      ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
                      : "border-border"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {feeTypeLabels[fee.fee_type] || fee.fee_type}
                      {fee.month_year && (
                        <span className="text-muted-foreground ml-1">
                          ({fee.month_year.trim()})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(new Date(fee.due_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        fee.status === "overdue" ? "text-red-600" : "text-orange-600"
                      }`}
                    >
                      रू {Number(fee.balance).toLocaleString()}
                    </p>
                    {fee.status === "overdue" && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            {onViewAll && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={onViewAll}
              >
                View All Fees & Pay Online
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeSummaryCard;
