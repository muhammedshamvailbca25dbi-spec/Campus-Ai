"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            CampusAI Helpdesk
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} CampusAI Inc. Built for modern student welfare and grievance management.
        </p>

        <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/about" className="hover:text-indigo-500 transition">About</Link>
          <Link href="/features" className="hover:text-indigo-500 transition">Features</Link>
          <Link href="/contact" className="hover:text-indigo-500 transition">Support</Link>
        </div>

      </div>
    </footer>
  );
};
