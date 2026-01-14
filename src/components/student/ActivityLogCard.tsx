import { motion } from "framer-motion";
import { Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  details: any;
}

interface ActivityLogCardProps {
  activities: ActivityLog[];
}

const ActivityLogCard = ({ activities }: ActivityLogCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "login":
        return "bg-green-500";
      case "logout":
        return "bg-red-500";
      case "update":
        return "bg-blue-500";
      case "view":
        return "bg-purple-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No recent activity</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px] pr-4">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[5px] top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 relative"
                    >
                      {/* Timeline Dot */}
                      <div className={`shrink-0 w-3 h-3 rounded-full ${getActionColor(activity.action)} ring-2 ring-background z-10`} />

                      <div className="flex-1 min-w-0 pb-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm">
                            <span className="font-medium capitalize">{activity.action}</span>
                            <span className="text-muted-foreground"> on </span>
                            <span className="text-muted-foreground capitalize">{activity.entity_type}</span>
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDate(activity.created_at)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivityLogCard;
