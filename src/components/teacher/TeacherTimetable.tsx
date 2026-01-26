import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Loader2, MapPin } from "lucide-react";
import { format } from "date-fns";

interface TeacherTimetableProps {
  teacherId: string | undefined;
}

interface TimetableEntry {
  id: string;
  day_of_week: number;
  period_number: number;
  start_time: string;
  end_time: string;
  class: string;
  section: string | null;
  room: string | null;
  subject: { name: string } | null;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TeacherTimetable = ({ teacherId }: TeacherTimetableProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [activeDay, setActiveDay] = useState(new Date().getDay().toString());

  useEffect(() => {
    if (teacherId) {
      fetchTimetable();
    }
  }, [teacherId]);

  const fetchTimetable = async () => {
    if (!teacherId) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("teacher_timetable")
        .select(`
          id,
          day_of_week,
          period_number,
          start_time,
          end_time,
          class,
          section,
          room,
          subject:subject_id (name)
        `)
        .eq("teacher_id", teacherId)
        .order("day_of_week")
        .order("period_number");

      if (error) throw error;
      setTimetable(data || []);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEntriesForDay = (dayIndex: number) => {
    return timetable.filter((entry) => entry.day_of_week === dayIndex);
  };

  const currentDayIndex = new Date().getDay();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            My Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDay} onValueChange={setActiveDay}>
            <TabsList className="grid grid-cols-7 mb-6">
              {DAYS.map((day, index) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className={`text-xs sm:text-sm ${
                    index === currentDayIndex ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 3)}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {DAYS.map((day, dayIndex) => {
              const entries = getEntriesForDay(dayIndex);
              return (
                <TabsContent key={dayIndex} value={dayIndex.toString()}>
                  {entries.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No classes scheduled for {day}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-blue-600">
                              {entry.period_number}
                            </span>
                            <span className="text-xs text-muted-foreground">Period</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg">
                              {(entry.subject as any)?.name || "Subject"}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge>Class {entry.class}{entry.section ? `-${entry.section}` : ""}</Badge>
                              {entry.room && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {entry.room}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {entry.start_time?.slice(0, 5)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              to {entry.end_time?.slice(0, 5)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, dayIndex) => {
                  const entries = getEntriesForDay(dayIndex);
                  return (
                    <div
                      key={dayIndex}
                      className={`p-2 rounded-lg ${
                        dayIndex === currentDayIndex
                          ? "bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500"
                          : "bg-muted/30"
                      }`}
                    >
                      <h4 className="font-medium text-sm text-center mb-2">{day}</h4>
                      {entries.length === 0 ? (
                        <p className="text-xs text-center text-muted-foreground py-4">
                          No classes
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="p-2 bg-white dark:bg-slate-800 rounded text-xs"
                            >
                              <p className="font-medium truncate">
                                {(entry.subject as any)?.name}
                              </p>
                              <p className="text-muted-foreground">
                                {entry.class}{entry.section ? `-${entry.section}` : ""}
                              </p>
                              <p className="text-muted-foreground">
                                {entry.start_time?.slice(0, 5)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherTimetable;
