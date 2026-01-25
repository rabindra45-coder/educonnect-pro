import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Loader2, Calendar, User, Book } from "lucide-react";
import { format, addDays } from "date-fns";

interface Student {
  id: string;
  full_name: string;
  registration_number: string;
  class: string;
  section: string | null;
}

interface AvailableBook {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  available_copies: number;
  shelf_location: string | null;
}

interface IssuedBook {
  id: string;
  issue_date: string;
  due_date: string;
  status: string;
  book: { title: string; author: string };
  student: { full_name: string; registration_number: string; class: string };
}

interface IssueBooksProps {
  onIssue: () => void;
}

const IssueBooks = ({ onIssue }: IssueBooksProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<AvailableBook[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [daysToIssue, setDaysToIssue] = useState(14);
  const [studentSearch, setStudentSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch students
      const { data: studentsData } = await supabase
        .from("students")
        .select("id, full_name, registration_number, class, section")
        .eq("status", "active")
        .order("full_name");

      setStudents(studentsData || []);

      // Fetch available books
      const { data: booksData } = await supabase
        .from("books")
        .select("id, title, author, isbn, available_copies, shelf_location")
        .eq("is_active", true)
        .gt("available_copies", 0)
        .order("title");

      setBooks(booksData || []);

      // Fetch recently issued books
      const { data: issuedData } = await supabase
        .from("book_issues")
        .select(`
          id,
          issue_date,
          due_date,
          status,
          book:book_id (title, author),
          student:student_id (full_name, registration_number, class)
        `)
        .eq("status", "issued")
        .order("issue_date", { ascending: false })
        .limit(20);

      setIssuedBooks(issuedData as any || []);
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

  const handleIssueBook = async () => {
    if (!selectedStudent || !selectedBook) {
      toast({
        title: "Error",
        description: "Please select both a student and a book.",
        variant: "destructive",
      });
      return;
    }

    setIsIssuing(true);
    try {
      // Get library settings
      const { data: settings } = await supabase
        .from("library_settings")
        .select("max_books_per_student")
        .single();

      // Check how many books the student has
      const { count: currentIssued } = await supabase
        .from("book_issues")
        .select("*", { count: "exact", head: true })
        .eq("student_id", selectedStudent)
        .eq("status", "issued");

      if (currentIssued && settings && currentIssued >= settings.max_books_per_student) {
        toast({
          title: "Limit Reached",
          description: `Student has already borrowed ${settings.max_books_per_student} books.`,
          variant: "destructive",
        });
        return;
      }

      // Issue the book
      const dueDate = addDays(new Date(), daysToIssue);
      const { error } = await supabase.from("book_issues").insert({
        book_id: selectedBook,
        student_id: selectedStudent,
        issued_by: user?.id,
        due_date: format(dueDate, "yyyy-MM-dd"),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Book issued successfully!",
      });

      setSelectedStudent("");
      setSelectedBook("");
      fetchData();
      onIssue();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.registration_number.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Issue Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Issue Book
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Select Student
              </Label>
              <Input
                placeholder="Search student..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="mb-2"
              />
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} ({student.registration_number}) - Class {student.class}
                      {student.section ? ` ${student.section}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Book Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Book className="w-4 h-4" />
                Select Book
              </Label>
              <Input
                placeholder="Search book..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="mb-2"
              />
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a book" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBooks.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} - {book.author} ({book.available_copies} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Days and Issue Button */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Issue Period (Days)
              </Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={daysToIssue}
                onChange={(e) => setDaysToIssue(parseInt(e.target.value))}
              />
              <Button onClick={handleIssueBook} disabled={isIssuing} className="w-full mt-2">
                {isIssuing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Issuing...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Issue Book
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recently Issued */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Issued Books</CardTitle>
        </CardHeader>
        <CardContent>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {issuedBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No recently issued books.
                    </TableCell>
                  </TableRow>
                ) : (
                  issuedBooks.map((issue) => (
                    <TableRow key={issue.id}>
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
                        <Badge
                          variant={
                            new Date(issue.due_date) < new Date() ? "destructive" : "default"
                          }
                        >
                          {new Date(issue.due_date) < new Date() ? "Overdue" : "Issued"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueBooks;
