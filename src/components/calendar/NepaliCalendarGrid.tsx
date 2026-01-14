import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Plus, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  description: string | null;
  event_type: string;
}

// Nepali month names
const nepaliMonths = [
  { name: "बैशाख", english: "Apr/May" },
  { name: "जेठ", english: "May/Jun" },
  { name: "असार", english: "Jun/Jul" },
  { name: "साउन", english: "Jul/Aug" },
  { name: "भदौ", english: "Aug/Sep" },
  { name: "असोज", english: "Sep/Oct" },
  { name: "कार्तिक", english: "Oct/Nov" },
  { name: "मंसिर", english: "Nov/Dec" },
  { name: "पौष", english: "Dec/Jan" },
  { name: "माघ", english: "Jan/Feb" },
  { name: "फागुन", english: "Feb/Mar" },
  { name: "चैत", english: "Mar/Apr" },
];

// Nepali numerals
const toNepaliNumeral = (num: number): string => {
  const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return num.toString().split("").map(d => nepaliDigits[parseInt(d)] || d).join("");
};

// Nepali weekday names
const weekDays = ["आ", "सो", "मं", "बु", "बि", "शु", "श"];

// Days in each Nepali month for 2082 BS
const daysInMonth2082 = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];

// Gregorian start dates for each Nepali month in 2082 BS
const gregorianStartDates2082 = [
  "2025-04-14", // Baisakh
  "2025-05-15", // Jestha
  "2025-06-15", // Ashar
  "2025-07-17", // Shrawan
  "2025-08-17", // Bhadra
  "2025-09-17", // Ashwin
  "2025-10-17", // Kartik
  "2025-11-16", // Mangsir
  "2025-12-16", // Poush
  "2026-01-15", // Magh
  "2026-02-13", // Falgun
  "2026-03-15", // Chaitra
];

// Get the day of week for the first day of each Nepali month
const getFirstDayOfWeek = (monthIndex: number): number => {
  const date = new Date(gregorianStartDates2082[monthIndex]);
  return date.getDay();
};

// Convert Nepali date to Gregorian date
const nepaliToGregorian = (monthIndex: number, day: number): string => {
  const startDate = new Date(gregorianStartDates2082[monthIndex]);
  startDate.setDate(startDate.getDate() + day - 1);
  return startDate.toISOString().split("T")[0];
};

// Convert Gregorian date to Nepali month and day
const gregorianToNepali = (gregorianDate: string): { month: number; day: number } | null => {
  const targetDate = new Date(gregorianDate);
  
  for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
    const startDate = new Date(gregorianStartDates2082[monthIdx]);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysInMonth2082[monthIdx] - 1);
    
    if (targetDate >= startDate && targetDate <= endDate) {
      const dayDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return { month: monthIdx, day: dayDiff + 1 };
    }
  }
  return null;
};

