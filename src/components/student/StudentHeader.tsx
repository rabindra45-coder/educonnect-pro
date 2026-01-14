import { Link } from "react-router-dom";
import { Home, Key, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import schoolLogo from "@/assets/logo.png";

interface StudentHeaderProps {
  studentName: string;
  photoUrl: string | null;
  onPasswordChange: () => void;
  onSignOut: () => void;
}

const StudentHeader = ({ studentName, photoUrl, onPasswordChange, onSignOut }: StudentHeaderProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt="Logo" className="w-10 h-10 object-contain" />
            <div className="hidden sm:block">
              <h1 className="font-display text-sm font-bold text-foreground">Student Portal</h1>
              <p className="text-xs text-muted-foreground">SDSJSS</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Main Site
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={onPasswordChange}>
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={photoUrl || ""} alt={studentName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(studentName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{studentName}</p>
                    <p className="text-xs leading-none text-muted-foreground">Student Account</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="md:hidden">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Main Site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPasswordChange} className="md:hidden">
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
