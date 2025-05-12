"use client";

import React, { useEffect, useState } from "react";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import StoreProvider, { useAppSelector } from "../redux";
import Sidebar from "@/components/SideBar";
import Navbar from "@/components/Navbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (authUser) {
      const userRole = (authUser.userRole as String).toLowerCase();
      const isValidPath = userRole === "manager" 
        ? pathname.startsWith("/managers")
        : pathname.startsWith("/users");

      if (!isValidPath) {
        router.push(userRole === "manager" ? "/managers/home" : "/users/home");
      }
      setIsLoading(false);
    }
  }, [authUser, router, pathname]);

  if (authLoading || isLoading) return <div>Loading...</div>;
  if (!authUser?.userRole) return null;

  return (
    <div className={`flex min-h-screen w-full ${isDarkMode ? "dark bg-dark-bg" : "bg-gray-50"}`}>
      <Sidebar         userType={(authUser.userRole as String).toLowerCase() as "manager" | "user"} 
 />
      <div className={`flex w-full flex-col ${isSidebarCollapsed ? "" : "md:pl-64"}`}>
        <Navbar />
        <main className="flex-grow p-4 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreProvider>
    <DashboardLayout>{children}</DashboardLayout>
  </StoreProvider>
);

export default DashboardWrapper;