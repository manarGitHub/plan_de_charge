"use client";
import React, { ReactNode } from "react";
import { Menu, Moon, Search, Settings, Sun, Plus } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { AuthUserResponse, Manager, useGetAuthUserQuery, User } from "@/state/api";
import { signOut } from "aws-amplify/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage } from "../ui/avatar";


// Add Super Admin type guard
const isSuperAdmin = (user: AuthUserResponse): user is AuthUserResponse & { 
  userRole: 'super_admin';
  userInfo: null;
} => {
  return user.userRole === 'super_admin';
};
// Type guard for Manager
const isManager = (user: AuthUserResponse): user is AuthUserResponse & { 
  userRole: 'manager'; 
  userInfo: Manager 
} => {
  return user.userRole === 'manager';
};
// Type guard for User
const isUser = (user: AuthUserResponse): user is AuthUserResponse & { 
  userRole: 'user'; 
  userInfo: User 
} => {
  return user.userRole === 'user';
};

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardPage =
  pathname.includes("/managers") || pathname.includes("/users") ||  pathname.includes("/super_admin/manageUsers"); ;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

   // Get display name safely
    const getDisplayName = () => {
    if (!authUser) return '';
    if (isSuperAdmin(authUser)) return "Super Admin";
    if (isManager(authUser)) return authUser.userInfo.name;
    if (isUser(authUser)) return authUser.userInfo.username;
    return '';
  };

    // Modified handleNavigation
  const handleNavigation = (path: string) => {
    if (!authUser) return;
    
    if (isSuperAdmin(authUser)) {
      router.push('/super_admin/manageUsers');
      return;
    }

    router.push(path);
  };
  
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black">
      {/* Left side: Sidebar toggle & Search */}
      <div className="flex items-center gap-8">
      {!isDashboardPage && (
          <Link href="/">
            <img 
              src="/logo.png" // Update with your logo path
              alt="Logo"
              className="h-8 w-auto dark:invert" // Invert logo in dark mode
            />
          </Link>
        )}
        {isSidebarCollapsed && (
          <button onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}>
            <Menu className="h-8 w-8 dark:text-white" />
          </button>
        )}
        <div className="relative flex h-min w-[200px]">
          <Search className="absolute left-[4px] top-1/2 h-5 w-5 -translate-y-1/2 dark:text-white" />
          <input
            className="w-full rounded bg-gray-100 p-2 pl-8 dark:bg-gray-700 dark:text-white"
            type="search"
            placeholder="Recherche..."
          />
        </div>
      </div>

      {/* Right side: Theme toggle, Links, Auth */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDarkMode ? <Sun className="h-6 w-6 dark:text-white" /> : <Moon className="h-6 w-6 dark:text-white" />}
        </button>

        {/* Settings (visible to both roles) */}
        <Link href="/settings" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <Settings className="h-6 w-6 dark:text-white" />
        </Link>

        {/* Authenticated user */}
        {authUser ? (
          <>
           
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2">
              <Avatar>
                 <AvatarImage src="/p1.jpeg" /> 
              </Avatar>

                <span className="text-sm text-gray-700 dark:text-white">
                  {getDisplayName()}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
              <DropdownMenuItem 
               onClick={() => isDashboardPage ? router.push('/') : handleNavigation(
                    isSuperAdmin(authUser) 
                      ? "/super_admin/manageUsers" 
                      : isManager(authUser) 
                        ? "/managers/home" 
                        : "/users/home"
                  )}
      >
{isDashboardPage ? "Page d'accueil" : 
                    isSuperAdmin(authUser) ? "Manage Users" : "Dashboard"}
              </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Se déconnecter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Link href="/signin">
              <Button variant="outline" className="text-black dark:text-white">Se connecter</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;