"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetProjectsQuery } from "@/state/api";
import {
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  Calendar,
  ChartAreaIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  Heart,
  Home,
  Layers3,
  LockIcon,
  Percent,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

type SidebarProps = {
  userType: "manager" | "user";
};

const Sidebar = ({ userType }: SidebarProps) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const { data: projects } = useGetProjectsQuery();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const navLinks =
  userType === "manager"
    ? [
        { icon: Home, label: "Vue Generale", href: "/managers/home" },
        { icon: Layers3, label: "Devis", href: "/managers/devis" },
        { icon: Search, label: "Recherche", href: "/managers/search" },
        { icon: Settings, label: "Paramètres", href: "/managers/settings" },
        { icon: User, label: "Ressources", href: "/managers/users" },
        { icon: Users, label: "Équipes", href: "/managers/teams" },
        { icon: Users, label: "Disponibilité", href: "/managers/availabilitycalendar" },
        { icon: Percent, label: "Liste des Taux", href: "/managers/production-rates" },
        { icon: ChartAreaIcon, label: "Statistiques", href: "/managers/monthlyproductionDashboard" },
        { icon: Calendar, label: "Calendrier", href: "/managers/timeline" },
      ]
    : [
        { icon: Home, label: "Vue Generale", href: "/users/home" },
        { icon: Layers3, label: "Devis", href: "/users/devis" },
        { icon: Search, label: "Recherche", href: "/users/search" },
        { icon: Settings, label: "Paramètres", href: "/users/settings" },
        { icon: Users, label: "Équipes", href: "/users/teams" },
        { icon: ChartAreaIcon, label: "Statistiques", href: "/users/monthlyproductionDashboard" },
        { icon: Calendar, label: "Calendrier", href: "/users/timeline" },
      ];

  const sidebarClassNames = `fixed flex flex-col h-full justify-between shadow-xl
    transition-all duration-300 z-40 dark:bg-black overflow-y-auto bg-white
    ${isSidebarCollapsed ? "w-20" : "w-64"}
  `;

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-full w-full flex-col justify-start">
        {/* Header */}
        <div className="z-50 flex min-h-[56px] items-center justify-between bg-white px-6 pt-3 dark:bg-black">
          {!isSidebarCollapsed && (
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {userType === "manager" ? "Vue Manager" : "Vue Utilisateur"}
            </div>
          )}
          <button
            className="p-2 hover:bg-gray-100 rounded-md"
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            {isSidebarCollapsed ? (
              <X className="h-6 w-6 text-gray-800 dark:text-white" />
            ) : (
              <X className="h-6 w-6 text-gray-800 dark:text-white" />
            )}
          </button>
        </div>

        {/* Team Section */}
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
            <div>
              <h3 className="text-md font-bold tracking-wide dark:text-gray-200">
                GRDF:
                <p className="text-xs text-gray-500">Gaz Réseau Distribution France</p>
              </h3>
              <div className="mt-1 flex items-start gap-2">
                <LockIcon className="mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400" />
                <p className="text-xs text-gray-500">Privé</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="z-10 w-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                isCollapsed={isSidebarCollapsed}
                isActive={isActive}
              />
            );
          })}
        </nav>
{/* Collapsible Sections */}
{!isSidebarCollapsed && (
  <>
    {/* Projects Section - Only for Managers */}
    {userType === "manager" && (
      <>
        <button
          onClick={() => setShowProjects((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Applications</span>
          {showProjects ? <ChevronUp /> : <ChevronDown />}
        </button>
        {showProjects &&
          projects?.map((project) => (
            <SidebarLink
              key={project.id}
              icon={Briefcase}
              label={project.name}
              href={`/managers/projects/${project.id}`}
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === `/managers/projects/${project.id}`}
            />
          ))}
      </>
    )}

    {/* Priorities Section - Only for Managers */}
    {userType === "manager" && (
      <>
        <button
          onClick={() => setShowPriority((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Priorités</span>
          {showPriority ? <ChevronUp /> : <ChevronDown />}
        </button>
        {showPriority && (
          <>
            <SidebarLink
              icon={Heart}
              label="Urgent"
              href="/managers/priority/urgent"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === "/managers/priority/urgent"}
            />
            <SidebarLink
              icon={ShieldAlert}
              label="Élevé"
              href="/managers/priority/high"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === "/managers/priority/heigh"}


            />
            <SidebarLink
              icon={AlertTriangle}
              label="Moyen"
              href="/managers/priority/medium"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === "/managers/priority/medium"}
            />
            <SidebarLink icon={AlertOctagon} 
            label="Faible"
             href="/managers/priority/low"
             isCollapsed={isSidebarCollapsed}
             isActive={pathname === "/managers/priority/lowh"} />

            <SidebarLink
              icon={Layers3}
              label="En attente"
              href="/managers/priority/backlog"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === "/managers/priority/backlog"}
            />
          </>
        )}
      </>
    )}
{userType === "user" && (
  <>
    <button
      onClick={() => setShowProjects((prev) => !prev)}
      className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
    >
      <span>Applications</span>
      {showProjects ? <ChevronUp /> : <ChevronDown />}
    </button>
    {showProjects &&
      projects?.map((project) => (
        <SidebarLink
          key={project.id}
          icon={Briefcase}
          label={project.name}
          href={`/users/projects/${project.id}`}
          isCollapsed={isSidebarCollapsed}
          isActive={pathname === `/users/projects/${project.id}`}
        />
      ))}
  </>
)}
  </>
)}

{userType === "user" && (
      <>
        <button
          onClick={() => setShowPriority((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Priorités</span>
          {showPriority ? <ChevronUp /> : <ChevronDown />}
        </button>
        {showPriority && (
          <>
            <SidebarLink
              icon={Heart}
              label="Urgent"
              href="/users/priority/urgent"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === "/users/priority/urgent"}
            />
            <SidebarLink
              icon={ShieldAlert}
              label="Élevé"
              href="/users/priority/high"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === "/users/priority/heigh"}


            />
            <SidebarLink
              icon={AlertTriangle}
              label="Moyen"
              href="/users/priority/medium"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === "/users/managers/priority/medium"}
            />
            <SidebarLink icon={AlertOctagon} 
            label="Faible"
             href="/users/priority/low"
             isCollapsed={isSidebarCollapsed}
             isActive={pathname === "/users/priority/lowh"} />

            <SidebarLink
              icon={Layers3}
              label="En attente"
              href="/users/priority/backlog"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === "/users/priority/backlog"}
            />
          </>
        )}
      </>
    )}
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  isActive,
}: SidebarLinkProps) => {
  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
          isActive ? "bg-gray-100 dark:bg-gray-600" : ""
        } ${isCollapsed ? "justify-center px-4" : "justify-start px-8"} py-3`}
      >
        {isActive && !isCollapsed && (
          <div className="absolute left-0 top-0 h-full w-[5px] bg-blue-200" />
        )}

        <Icon
          className={`h-6 w-6 ${
            isActive
              ? "text-blue-600 dark:text-white"
              : "text-gray-800 dark:text-gray-100"
          }`}
        />
        {!isCollapsed && (
          <span
            className={`font-medium ${
              isActive
                ? "text-blue-600 dark:text-white"
                : "text-gray-800 dark:text-gray-100"
            }`}
          >
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

export default Sidebar;