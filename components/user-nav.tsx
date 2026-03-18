"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserNavProps {
  user: {
    email: string;
    role: string;
  };
}

function getInitials(email: string): string {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getRoleColor(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-700";
    case "DOCTOR":
      return "bg-primary/10 text-primary";
    case "RECEPTIONIST":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {/* User logo */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-primary font-bold" />
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-none">{user.email.split("@")[0]}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
            </div>
            <Avatar className="h-9 w-9 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium leading-none">{user.email.split("@")[0]}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className={getRoleColor(user.role)}>
                {user.role.toLowerCase()}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
