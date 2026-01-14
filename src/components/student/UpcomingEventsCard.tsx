import { motion } from "framer-motion";
import { Calendar, ExternalLink, BookOpen, PartyPopper, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AcademicEvent {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  event_type: string;
  description: string | null;
}

interface UpcomingEventsCardProps {
  events: AcademicEvent[];
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const UpcomingEventsCard = ({ events, limit = 5, showViewAll = true, onViewAll }: UpcomingEventsCardProps) => {
  const getEventConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case "exam":
        return {
          icon: GraduationCap,
          color: "text-red-600",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/20",
          badgeClass: "bg-red-500/10 text-red-600 border-red-200",
        };
      case "holiday":
        return {
          icon: PartyPopper,
          color: "text-green-600",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/20",
          badgeClass: "bg-green-500/10 text-green-600 border-green-200",
        };
      case "event":
        return {
          icon: Calendar,
          color: "text-blue-600",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20",
          badgeClass: "bg-blue-500/10 text-blue-600 border-blue-200",
        };
      default:
        return {
          icon: BookOpen,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          borderColor: "border-border",
          badgeClass: "bg-muted text-muted-foreground",
        };
    }
  };

  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diff = eventDate.getTime() - today.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 7) return `In ${days} days`;
    return `In ${Math.ceil(days / 7)} weeks`;
  };

  const displayedEvents = limit ? events.slice(0, limit) : events;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-green-500/10">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            Upcoming Events
          </CardTitle>
          {showViewAll && events.length > limit && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary">
              View All
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No upcoming events</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {displayedEvents.map((event, index) => {
                  const config = getEventConfig(event.event_type);
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-center min-w-[50px] shrink-0">
                          <p className={`text-xl font-bold ${config.color}`}>
                            {new Date(event.event_date).getDate()}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {new Date(event.event_date).toLocaleString("en", { month: "short" })}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-xs ${config.badgeClass}`}>
                              <Icon className="w-3 h-3 mr-1" />
                              {event.event_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{getDaysUntil(event.event_date)}</span>
                          </div>
                          <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                          {event.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UpcomingEventsCard;
