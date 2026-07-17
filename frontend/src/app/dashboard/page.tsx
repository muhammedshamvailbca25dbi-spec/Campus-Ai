"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { AdvisorDashboard } from "@/components/dashboard/AdvisorDashboard";
import { OfficerDashboard } from "@/components/dashboard/OfficerDashboard";
import { CollegeAdminDashboard } from "@/components/dashboard/CollegeAdminDashboard";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { role, user, isLoading } = useApp();

  const renderDashboard = () => {
    switch (role) {
      case "student":
        return <StudentDashboard />;
      case "class_advisor":
        return <AdvisorDashboard />;
      case "department_officer":
        return <OfficerDashboard />;
      case "college_admin":
        return <CollegeAdminDashboard />;
      case "super_admin":
        return <SuperAdminDashboard />;
      default:
        return (
          <div className="text-center py-20">
            <p className="text-slate-400">Invalid user role selected.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Loading skeleton wrapper */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse py-12">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-2xl mt-8" />
          </div>
        ) : (
          <div>
            {/* Header info showing logged user context */}
            {user && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[10px] font-semibold text-indigo-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Authorized Session: {user.name} ({user.email})</span>
              </div>
            )}
            
            {renderDashboard()}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
