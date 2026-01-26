import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Search, Loader2, Check, X, BookOpen } from "lucide-react";
import { format, addDays } from "date-fns";

interface Reservation {
  id: string;
  reservation_date: string;
  expiry_date: string;
  status: string;
  notes: string | null;
  book: { id: string; title: string; author: string; available_copies: number };
  student: { id: string; full_name: string; registration_number: string; class: string };
}

interface LibraryReservationsProps {
  onUpdate: () => void;
}

const LibraryReservations = ({ onUpdate }: LibraryReservationsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from("book_reservations")
        .select(`
          *,
          book:book_id (id, title, author, available_copies),
          student:student_id (id, full_name, registration_number, class)
        `)
        .order("reservation_date", { ascending: false });

      if (error) throw error;
      setReservations(data as any || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (reservation: Reservation) => {
    if (reservation.book.available_copies <= 0) {
      toast({
        title: "No Copies Available",
        description: "The book is currently not available for issue.",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(reservation.id);
    try {
      // Issue the book
      const dueDate = addDays(new Date(), 14);
      const { error: issueError } = await supabase.from("book_issues").insert({
        book_id: reservation.book.id,
        student_id: reservation.student.id,
        issued_by: user?.id,
        due_date: format(dueDate, "yyyy-MM-dd"),
      });

      if (issueError) throw issueError;

      // Update reservation status
      const { error: updateError } = await supabase
        .from("book_reservations")
        .update({
          status: "fulfilled",
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq("id", reservation.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Reservation approved and book issued successfully.",
      });
      fetchReservations();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reservationId: string) => {
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;

    setProcessingId(reservationId);
    try {
      const { error } = await supabase
        .from("book_reservations")
        .update({
          status: "cancelled",
          notes: reason,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq("id", reservationId);

      if (error) throw error;

      toast({ title: "Success", description: "Reservation rejected." });
      fetchReservations();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      fulfilled: "default",
      cancelled: "destructive",
      expired: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.book?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookMarked className="w-5 h-5" />
          Book Reservations
        </CardTitle>
        <CardDescription>Manage book reservation requests from students</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by student or book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "fulfilled", "cancelled"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">
              {reservations.filter((r) => r.status === "pending").length}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {reservations.filter((r) => r.status === "fulfilled").length}
            </p>
            <p className="text-sm text-muted-foreground">Fulfilled</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">
              {reservations.filter((r) => r.status === "cancelled").length}
            </p>
            <p className="text-sm text-muted-foreground">Cancelled</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-950/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-600">
              {reservations.filter((r) => r.status === "expired").length}
            </p>
            <p className="text-sm text-muted-foreground">Expired</p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Reserved On</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No reservations found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reservation.student?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.student?.registration_number} | Class {reservation.student?.class}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reservation.book?.title}</p>
                        <p className="text-xs text-muted-foreground">{reservation.book?.author}</p>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(reservation.reservation_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(reservation.expiry_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={reservation.book?.available_copies > 0 ? "default" : "destructive"}
                      >
                        {reservation.book?.available_copies} available
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                    <TableCell className="text-right">
                      {reservation.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Approve & Issue"
                            onClick={() => handleApprove(reservation)}
                            disabled={processingId === reservation.id}
                          >
                            {processingId === reservation.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4 text-emerald-600" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Reject"
                            onClick={() => handleReject(reservation.id)}
                            disabled={processingId === reservation.id}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      )}
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

export default LibraryReservations;
