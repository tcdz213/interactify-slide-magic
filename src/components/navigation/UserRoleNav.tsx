
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { ROLES, ROLE_DEFINITIONS, Role } from "@/utils/roles";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { changeRole, logout } from "@/redux/slices/authSlice";
import { toast } from "sonner";

const UserRoleNav = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, currentRole, user } = useAppSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
    toast.success("You've been logged out successfully");
  };

  // For demo/development, allow switching roles
  const handleRoleChange = (role: Role) => {
    dispatch(changeRole(role));
    toast.success(`Role changed to ${ROLE_DEFINITIONS[role]?.name}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Link to="/login">
          <Button variant="outline" size="sm">
            Log in
          </Button>
        </Link>
        <Link to="/signup">
          <Button size="sm">Sign up</Button>
        </Link>
      </div>
    );
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            <Badge className="mt-2 w-fit">
              {ROLE_DEFINITIONS[currentRole]?.name}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* User-type specific menu items */}
        {currentRole === ROLES.PLATFORM_ADMIN && (
          <DropdownMenuItem asChild>
            <Link to="/admin">Admin Dashboard</Link>
          </DropdownMenuItem>
        )}
        
        {currentRole === ROLES.CENTER_OWNER && (
          <DropdownMenuItem asChild>
            <Link to="/center-owner-dashboard">Center Dashboard</Link>
          </DropdownMenuItem>
        )}
        
        {currentRole === ROLES.TEACHER && (
          <DropdownMenuItem asChild>
            <Link to="/teacher-profile">Teacher Profile</Link>
          </DropdownMenuItem>
        )}
        
        {currentRole === ROLES.LEARNER && (
          <DropdownMenuItem asChild>
            <Link to="/learner-profile">Learner Profile</Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* For demo purposes - role switching */}
        <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleRoleChange(ROLES.PLATFORM_ADMIN)}>
          Admin
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange(ROLES.CENTER_OWNER)}>
          Center Owner
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange(ROLES.TEACHER)}>
          Teacher
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange(ROLES.LEARNER)}>
          Learner
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserRoleNav;