const NepaliCalendarGrid = () => {
  const { hasAnyAdminRole } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<{ month: number; day: number; gregorian: string } | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showAddExamDialog, setShowAddExamDialog] = useState(false);
  const [selectedMonthForView, setSelectedMonthForView] = useState<number | null>(null);
  
  // Form state for adding exam
  const [examForm, setExamForm] = useState({
    title: "",
    description: "",
    event_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("academic_calendar")
      .select("*")
      .gte("event_date", "2025-04-14")
      .lte("event_date", "2026-04-13")
      .order("event_date", { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  // Get events for a specific Gregorian date
  const getEventsForDate = (gregorianDate: string): CalendarEvent[] => {
    return events.filter(e => e.event_date === gregorianDate);
  };

  // Check if date has holiday
  const hasHoliday = (gregorianDate: string): boolean => {
    return events.some(e => e.event_date === gregorianDate && e.event_type === "holiday");
  };

  // Check if date has exam
  const hasExam = (gregorianDate: string): boolean => {
    return events.some(e => e.event_date === gregorianDate && e.event_type === "exam");
  };

  // Handle date click
  const handleDateClick = (monthIndex: number, day: number) => {
    const gregorian = nepaliToGregorian(monthIndex, day);
    setSelectedDate({ month: monthIndex, day, gregorian });
    setShowEventDialog(true);
  };

  // Handle add exam submission
  const handleAddExam = async () => {
    if (!examForm.title || !examForm.event_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("academic_calendar").insert({
      title: examForm.title,
      description: examForm.description || null,
      event_date: examForm.event_date,
      event_type: "exam",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add exam",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Exam added successfully",
      });
      setExamForm({ title: "", description: "", event_date: "" });
      setShowAddExamDialog(false);
      fetchEvents();
    }
    setIsSubmitting(false);
  };

  // Render a single month calendar
  const renderMonth = (monthIndex: number) => {
    const firstDayOfWeek = getFirstDayOfWeek(monthIndex);
    const daysInThisMonth = daysInMonth2082[monthIndex];
    const days = [];

    // Empty cells for days before the first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInThisMonth; day++) {
      const gregorianDate = nepaliToGregorian(monthIndex, day);
      const gregorianDay = new Date(gregorianDate).getDate();
      const isHoliday = hasHoliday(gregorianDate);
      const isExam = hasExam(gregorianDate);
      const dayEvents = getEventsForDate(gregorianDate);
      const isSaturday = (firstDayOfWeek + day - 1) % 7 === 6;

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDateClick(monthIndex, day)}
          className={`h-10 flex flex-col items-center justify-center cursor-pointer rounded-lg transition-all relative ${
            isExam
              ? "bg-green-500/20 hover:bg-green-500/30 border border-green-500/40"
              : isHoliday || isSaturday
              ? "bg-red-500/10 hover:bg-red-500/20"
              : "hover:bg-muted"
          }`}
        >
          <span
            className={`text-sm font-medium ${
              isExam
                ? "text-green-600 dark:text-green-400"
                : isHoliday || isSaturday
                ? "text-red-600 dark:text-red-400"
                : "text-foreground"
            }`}
          >
            {toNepaliNumeral(day)}
          </span>
          <span
            className={`text-[10px] ${
              isExam
                ? "text-green-600/70 dark:text-green-400/70"
                : isHoliday || isSaturday
                ? "text-red-500/70"
                : "text-muted-foreground"
            }`}
          >
            {gregorianDay}
          </span>
          {dayEvents.length > 0 && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
          )}
        </motion.div>
      );
    }

    return (
      <Card className="overflow-hidden">
        <CardHeader className="py-3 px-4 bg-muted/50">
          <CardTitle className="flex justify-between items-center text-sm">
            <span className="font-bold text-foreground">{nepaliMonths[monthIndex].name}</span>
            <span className="text-muted-foreground font-normal text-xs">
              {nepaliMonths[monthIndex].english} {monthIndex < 9 ? "2025" : "2026"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className={`text-center text-xs font-medium py-1 ${
                  i === 6 ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">{days}</div>
        </CardContent>
      </Card>
    );
  };

  const selectedDateEvents = selectedDate
    ? getEventsForDate(selectedDate.gregorian)
    : [];

  return (
    <div className="space-y-6">
      {/* Header with Legend and Add Exam Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/40" />
            <span className="text-sm text-muted-foreground">बिदा / Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/40" />
            <span className="text-sm text-muted-foreground">परीक्षा / Exam</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Event</span>
          </div>
        </div>

        {hasAnyAdminRole() && (
          <Button onClick={() => setShowAddExamDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Exam Date
          </Button>
        )}
      </div>

      {/* Year Title */}
      <div className="text-center mb-8">
        <h2 className="font-display text-4xl font-bold text-primary">२०८२</h2>
        <p className="text-muted-foreground">2025/2026 AD</p>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {nepaliMonths.map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {renderMonth(index)}
            </motion.div>
          ))}
        </div>
      )}

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              {selectedDate && (
                <>
                  {nepaliMonths[selectedDate.month].name} {toNepaliNumeral(selectedDate.day)}, २०८२
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedDate && new Date(selectedDate.gregorian).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedDateEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                No events on this date
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${
                      event.event_type === "exam"
                        ? "bg-green-500/10 border-green-500/30"
                        : event.event_type === "holiday"
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <Badge
                        variant={
                          event.event_type === "exam"
                            ? "default"
                            : event.event_type === "holiday"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          event.event_type === "exam"
                            ? "bg-green-500 hover:bg-green-600"
                            : ""
                        }
                      >
                        {event.event_type === "exam"
                          ? "परीक्षा"
                          : event.event_type === "holiday"
                          ? "बिदा"
                          : event.event_type}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Exam Dialog (Admin Only) */}
      <Dialog open={showAddExamDialog} onOpenChange={setShowAddExamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exam Date</DialogTitle>
            <DialogDescription>
              Add a new exam to the academic calendar. It will appear in green.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="exam-title">Exam Title *</Label>
              <Input
                id="exam-title"
                placeholder="e.g., First Terminal Exam"
                value={examForm.title}
                onChange={(e) =>
                  setExamForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam-date">Exam Date *</Label>
              <Input
                id="exam-date"
                type="date"
                value={examForm.event_date}
                onChange={(e) =>
                  setExamForm((prev) => ({ ...prev, event_date: e.target.value }))
                }
                min="2025-04-14"
                max="2026-04-13"
              />
              {examForm.event_date && (
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const nepali = gregorianToNepali(examForm.event_date);
                    if (nepali) {
                      return `${nepaliMonths[nepali.month].name} ${toNepaliNumeral(nepali.day)}, २०८२`;
                    }
                    return "Date outside 2082 BS";
                  })()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam-description">Description (Optional)</Label>
              <Textarea
                id="exam-description"
                placeholder="Additional details about the exam..."
                value={examForm.description}
                onChange={(e) =>
                  setExamForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddExamDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddExam} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Exam"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NepaliCalendarGrid;
