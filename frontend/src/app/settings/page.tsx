"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Mail, 
  MessageSquare,
  Lock,
  Database
} from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme, addNotification } = useApp();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);

  const saveSettings = () => {
    addNotification("Configuration settings updated successfully.");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-16 sm:py-24">
        
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 shadow-2xl">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Settings className="h-6.5 w-6.5 text-indigo-500" />
              <span>Platform Settings</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure system defaults, alert subscriptions, and security passwords.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Dark Mode toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-900/10">
              <div className="space-y-1.5 flex-1 pr-4">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  {theme === "light" ? <Sun className="h-4 w-4 text-indigo-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
                  Theme Mode
                </span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Toggle between high-contrast dark mode and clean light mode interfaces.
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-lg bg-indigo-650 hover:bg-indigo-550 border border-indigo-500 text-xs font-bold text-white transition"
              >
                Switch to {theme === "light" ? "Dark" : "Light"} Mode
              </button>
            </div>

            {/* Notification alert states */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-500" />
                Alert Subscriptions
              </span>
              
              <div className="space-y-3.5 pl-6">
                
                {/* Email alerts */}
                <div className="flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-250 flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-slate-500" /> Email Notifications
                    </span>
                    <p className="text-[10px] text-slate-400">Send an email summary immediately when a ticket changes status.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => {
                      setEmailAlerts(e.target.checked);
                      saveSettings();
                    }}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {/* SMS alerts */}
                <div className="flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-250 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-slate-500" /> WhatsApp & SMS Notifications
                    </span>
                    <p className="text-[10px] text-slate-400">Receive live push alerts on WhatsApp for urgent classifications.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => {
                      setSmsAlerts(e.target.checked);
                      saveSettings();
                    }}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

              </div>
            </div>

            {/* Platform backend information */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-500" />
                System Integration
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/20 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                  <span className="text-[10px] text-slate-550 font-bold uppercase block">API Endpoints</span>
                  <p className="font-bold text-slate-300 mt-1 font-mono">http://127.0.0.1:8000/api</p>
                </div>
                <div className="bg-slate-900/20 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                  <span className="text-[10px] text-slate-550 font-bold uppercase block">Database Engine</span>
                  <p className="font-bold text-slate-300 mt-1 font-mono">SQLite (SQLAlchemy Core)</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
