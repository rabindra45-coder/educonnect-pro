import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
}

const eventColors: Record<string, string> = {
  exam: "bg-green-500",
  holiday: "bg-red-500",
  event: "bg-secondary",
  general: "bg-primary",
};

const CalendarWidget = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    supabase
      .from("academic_calendar")
      .select("id, title, event_date, event_type")
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        if (data) setEvents(data);
      });
  }, []);

  if (events.length === 0) return null;

  return (
    <motion.div
      className="bg-card/10 backdrop-blur-md border border-card/15 rounded-2xl p-5 max-w-sm"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-secondary" />
          <span className="text-card text-xs font-semibold uppercase tracking-wider">
            Upcoming
          </span>
        </div>
        <Link
          to="/academics/calendar"
          className="text-secondary text-[10px] font-medium flex items-center gap-0.5 hover:underline"
        >
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            className="flex items-center gap-3 group cursor-default"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.1 }}
          >
            {/* Date badge */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-card/10 flex flex-col items-center justify-center">
              <span className="text-secondary text-xs font-bold leading-none">
                {format(new Date(event.event_date), "dd")}
              </span>
              <span className="text-card/50 text-[9px] uppercase">
                {format(new Date(event.event_date), "MMM")}
              </span>
            </div>

            {/* Event info */}
            <div className="flex-1 min-w-0">
              <p className="text-card text-xs font-medium truncate group-hover:text-secondary transition-colors">
                {event.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    eventColors[event.event_type] || eventColors.general
                  }`}
                />
                <span className="text-card/40 text-[10px] capitalize">
                  {event.event_type === "exam"
                    ? "परीक्षा"
                    : event.event_type === "holiday"
                    ? "बिदा"
                    : event.event_type}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CalendarWidget;
