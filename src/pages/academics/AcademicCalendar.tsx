import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Calendar as CalendarIcon, Clock, List, Grid3X3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NepaliCalendarGrid from "@/components/calendar/NepaliCalendarGrid";

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  description: string | null;
  event_type: string;
}

const eventTypeColors: Record<string, string> = {
  exam: "bg-green-500/10 text-green-600 border-green-500/20",
  holiday: "bg-red-500/10 text-red-600 border-red-500/20",
  event: "bg-primary/10 text-primary border-primary/20",
  general: "bg-muted text-muted-foreground border-border",
};

const AcademicCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("academic_calendar")
        .select("*")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true });

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const eventTypes = [
    { id: "all", name: "All Events" },
    { id: "exam", name: "Exams" },
    { id: "holiday", name: "Holidays" },
    { id: "event", name: "Events" },
    { id: "general", name: "General" },
  ];

  const filteredEvents =
    selectedType === "all"
      ? events
      : events.filter((e) => e.event_type === selectedType);

  const formatEventDate = (startDate: string, endDate: string | null) => {
    const start = format(new Date(startDate), "MMM dd, yyyy");
    if (endDate) {
      const end = format(new Date(endDate), "MMM dd, yyyy");
      return `${start} - ${end}`;
    }
    return start;
  };

  return (
    <>
      <Helmet>
        <title>Academic Calendar | Shree Durga Saraswati Janata Secondary School</title>
        <meta
          name="description"
          content="View the academic calendar including exam schedules, holidays, and events at Shree Durga Saraswati Janata Secondary School."
        />
      </Helmet>

      <MainLayout>
        {/* Hero Section */}
        <section className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                शैक्षिक पात्रो २०८२
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Academic Calendar 2082 BS - Stay updated with important dates, exams, holidays, and school events.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="calendar" className="gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Calendar View
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  List View
                </TabsTrigger>
              </TabsList>

              {/* Nepali Calendar Grid View */}
              <TabsContent value="calendar">
                <NepaliCalendarGrid />
              </TabsContent>

              {/* List View */}
              <TabsContent value="list">
                {/* Type Filter */}
                <motion.div
                  className="flex flex-wrap justify-center gap-3 mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {eventTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                        selectedType === type.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-primary/10"
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </motion.div>

                {/* Events List */}
                {loading ? (
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-24 rounded-xl bg-muted animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No Upcoming Events
                    </h3>
                    <p className="text-muted-foreground">
                      Check back later for upcoming events and important dates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {filteredEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className={`border-l-4 ${
                            eventTypeColors[event.event_type] || eventTypeColors.general
                          }`}
                        >
                          <CardContent className="py-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <CalendarIcon className="w-5 h-5" />
                                <span className="font-medium">
                                  {formatEventDate(event.event_date, event.end_date)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-foreground">{event.title}</h3>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                      eventTypeColors[event.event_type] || eventTypeColors.general
                                    }`}
                                  >
                                    {event.event_type === "exam" ? "परीक्षा" : 
                                     event.event_type === "holiday" ? "बिदा" : event.event_type}
                                  </span>
                                </div>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground">{event.description}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Clock className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2">School Hours</h3>
                  <p className="text-muted-foreground text-sm">
                    Sunday - Friday: 10:00 AM - 4:00 PM
                    <br />
                    Saturday: Closed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <CalendarIcon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2">Academic Session</h3>
                  <p className="text-muted-foreground text-sm">
                    Session starts from Baisakh
                    <br />
                    and ends in Chaitra
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default AcademicCalendar;
