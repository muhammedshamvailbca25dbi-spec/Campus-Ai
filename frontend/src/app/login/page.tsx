"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp, UserRole, MOCK_EMAILS } from "@/context/AppContext";
import { GraduationCap, Globe, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setRole, isLoading } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await setRole(selectedRole);
    router.push("/dashboard");
  };

  const rolesList: { role: UserRole; title: string; desc: string; user: string }[] = [
    { role: "student", title: "Student Portal", desc: "Submit complaints and track resolution timeline.", user: "Alex Mercer (ECT CS)" },
    { role: "class_advisor", title: "Class Advisor", desc: "Verify class tickets and advise students.", user: "Prof. Evelyn Vance" },
    { role: "department_officer", title: "Department Officer", desc: "Investigate and resolve assigned department tickets.", user: "Prof. Alan Smith" },
    { role: "college_admin", title: "College Admin", desc: "Oversee department stats and manage officers.", user: "Dean Richard Fowler" },
    { role: "super_admin", title: "Super Admin", desc: "Manage multi-college instances and platform logs.", user: "Dr. Sarah Jenkins" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      
      <div className="w-full max-w-lg space-y-8 glass-panel p-8 sm:p-10 rounded-2xl border border-slate-800 shadow-2xl">
        
        {/* LOGO */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Welcome to CampusAI
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Secure Role-Based Access Control Grievance Panel
          </p>
        </div>

        {/* MOCK LOGIN OPTIONS */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400">Select Sandbox User Context</label>
            <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {rolesList.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    selectedRole === item.role
                      ? "bg-indigo-950/40 border-indigo-500/80 shadow-indigo-500/10"
                      : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${selectedRole === item.role ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-500"}`}>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold capitalize ${selectedRole === item.role ? "text-indigo-400" : "text-slate-200"}`}>{item.title}</p>
                      <span className="text-[9px] text-slate-500 font-mono">{MOCK_EMAILS[item.role]}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{item.desc}</p>
                    <p className="text-[9px] text-indigo-400/80 font-medium mt-1">Logged as: {item.user}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-800/80 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 py-3 text-xs font-bold transition shadow-lg hover:shadow-white/5 active:scale-[0.98] disabled:opacity-50"
            >
              <Globe className="h-4.5 w-4.5 text-blue-500" />
              {isLoading ? "Signing in with Google..." : "Sign in with Google OAuth"}
            </button>

            <Link
              href="/"
              className="block text-center text-xs text-slate-500 hover:text-slate-300 transition mt-4"
            >
              ← Back to Landing Page
            </Link>
          </div>

        </form>

      </div>
    </div>
  );
}
