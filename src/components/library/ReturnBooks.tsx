import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Search, Loader2, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface IssuedBook {
  id: string;
  issue_date: string;
  due_date: string;
  status: string;
  book: { id: string; title: string; author: string };
  student: { id: string; full_name: string; registration_number: string; class: string };
}

interface ReturnBooksProps {
  onReturn: () => void;
}

const ReturnBooks = ({ onReturn }: ReturnBooksProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [returningId, setReturningId] = useState<string | null>(null);

  useEffect(() => {
    fetchIssuedBooks();
  }, []);

  const fetchIssuedBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("book_issues")
        .select(`
          id,
          issue_date,
          due_date,
          status,
          book:book_id (id, title, author),
          student:student_id (id, full_name, registration_number, class)
        `)
        .eq("status", "issued")
        .order("due_date");

      if (error) throw error;
      setIssuedBooks(data as any || []);
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

  const handleReturn = async (issueId: string) => {
    setReturningId(issueId);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const { error } = await supabase
        .from("book_issues")
        .update({
          status: "returned",
          return_date: today,
          returned_to: user?.id,
        })
        .eq("id", issueId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Book returned successfully! Fine calculated if applicable.",
      });

      fetchIssuedBooks();
      onReturn();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setReturningId(null);
    }
  };

  const getOverdueDays = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const days = differenceInDays(today, due);
    return days > 0 ? days : 0;
  };

  const filteredBooks = issuedBooks.filter((issue) =>
    issue.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.student?.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.book?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          Return Books
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by student name, registration number, or book title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No books currently issued.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((issue) => {
                  const overdueDays = getOverdueDays(issue.due_date);
                  const isOverdue = overdueDays > 0;

                  return (
                    <TableRow key={issue.id} className={isOverdue ? "bg-destructive/5" : ""}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{issue.student?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {issue.student?.registration_number} | Class {issue.student?.class}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{issue.book?.title}</p>
                          <p className="text-xs text-muted-foreground">{issue.book?.author}</p>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(issue.issue_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(new Date(issue.due_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={isOverdue ? "destructive" : "default"}>
                          {isOverdue ? "Overdue" : "On Time"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isOverdue ? (
                          <div className="flex items-center gap-1 text-destructive">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">{overdueDays} days</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleReturn(issue.id)}
                          disabled={returningId === issue.id}
                        >
                          {returningId === issue.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Return
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ReturnBooks;
