import { motion } from "framer-motion";
import { Clock, Activity, ScanFace, Lock, Monitor, Globe, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  details: any;
  ip_address?: string;
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

  const getLoginMethodBadge = (details: any) => {
    if (!details?.login_method) return null;
    
    const method = details.login_method;
    if (method === "face") {
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
          <ScanFace className="w-3 h-3" />
          Face
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 gap-1">
        <Lock className="w-3 h-3" />
        Password
      </Badge>
    );
  };

  const getDeviceInfo = (details: any) => {
    if (!details) return null;
    
    const parts = [];
    if (details.device) parts.push(details.device);
    if (details.browser) parts.push(details.browser);
    if (details.os) parts.push(details.os);
    
    return parts.length > 0 ? parts.join(" • ") : null;
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
            <ScrollArea className="h-[250px] pr-4">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[5px] top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-4">
                  {activities.map((activity, index) => {
                    const deviceInfo = getDeviceInfo(activity.details);
                    const isLogin = activity.action.toLowerCase() === "login";
                    
                    return (
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
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm">
                                <span className="font-medium capitalize">{activity.action}</span>
                                {!isLogin && (
                                  <>
                                    <span className="text-muted-foreground"> on </span>
                                    <span className="text-muted-foreground capitalize">{activity.entity_type}</span>
                                  </>
                                )}
                              </p>
                              {isLogin && getLoginMethodBadge(activity.details)}
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                          
                          {/* Additional details for login */}
                          {isLogin && (deviceInfo || activity.ip_address) && (
                            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                              {deviceInfo && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="flex items-center gap-1 cursor-help">
                                        <Monitor className="w-3 h-3" />
                                        <span className="truncate max-w-[120px]">{deviceInfo}</span>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{deviceInfo}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {activity.ip_address && activity.ip_address !== "Unknown" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="flex items-center gap-1 cursor-help">
                                        <Globe className="w-3 h-3" />
                                        <span>{activity.ip_address}</span>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>IP Address: {activity.ip_address}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
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
