import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Book, BookOpen, Receipt, Loader2, Download, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toPng } from "html-to-image";
import schoolLogo from "@/assets/logo.png";

interface IssuedBook {
  id: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  book: { title: string; author: string };
}

interface LibraryFine {
  id: string;
  fine_amount: number;
  fine_reason: string;
  days_overdue: number;
  status: string;
  paid_amount: number;
  created_at: string;
  book_issue: {
    book: { title: string; author: string };
  };
}

interface StudentLibraryCardProps {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  studentClass: string;
}

const StudentLibraryCard = ({
  studentId,
  studentName,
  registrationNumber,
  studentClass,
}: StudentLibraryCardProps) => {
  const { toast } = useToast();
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [history, setHistory] = useState<IssuedBook[]>([]);
  const [fines, setFines] = useState<LibraryFine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFine, setSelectedFine] = useState<LibraryFine | null>(null);
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const billRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLibraryData();
  }, [studentId]);

  const fetchLibraryData = async () => {
    try {
      // Fetch currently issued books
      const { data: issuedData } = await supabase
        .from("book_issues")
        .select(`
          id,
          issue_date,
          due_date,
          return_date,
          status,
          book:book_id (title, author)
        `)
        .eq("student_id", studentId)
        .eq("status", "issued")
        .order("due_date");

      setIssuedBooks(issuedData as any || []);

      // Fetch history
      const { data: historyData } = await supabase
        .from("book_issues")
        .select(`
          id,
          issue_date,
          due_date,
          return_date,
          status,
          book:book_id (title, author)
        `)
        .eq("student_id", studentId)
        .eq("status", "returned")
        .order("return_date", { ascending: false })
        .limit(10);

      setHistory(historyData as any || []);

      // Fetch pending fines
      const { data: finesData } = await supabase
        .from("library_fines")
        .select(`
          id,
          fine_amount,
          fine_reason,
          days_overdue,
          status,
          paid_amount,
          created_at,
          book_issue:book_issue_id (
            book:book_id (title, author)
          )
        `)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      setFines(finesData as any || []);
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

  const downloadBill = async () => {
    if (!billRef.current) return;

    try {
      const dataUrl = await toPng(billRef.current, { quality: 1.0, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `library-fine-${registrationNumber}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download bill.",
        variant: "destructive",
      });
    }
  };

  const pendingFines = fines.filter((f) => f.status === "pending");
  const totalPendingAmount = pendingFines.reduce(
    (sum, f) => sum + (f.fine_amount - f.paid_amount),
    0
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="w-5 h-5" />
          Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Pending Fines Alert */}
        {totalPendingAmount > 0 && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">
                You have pending library fines of रू {totalPendingAmount}
              </p>
              <p className="text-sm text-muted-foreground">
                Please clear your dues at the library counter.
              </p>
            </div>
          </div>
        )}

        <Tabs defaultValue="current">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Current ({issuedBooks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="fines" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Fines ({pendingFines.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Current Books */}
          <TabsContent value="current" className="mt-4">
            {issuedBooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Book className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No books currently borrowed.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuedBooks.map((issue) => {
                    const isOverdue = differenceInDays(new Date(), new Date(issue.due_date)) > 0;
                    return (
                      <TableRow key={issue.id}>
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="mt-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Book className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No borrowing history.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Return Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{issue.book?.title}</p>
                          <p className="text-xs text-muted-foreground">{issue.book?.author}</p>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(issue.issue_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {issue.return_date
                          ? format(new Date(issue.return_date), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Fines */}
          <TabsContent value="fines" className="mt-4">
            {fines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No library fines.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fines.map((fine) => (
                    <TableRow key={fine.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{fine.book_issue?.book.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {fine.book_issue?.book.author}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {fine.fine_reason} ({fine.days_overdue} days)
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">रू {fine.fine_amount}</p>
                          {fine.paid_amount > 0 && (
                            <p className="text-xs text-green-600">
                              Paid: रू {fine.paid_amount}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            fine.status === "paid"
                              ? "default"
                              : fine.status === "waived"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {fine.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {fine.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedFine(fine);
                              setIsBillDialogOpen(true);
                            }}
                          >
                            <Receipt className="w-4 h-4 mr-1" />
                            Bill
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>

        {/* Fine Bill Dialog */}
        <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Library Fine Bill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div ref={billRef} className="bg-white p-6 border rounded-lg">
                <div className="text-center border-b pb-4 mb-4">
                  <img src={schoolLogo} alt="Logo" className="w-16 h-16 mx-auto mb-2" />
                  <h2 className="font-bold text-lg">Shree Durga Saraswati Janata Secondary School</h2>
                  <p className="text-sm text-gray-600">Library Department</p>
                  <p className="text-xs text-gray-500">Fine Receipt</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Student Name:</p>
                    <p className="font-medium">{studentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Registration No:</p>
                    <p className="font-medium">{registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Class:</p>
                    <p className="font-medium">{studentClass}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date:</p>
                    <p className="font-medium">{format(new Date(), "MMM d, yyyy")}</p>
                  </div>
                </div>

                <table className="w-full text-sm border-collapse mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">
                        <p className="font-medium">{selectedFine?.book_issue?.book.title}</p>
                        <p className="text-xs text-gray-500">
                          {selectedFine?.fine_reason} ({selectedFine?.days_overdue} days)
                        </p>
                      </td>
                      <td className="border p-2 text-right">रू {selectedFine?.fine_amount}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td className="border p-2 font-bold">Total Due</td>
                      <td className="border p-2 text-right font-bold text-red-600">
                        रू {(selectedFine?.fine_amount || 0) - (selectedFine?.paid_amount || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <p className="text-xs text-gray-500 text-center">
                  Please pay this amount at the library counter.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBillDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={downloadBill}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Bill
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StudentLibraryCard;
