"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp, UserRole } from "@/context/AppContext";
import { 
  GraduationCap, 
  Sun, 
  Moon, 
  ChevronDown, 
  Bell, 
  User, 
  LogOut, 
  Compass, 
  MessageSquare,
  FileText,
  Settings as SettingsIcon,
  ShieldCheck,
  Activity,
  Menu,
  X
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { role, setRole, user, theme, toggleTheme, notifications } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setIsRoleDropdownOpen(false);
    router.push("/dashboard");
  };

  const getLinksForRole = (currentRole: UserRole) => {
    const base = [
      { name: "Landing", href: "/" }
    ];
    
    if (currentRole === "student") {
      return [
        ...base,
        { name: "Dashboard", href: "/dashboard" },
        { name: "My Complaints", href: "/complaints" },
        { name: "AI Assistant", href: "/ai-assistant" },
        { name: "Contact", href: "/contact" }
      ];
    } else if (currentRole === "class_advisor") {
      return [
        ...base,
        { name: "Advisor Panel", href: "/dashboard" },
        { name: "Grievances", href: "/complaints" }
      ];
    } else if (currentRole === "department_officer") {
      return [
        ...base,
        { name: "Officer Panel", href: "/dashboard" },
        { name: "Assigned Tickets", href: "/complaints" }
      ];
    } else if (currentRole === "college_admin") {
      return [
        ...base,
        { name: "Admin Dashboard", href: "/dashboard" },
        { name: "Colleges", href: "/complaints" }
      ];
    } else if (currentRole === "super_admin") {
      return [
        ...base,
        { name: "Super Admin", href: "/dashboard" }
      ];
    }
    return base;
  };

  const navLinks = getLinksForRole(role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-950/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-6 w-6 transform group-hover:rotate-6 transition-transform" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              CampusAI
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-indigo-500 ${
                    isActive ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CONTROLS */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* SANDBOX ROLE SWITCHER */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              <span className="capitalize">{role.replace("_", " ")}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black/5 z-50 p-1.5">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Select User Context
                </div>
                {(["student", "class_advisor", "department_officer", "college_admin", "super_admin"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors capitalize ${
                      role === r 
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {r.replace("_", " ")}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition"
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>

          {/* NOTIFICATION BELL */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 p-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 px-2 font-semibold">
                  <span>Activity Logs</span>
                  <span className="text-[10px] text-indigo-500 font-normal">Live</span>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {notifications.length === 0 ? (
                    <div className="text-slate-400 py-6 text-center">No recent alerts.</div>
                  ) : (
                    notifications.map((msg, i) => (
                      <div key={i} className="px-3 py-2 border-b border-slate-50 dark:border-slate-800/40 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 rounded">
                        {msg}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PROFILE DROPDOWN */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 p-1.5 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800/60 transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 p-1.5">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      My Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <SettingsIcon className="h-4 w-4 text-slate-400" />
                      Account Settings
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5">
                    <Link
                      href="/login"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition"
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-4">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col gap-3">
            {/* MOBILE ROLE SWITCHER */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-3">Role Context</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(["student", "class_advisor", "department_officer", "college_admin", "super_admin"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      handleRoleChange(r);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-lg capitalize text-center ${
                      role === r
                        ? "bg-indigo-600 text-white font-semibold"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {r.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
