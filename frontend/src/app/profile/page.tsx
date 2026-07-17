"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { User, ShieldCheck, Mail, Building, Briefcase } from "lucide-react";

export default function ProfilePage() {
  const { user } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-16 sm:py-24">
        
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 shadow-2xl relative">
          
          {/* Cover glow */}
          <div className="absolute top-0 left-1/2 -z-10 h-32 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
          
          {/* Avatar Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-extrabold text-3xl shadow-lg shadow-indigo-500/15 animate-pulse">
              {user?.name.charAt(0) || "U"}
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{user?.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit capitalize">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{user?.role.replace("_", " ")}</span>
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            
            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-500" /> Email Address
              </span>
              <p className="text-slate-700 dark:text-slate-200 bg-slate-900/10 p-3 border border-slate-200 dark:border-slate-850 rounded-xl font-medium">
                {user?.email}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Building className="h-4 w-4 text-slate-500" /> College Affiliation
              </span>
              <p className="text-slate-700 dark:text-slate-200 bg-slate-900/10 p-3 border border-slate-200 dark:border-slate-850 rounded-xl font-medium">
                {user?.college?.name || "Global Administrator"}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-slate-500" /> Assigned Department
              </span>
              <p className="text-slate-700 dark:text-slate-200 bg-slate-900/10 p-3 border border-slate-200 dark:border-slate-850 rounded-xl font-medium">
                {user?.department || "Administrative Division"}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-500" /> User UID
              </span>
              <p className="text-slate-700 dark:text-slate-200 bg-slate-900/10 p-3 border border-slate-200 dark:border-slate-850 rounded-xl font-mono">
                ECT-USR-00{user?.id || 1}
              </p>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
