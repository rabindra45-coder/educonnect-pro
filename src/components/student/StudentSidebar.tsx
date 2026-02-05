 import { useState } from "react";
 import { Link, useNavigate } from "react-router-dom";
 import {
   Home,
   User,
   BookOpen,
   MessageSquare,
   CreditCard,
   Wallet,
   Book,
   FolderOpen,
   Bell,
   Calendar,
   FileText,
   UserCheck,
   LogOut,
   Key,
   ChevronLeft,
   ChevronRight,
   GraduationCap,
   Menu,
   X,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
 import { Separator } from "@/components/ui/separator";
 import { cn } from "@/lib/utils";
 import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
 import schoolLogo from "@/assets/logo.png";
 
 interface StudentSidebarProps {
   activeTab: string;
   onTabChange: (tab: string) => void;
   studentName: string;
   studentClass: string;
   photoUrl: string | null;
   onPasswordChange: () => void;
   onSignOut: () => void;
   unreadMessages?: number;
   pendingFees?: boolean;
 }
 
 const menuItems = [
   { id: "overview", label: "Overview", icon: Home },
   { id: "homework", label: "Homework", icon: BookOpen },
   { id: "messages", label: "Messages", icon: MessageSquare },
   { id: "attendance", label: "Attendance", icon: UserCheck },
   { id: "fees", label: "Fees & Payments", icon: Wallet },
   { id: "library", label: "Library", icon: Book },
   { id: "results", label: "Exam Results", icon: FileText },
   { id: "idcard", label: "ID Card", icon: CreditCard },
   { id: "documents", label: "Documents", icon: FolderOpen },
   { id: "notices", label: "Notices", icon: Bell },
   { id: "calendar", label: "Calendar", icon: Calendar },
 ];
 
 const StudentSidebar = ({
   activeTab,
   onTabChange,
   studentName,
   studentClass,
   photoUrl,
   onPasswordChange,
   onSignOut,
   unreadMessages = 0,
   pendingFees = false,
 }: StudentSidebarProps) => {
   const [collapsed, setCollapsed] = useState(false);
   const [mobileOpen, setMobileOpen] = useState(false);
 
   const getInitials = (name: string) => {
     return name
       .split(" ")
       .map((n) => n[0])
       .join("")
       .toUpperCase()
       .slice(0, 2);
   };
 
   const SidebarContent = ({ isMobile = false }) => (
     <div className={cn("flex flex-col h-full bg-card", isMobile ? "w-full" : collapsed ? "w-[70px]" : "w-[260px]")}>
       {/* Header */}
       <div className={cn("p-4 border-b border-border/50", collapsed && !isMobile && "px-2")}>
         <div className={cn("flex items-center gap-3", collapsed && !isMobile && "justify-center")}>
           <img src={schoolLogo} alt="Logo" className="w-10 h-10 object-contain" />
           {(!collapsed || isMobile) && (
             <div className="flex-1 min-w-0">
               <h1 className="font-display text-sm font-bold text-foreground truncate">Student Portal</h1>
               <p className="text-xs text-muted-foreground">SDSJSS</p>
             </div>
           )}
         </div>
       </div>
 
       {/* User Profile */}
       <div className={cn("p-4 border-b border-border/50", collapsed && !isMobile && "px-2")}>
         <div className={cn("flex items-center gap-3", collapsed && !isMobile && "justify-center")}>
           <Avatar className={cn("border-2 border-primary/20", collapsed && !isMobile ? "w-10 h-10" : "w-12 h-12")}>
             <AvatarImage src={photoUrl || ""} className="object-cover" />
             <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
               {getInitials(studentName)}
             </AvatarFallback>
           </Avatar>
           {(!collapsed || isMobile) && (
             <div className="flex-1 min-w-0">
               <p className="font-semibold text-sm truncate">{studentName}</p>
               <div className="flex items-center gap-1.5">
                 <GraduationCap className="w-3 h-3 text-muted-foreground" />
                 <span className="text-xs text-muted-foreground">Class {studentClass}</span>
               </div>
             </div>
           )}
         </div>
       </div>
 
       {/* Navigation */}
       <nav className="flex-1 p-2 overflow-y-auto">
         <div className="space-y-1">
           {menuItems.map((item) => {
             const isActive = activeTab === item.id;
             const hasNotification = item.id === "messages" && unreadMessages > 0;
             const hasFeeAlert = item.id === "fees" && pendingFees;
 
             return (
               <button
                 key={item.id}
                 onClick={() => {
                   onTabChange(item.id);
                   if (isMobile) setMobileOpen(false);
                 }}
                 className={cn(
                   "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                   "hover:bg-primary/5 active:scale-[0.98]",
                   isActive
                     ? "bg-primary text-primary-foreground shadow-sm"
                     : "text-muted-foreground hover:text-foreground",
                   collapsed && !isMobile && "justify-center px-2"
                 )}
               >
                 <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary-foreground")} />
                 {(!collapsed || isMobile) && (
                   <>
                     <span className="flex-1 text-left">{item.label}</span>
                     {hasNotification && (
                       <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 h-5">
                         {unreadMessages}
                       </Badge>
                     )}
                     {hasFeeAlert && (
                       <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                     )}
                   </>
                 )}
               </button>
             );
           })}
         </div>
       </nav>
 
       {/* Footer Actions */}
       <div className={cn("p-3 border-t border-border/50 space-y-1", collapsed && !isMobile && "px-2")}>
         <Button
           variant="ghost"
           size="sm"
           className={cn("w-full justify-start gap-3", collapsed && !isMobile && "justify-center px-2")}
           onClick={onPasswordChange}
         >
           <Key className="w-4 h-4" />
           {(!collapsed || isMobile) && <span>Change Password</span>}
         </Button>
         <Button
           variant="ghost"
           size="sm"
           className={cn("w-full justify-start gap-3", collapsed && !isMobile && "justify-center px-2")}
           asChild
         >
           <Link to="/">
             <Home className="w-4 h-4" />
             {(!collapsed || isMobile) && <span>Main Site</span>}
           </Link>
         </Button>
         <Separator className="my-2" />
         <Button
           variant="ghost"
           size="sm"
           className={cn(
             "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
             collapsed && !isMobile && "justify-center px-2"
           )}
           onClick={onSignOut}
         >
           <LogOut className="w-4 h-4" />
           {(!collapsed || isMobile) && <span>Sign Out</span>}
         </Button>
       </div>
 
       {/* Collapse Toggle (Desktop only) */}
       {!isMobile && (
         <div className="p-2 border-t border-border/50">
           <Button
             variant="ghost"
             size="sm"
             className="w-full"
             onClick={() => setCollapsed(!collapsed)}
           >
             {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
           </Button>
         </div>
       )}
     </div>
   );
 
   return (
     <>
       {/* Mobile Header */}
       <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50">
         <div className="flex items-center justify-between px-4 h-14">
           <div className="flex items-center gap-3">
             <img src={schoolLogo} alt="Logo" className="w-8 h-8 object-contain" />
             <span className="font-display text-sm font-bold">Student Portal</span>
           </div>
           <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon">
                 <Menu className="w-5 h-5" />
               </Button>
             </SheetTrigger>
             <SheetContent side="left" className="p-0 w-[280px]">
               <SidebarContent isMobile />
             </SheetContent>
           </Sheet>
         </div>
       </div>
 
       {/* Desktop Sidebar */}
       <aside className={cn(
         "hidden lg:flex flex-col border-r border-border/50 transition-all duration-300 h-screen sticky top-0",
         collapsed ? "w-[70px]" : "w-[260px]"
       )}>
         <SidebarContent />
       </aside>
     </>
   );
 };
 
 export default StudentSidebar;