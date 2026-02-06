import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  MessageSquare,
  Bot,
  CalendarClock,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ParentSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userName: string;
  photoUrl?: string | null;
}

const menuItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "children", label: "My Children", icon: Users },
  { id: "academics", label: "Academic Progress", icon: GraduationCap },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "fees", label: "Fees & Finance", icon: Wallet },
  { id: "ai-assistant", label: "AI Assistant", icon: Bot },
  { id: "meetings", label: "Teacher Meetings", icon: CalendarClock },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

const ParentSidebar = ({ activeTab, onTabChange, onLogout, userName, photoUrl }: ParentSidebarProps) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Profile Section */}
      <div className="p-4 border-b">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="h-10 w-10 border-2 border-teal-500">
            <AvatarImage src={photoUrl || undefined} />
            <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">Guardian</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (isMobile) setSheetOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Collapse & Logout */}
      <div className="p-2 border-t space-y-1">
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold text-teal-700">Parent Portal</h1>
          <Avatar className="h-8 w-8 border border-teal-500">
            <AvatarImage src={photoUrl || undefined} />
            <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="h-14" />
      </>
    );
  }

  return (
    <aside
      className={`hidden md:flex flex-col bg-background border-r h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <SidebarContent />
    </aside>
  );
};

export default ParentSidebar;
