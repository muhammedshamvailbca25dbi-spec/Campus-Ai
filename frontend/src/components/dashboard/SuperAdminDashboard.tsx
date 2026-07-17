"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp, UserRole } from "@/context/AppContext";
import { 
  ShieldAlert, 
  Building2, 
  Users, 
  Activity, 
  CheckCircle,
  Plus,
  Terminal,
  Server,
  Trash2,
  Edit2,
  UserPlus,
  Lock,
  Search,
  Mic,
  MicOff,
  Bot,
  Sparkles,
  RefreshCw,
  X,
  Volume2,
  AlertCircle
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface College {
  id: number;
  name: string;
  code: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  department?: string;
  college_id?: number;
  status: string;
}

interface LogEntry {
  id: number;
  msg: string;
  time: string;
  level: "INFO" | "SUCCESS" | "AUTH" | "WARNING" | "ERROR";
}

export const SuperAdminDashboard: React.FC = () => {
  const { user, addNotification } = useApp();
  const [colleges, setColleges] = useState<College[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [globalLogs, setGlobalLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "colleges" | "admins" | "roles" | "telemetry">("overview");
  
  // Selected College for Map filter
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Telemetry Metrics (Simulated Live)
  const [cpuUsage, setCpuUsage] = useState(24);
  const [ramUsage, setRamUsage] = useState(58);
  const [dbLatency, setDbLatency] = useState(12);
  const [apiRequestsCount, setApiRequestsCount] = useState(14820);
  const [telemetryHistory, setTelemetryHistory] = useState<{ time: string; CPU: number; RAM: number; Latency: number }[]>([]);

  // Modals & Form States
  const [collegeForm, setCollegeForm] = useState({ name: "", code: "", latitude: 37.7749, longitude: -122.4194 });
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [editingCollegeId, setEditingCollegeId] = useState<number | null>(null);

  const [adminForm, setAdminForm] = useState({ name: "", email: "", college_id: "" });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);

  // Platform Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, msg: "Database uvicorn server successfully bound to http://127.0.0.1:8000", time: "22:50:12", level: "INFO" },
    { id: 2, msg: "AI Grievance redressing neural model loaded", time: "22:50:18", level: "SUCCESS" },
    { id: 3, msg: "Multi-tenant routing engine initialized for dynamic namespaces", time: "22:50:25", level: "INFO" },
    { id: 4, msg: "Super Admin Dr. Sarah Jenkins session authenticated", time: "23:00:10", level: "AUTH" },
  ]);

  // Voice Assistant state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("I am online. Click the microphone and say: 'focus ect', 'reset map', or 'show admins'.");
  const [showVoicePanel, setShowVoicePanel] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const colRes = await fetch("http://127.0.0.1:8000/api/colleges");
      if (colRes.ok) {
        const colData = await colRes.json();
        setColleges(colData);
      }

      const userRes = await fetch("http://127.0.0.1:8000/api/users");
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData);
      }

      const logRes = await fetch("http://127.0.0.1:8000/api/action-logs");
      if (logRes.ok) {
        const logData = await logRes.json();
        setGlobalLogs(logData);
      }
    } catch (err) {
      console.warn("Failed to fetch dashboard data from server", err);
      // Fallback Seed Data
      setColleges([
        { id: 1, name: "Engineering College of Technology", code: "ECT", latitude: 37.7749, longitude: -122.4194, created_at: new Date().toISOString() },
        { id: 2, name: "School of Management & Business", code: "SMB", latitude: 34.0522, longitude: -118.2437, created_at: new Date().toISOString() }
      ]);
      setUsers([
        { id: 1, email: "superadmin@campusai.com", name: "Dr. Sarah Jenkins", role: "super_admin", status: "active" },
        { id: 2, email: "ectadmin@campusai.com", name: "Dean Richard Fowler", role: "college_admin", college_id: 1, status: "active" },
        { id: 3, email: "smbadmin@campusai.com", name: "Dean Beatrice Vance", role: "college_admin", college_id: 2, status: "active" },
        { id: 4, email: "hostelofficer@campusai.com", name: "Prof. Alan Smith", role: "department_officer", department: "Facilities & Hostel", college_id: 1, status: "active" },
        { id: 5, email: "advisor@campusai.com", name: "Prof. Evelyn Vance", role: "class_advisor", department: "Computer Science", college_id: 1, status: "active" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CPU and Memory live ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => {
        const next = Math.max(10, Math.min(95, prev + (Math.random() * 12 - 6)));
        return Math.round(next);
      });
      setRamUsage((prev) => {
        const next = Math.max(50, Math.min(85, prev + (Math.random() * 2 - 1)));
        return Math.round(next);
      });
      setDbLatency((prev) => {
        const next = Math.max(5, Math.min(45, prev + (Math.random() * 6 - 3)));
        return Math.round(next);
      });
      setApiRequestsCount((prev) => prev + Math.floor(Math.random() * 3));

      // Telemetry graph history
      setTelemetryHistory((prev) => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = {
          time: now,
          CPU: cpuUsage,
          RAM: ramUsage,
          Latency: dbLatency
        };
        const next = [...prev, entry];
        if (next.length > 15) next.shift();
        return next;
      });

      // System Log simulation
      if (Math.random() > 0.8) {
        const randomLogs = [
          { msg: "API Gateway routed user telemetry heartbeat payload", level: "INFO" as const },
          { msg: "Complaint status cache verified with 0 latency invalidation", level: "SUCCESS" as const },
          { msg: "Telemetry garbage collector cleaned memory objects (14MB reclaimed)", level: "INFO" as const },
          { msg: "AI model recommendation query latency optimal: 140ms", level: "SUCCESS" as const },
          { msg: "Warning: High request volume detected from 127.0.0.1", level: "WARNING" as const }
        ];
        const log = randomLogs[Math.floor(Math.random() * randomLogs.length)];
        const time = new Date().toTimeString().split(" ")[0];
        setLogs((prev) => [
          ...prev,
          { id: prev.length + 1, msg: log.msg, time, level: log.level }
        ].slice(-50)); // cap at 50 logs
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [cpuUsage, ramUsage, dbLatency]);

  // Scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Map Coordinates Converter for California outline
  // California bounds roughly: Lat: 32.5 to 42, Long: -124.5 to -114
  const convertCoordsToSvg = (lat: number, lon: number) => {
    const minLat = 32.2;
    const maxLat = 42.4;
    const minLon = -124.8;
    const maxLon = -113.8;

    const x = ((lon - minLon) / (maxLon - minLon)) * 340 + 30;
    const y = 380 - ((lat - minLat) / (maxLat - minLat)) * 340;
    return { x, y };
  };

  // CRUD Colleges
  const handleCollegeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingCollegeId) {
        res = await fetch(`http://127.0.0.1:8000/api/colleges/${editingCollegeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(collegeForm),
        });
      } else {
        res = await fetch("http://127.0.0.1:8000/api/colleges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(collegeForm),
        });
      }

      if (res.ok) {
        addNotification(editingCollegeId ? "College details updated successfully" : "New college provisioning completed.");
        setCollegeForm({ name: "", code: "", latitude: 37.7749, longitude: -122.4194 });
        setIsCollegeModalOpen(false);
        setEditingCollegeId(null);
        fetchData();
      }
    } catch (err) {
      console.warn(err);
      // Client-only mockup fallback
      if (editingCollegeId) {
        setColleges(colleges.map(c => c.id === editingCollegeId ? { ...c, ...collegeForm } : c));
      } else {
        setColleges([...colleges, { id: colleges.length + 1, ...collegeForm, created_at: new Date().toISOString() }]);
      }
      setIsCollegeModalOpen(false);
      setEditingCollegeId(null);
      addNotification("Saved college details (Sandbox Mode).");
    }
  };

  const handleEditCollege = (college: College) => {
    setEditingCollegeId(college.id);
    setCollegeForm({
      name: college.name,
      code: college.code,
      latitude: college.latitude || 37.7749,
      longitude: college.longitude || -122.4194
    });
    setIsCollegeModalOpen(true);
  };

  const handleDeleteCollege = async (id: number) => {
    if (!confirm("Are you sure you want to completely de-provision this college? All associated users will lose dashboard authorization.")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/colleges/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addNotification("College record removed.");
        fetchData();
      }
    } catch (err) {
      console.warn(err);
      setColleges(colleges.filter(c => c.id !== id));
      addNotification("Deleted college record (Sandbox Mode).");
    }
  };

  // CRUD Admins & User Roles
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: adminForm.name,
      email: adminForm.email,
      role: "college_admin",
      college_id: adminForm.college_id ? parseInt(adminForm.college_id) : undefined,
    };

    try {
      let res;
      if (editingAdminId) {
        res = await fetch(`http://127.0.0.1:8000/api/users/${editingAdminId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://127.0.0.1:8000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        addNotification(editingAdminId ? "College Admin details updated" : "Provisioned College Admin successfully");
        setAdminForm({ name: "", email: "", college_id: "" });
        setIsAdminModalOpen(false);
        setEditingAdminId(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.detail || "Error processing admin save");
      }
    } catch (err) {
      console.warn(err);
      if (editingAdminId) {
        setUsers(users.map(u => u.id === editingAdminId ? { ...u, ...payload, college_id: payload.college_id } : u));
      } else {
        setUsers([...users, { id: users.length + 1, ...payload, college_id: payload.college_id, status: "active" }]);
      }
      setIsAdminModalOpen(false);
      setEditingAdminId(null);
      addNotification("Saved College Admin (Sandbox Mode).");
    }
  };

  const handleEditAdmin = (admin: UserProfile) => {
    setEditingAdminId(admin.id);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      college_id: admin.college_id ? admin.college_id.toString() : "",
    });
    setIsAdminModalOpen(true);
  };

  const handleToggleSuspend = async (admin: UserProfile) => {
    const nextStatus = admin.status === "suspended" ? "active" : "suspended";
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${admin.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        addNotification(`${admin.name} is now ${nextStatus.toUpperCase()}`);
        fetchData();
      }
    } catch (err) {
      console.warn(err);
      setUsers(users.map(u => u.id === admin.id ? { ...u, status: nextStatus } : u));
      addNotification(`Toggled status to ${nextStatus} (Sandbox Mode).`);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to completely remove this user from the directory?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addNotification("User record successfully deleted.");
        fetchData();
      }
    } catch (err) {
      console.warn(err);
      setUsers(users.filter(u => u.id !== id));
      addNotification("Deleted user (Sandbox Mode).");
    }
  };

  const handleRoleChange = async (userId: number, nextRole: UserRole) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) {
        addNotification(`Modified role to ${nextRole.toUpperCase()}`);
        fetchData();
      }
    } catch (err) {
      console.warn(err);
      setUsers(users.map(u => u.id === userId ? { ...u, role: nextRole } : u));
      addNotification(`Modified role to ${nextRole} (Sandbox Mode).`);
    }
  };

  // Voice Assistant commands handler
  const handleVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    setVoiceTranscript(rawText);
    
    if (text.includes("focus ect") || text.includes("focus engineering")) {
      setSelectedCollegeId(1);
      setVoiceResponse("Focused map on Engineering College of Technology (ECT) in San Francisco.");
      addNotification("Voice command: Focusing ECT");
    } else if (text.includes("focus smb") || text.includes("focus school of management")) {
      setSelectedCollegeId(2);
      setVoiceResponse("Focused map on School of Management & Business (SMB) in Los Angeles.");
      addNotification("Voice command: Focusing SMB");
    } else if (text.includes("reset map") || text.includes("clear map") || text.includes("clear selection")) {
      setSelectedCollegeId(null);
      setVoiceResponse("Cleared college map selections. Viewing platform-wide summary statistics.");
      addNotification("Voice command: Reset map focus");
    } else if (text.includes("show colleges") || text.includes("go to colleges") || text.includes("view colleges")) {
      setActiveTab("colleges");
      setVoiceResponse("Navigating to the Colleges provisioning panel.");
    } else if (text.includes("show admins") || text.includes("go to admins") || text.includes("view admins")) {
      setActiveTab("admins");
      setVoiceResponse("Navigating to College Administrators database manager.");
    } else if (text.includes("show roles") || text.includes("go to roles") || text.includes("view roles")) {
      setActiveTab("roles");
      setVoiceResponse("Opening Roles & Permissions authorization grid.");
    } else if (text.includes("show telemetry") || text.includes("go to telemetry") || text.includes("view telemetry")) {
      setActiveTab("telemetry");
      setVoiceResponse("Opening CPU, memory, and database health telemetry screens.");
    } else if (text.includes("show overview") || text.includes("go to overview") || text.includes("view overview")) {
      setActiveTab("overview");
      setVoiceResponse("Returning to default Platform Overview dashboard and California map.");
    } else {
      setVoiceResponse(`Recognized: "${rawText}". No mapped dashboard command matches. Try speaking 'focus ect', 'reset map', or 'show telemetry'.`);
    }
  };

  const startVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Mock Speech recognition
      setIsListening(true);
      setVoiceResponse("Web Speech API not supported in this browser environment. Simulating voice transcription...");
      setTimeout(() => {
        const mockCommands = ["Focus ECT", "Reset map", "Show Telemetry", "Focus SMB", "Show Admins"];
        const randomCmd = mockCommands[Math.floor(Math.random() * mockCommands.length)];
        handleVoiceCommand(randomCmd);
        setIsListening(false);
      }, 2500);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
        setVoiceTranscript("Listening...");
        setVoiceResponse("Voice engine active. Speak clearly now.");
      };

      rec.onresult = (e: any) => {
        const trans = e.results[0][0].transcript;
        handleVoiceCommand(trans);
      };

      rec.onerror = (e: any) => {
        console.warn("Speech Recognition Error", e);
        setIsListening(false);
        setVoiceResponse("Error capturing speech. Please check microphone settings.");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (err) {
      console.warn(err);
      setIsListening(false);
    }
  };

  // Filter users based on query
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q);
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <span className="bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Super Admin</span>;
      case "college_admin":
        return <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/25 px-2 py-0.5 rounded text-[10px] font-bold">College Admin</span>;
      case "department_officer":
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Officer</span>;
      case "class_advisor":
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Advisor</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{role}</span>;
    }
  };

  // Dynamic focused college details
  const focusedCollege = colleges.find(c => c.id === selectedCollegeId);

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* VOICE FLOATING PANEL TOGGLE */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {showVoicePanel && (
          <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4 w-80 shadow-2xl space-y-3 animate-slide-up text-xs text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold flex items-center gap-1.5 text-indigo-400">
                <Bot className="h-4 w-4" /> AI Voice Assistant
              </span>
              <button onClick={() => setShowVoicePanel(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="bg-black/40 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono leading-normal min-h-12 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Transcript</span>
                <p className="italic text-slate-300">"{voiceTranscript || 'Waiting for speech...'}"</p>
              </div>

              <div className="bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-900/30 text-[11px] min-h-12 flex flex-col justify-between">
                <span className="text-[10px] text-indigo-400 uppercase tracking-widest block mb-1">Response</span>
                <p className="text-indigo-200">{voiceResponse}</p>
              </div>
            </div>

            {/* Simulated sound wave when listening */}
            {isListening && (
              <div className="flex justify-center items-center gap-1.5 py-2">
                <div className="w-1 bg-indigo-500 h-6 animate-pulse rounded-full" />
                <div className="w-1 bg-indigo-400 h-9 animate-pulse delay-75 rounded-full" />
                <div className="w-1 bg-indigo-500 h-7 animate-pulse delay-100 rounded-full" />
                <div className="w-1 bg-indigo-600 h-10 animate-pulse delay-150 rounded-full" />
                <div className="w-1 bg-indigo-400 h-5 animate-pulse delay-200 rounded-full" />
              </div>
            )}

            <button
              onClick={startVoiceListening}
              disabled={isListening}
              className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${
                isListening 
                  ? "bg-red-500/25 border-red-500/30 text-red-400" 
                  : "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 animate-bounce" /> Listening Speech...
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> Start Voice Commands
                </>
              )}
            </button>
          </div>
        )}

        <button
          onClick={() => setShowVoicePanel(!showVoicePanel)}
          className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white border border-indigo-500 hover:scale-105 active:scale-95 transition"
        >
          <Mic className="h-5 w-5" />
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Lock className="h-6 w-6 text-indigo-500" />
            <span>Super Admin Core Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure universities, audit platform database records, and monitor system resources in real-time.
          </p>
        </div>

        {/* Dynamic Voice helper prompt badge */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowVoicePanel(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs text-indigo-400 hover:bg-indigo-500/20 transition cursor-pointer"
          >
            <Volume2 className="h-4 w-4 animate-bounce" />
            <span className="font-semibold">Voice Control Active</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* TOP NAV TABS */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-850 pb-px text-xs font-semibold">
        {(["overview", "colleges", "admins", "roles", "telemetry"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3.5 px-5 border-b-2 capitalize transition whitespace-nowrap ${
              activeTab === tab
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW & MAP */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* METRICS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Colleges Provisioned</span>
                <Building2 className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-extrabold mt-2">{colleges.length}</p>
              <span className="text-[10px] text-indigo-400 font-medium mt-1">Multi-tenant isolation active</span>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-extrabold mt-2">{users.length * 12}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1">Including staff & students</span>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cluster Latency</span>
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-extrabold mt-2 text-emerald-400">{dbLatency} ms</p>
              <span className="text-[10px] text-emerald-500 font-semibold mt-1">SLA Health Optimal</span>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Operations Logged</span>
                <Bot className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-3xl font-extrabold mt-2">{apiRequestsCount / 10 | 0}</p>
              <span className="text-[10px] text-indigo-400 font-medium mt-1">NLP classification API load</span>
            </div>
          </div>

          {/* MAP AND SELECTED DETAILS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SVG CALIFORNIA INTERACTIVE MAP */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Interactive University Clusters Map</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Hover or select a regional pin to review metrics contextually.</p>
                  </div>
                  {selectedCollegeId && (
                    <button
                      onClick={() => setSelectedCollegeId(null)}
                      className="text-[10px] text-indigo-400 hover:underline font-bold"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="flex justify-center items-center bg-slate-950/40 rounded-xl p-4 border border-slate-200 dark:border-slate-850 h-[360px] relative overflow-hidden">
                  
                  {/* Grid Lines mockup */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

                  {/* Stylized California Outline Path */}
                  <svg viewBox="0 0 400 400" className="w-full h-full text-slate-800 stroke-slate-700/80 fill-slate-900/35 stroke-[1.5] max-w-[280px]">
                    {/* Stylized California coastline path representation */}
                    <path d="M 120,40 L 140,50 L 180,60 L 220,130 L 240,200 L 270,250 L 300,320 L 250,340 L 220,330 L 195,305 L 170,290 L 140,240 L 120,200 L 90,170 L 80,120 L 105,70 Z" />
                    
                    {/* State lines border indicator */}
                    <path d="M 120,40 L 80,120 M 180,60 L 220,130" strokeDasharray="3,3" strokeOpacity="0.4" />

                    {/* SVG markers for seeded colleges */}
                    {colleges.map((c) => {
                      const lat = c.latitude || 37.7749;
                      const lon = c.longitude || -122.4194;
                      // Mapping: California latitude range ~32.5 to 42.0. Longitude range ~-124 to -114.
                      // Adjust coordinate mapping offset for SVG viewbox bounding box constraints
                      const minLat = 32.5;
                      const maxLat = 42.0;
                      const minLon = -124.5;
                      const maxLon = -114.0;

                      const cx = 50 + ((lon - minLon) / (maxLon - minLon)) * 250;
                      const cy = 350 - ((lat - minLat) / (maxLat - minLat)) * 300;

                      const isSelected = selectedCollegeId === c.id;

                      return (
                        <g 
                          key={c.id} 
                          className="cursor-pointer"
                          onClick={() => setSelectedCollegeId(c.id)}
                        >
                          {/* Animated radar rings */}
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={isSelected ? 14 : 7} 
                            className={`fill-none ${isSelected ? "stroke-indigo-500 animate-ping" : "stroke-blue-500/40 animate-pulse"}`} 
                            strokeWidth={isSelected ? 2 : 1}
                          />
                          
                          {/* Center core point */}
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={isSelected ? 6 : 4} 
                            className={`${isSelected ? "fill-indigo-400 stroke-white" : "fill-blue-500 hover:fill-indigo-400 stroke-slate-900"} stroke-2 transition-colors`}
                          />

                          {/* Tag Overlay Label */}
                          <text 
                            x={cx + 10} 
                            y={cy + 4} 
                            className={`text-[9px] font-bold font-mono transition-opacity select-none ${isSelected ? "fill-indigo-400" : "fill-slate-500 opacity-60 hover:opacity-100"}`}
                          >
                            {c.code}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* SIDEBAR CONTEXT METRICS */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono block mb-1">
                  {selectedCollegeId ? "Filtered Cluster View" : "Unified Platform State"}
                </span>
                <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 truncate">
                  {focusedCollege ? focusedCollege.name : "All College Clusters combined"}
                </h3>
                
                <div className="space-y-4 mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
                  
                  <div className="bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-850 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Status Node</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-xs font-semibold text-slate-200">Production Node Online</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Admins</span>
                      <span className="text-sm font-extrabold text-slate-300">
                        {selectedCollegeId ? users.filter(u => u.college_id === selectedCollegeId && u.role === "college_admin").length : users.filter(u => u.role === "college_admin").length}
                      </span>
                    </div>

                    <div className="p-3 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Staff</span>
                      <span className="text-sm font-extrabold text-slate-300">
                        {selectedCollegeId ? users.filter(u => u.college_id === selectedCollegeId && u.role !== "college_admin").length : users.filter(u => u.role !== "college_admin" && u.role !== "super_admin").length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-indigo-950/15 p-4 rounded-xl border border-indigo-500/10">
                    <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono block">AI Triage Audit</span>
                    <p className="text-[11px] text-indigo-200/90 leading-relaxed mt-1">
                      {selectedCollegeId 
                        ? `Automatic NLP routing processes complaints filed for ${focusedCollege?.code}. Category classification metrics score 100% precision.`
                        : "Overall system runs 2 regional DB partitions. Automated ticket triage ensures routing within 1000ms."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {selectedCollegeId && (
                <button
                  onClick={() => setSelectedCollegeId(null)}
                  className="w-full mt-6 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800/70 text-slate-300 text-xs font-bold rounded-lg transition"
                >
                  Reset Map Filtering
                </button>
              )}
            </div>
          </div>

          {/* TELEMETRY CONSOLE & AUDIT TRAIL LOGS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-indigo-500" />
                Cluster Diagnostics
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Core CPU Usage</span>
                    <span className="font-bold text-indigo-400">{cpuUsage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${cpuUsage}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Memory Load (RAM)</span>
                    <span className="font-bold text-indigo-400">{ramUsage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${ramUsage}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Simulated Network SLA</span>
                    <span className="font-bold text-emerald-400">99.98% OK</span>
                  </div>
                  <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "99.9%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-indigo-500" />
                Audit Trail logs
              </h3>
              <div className="font-mono text-[10px] leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-850 h-[140px] overflow-y-auto space-y-2">
                {logs.slice(-10).map((log) => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-slate-500">[{log.time}]</span>
                    <span className={`font-bold ${
                      log.level === "SUCCESS" ? "text-emerald-500" :
                      log.level === "WARNING" ? "text-amber-500" :
                      log.level === "ERROR" ? "text-red-500" : "text-indigo-400"
                    }`}>
                      [{log.level}]
                    </span>
                    <span className="text-slate-350">{log.msg}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. COLLEGES TAB */}
      {activeTab === "colleges" && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 animate-fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4">
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-slate-200">Provision & Manage Colleges</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Provision multi-tenant college environments and set geographical mapping nodes.</p>
            </div>
            <button
              onClick={() => {
                setEditingCollegeId(null);
                setCollegeForm({ name: "", code: "", latitude: 37.7749, longitude: -122.4194 });
                setIsCollegeModalOpen(true);
              }}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition"
            >
              <Plus className="h-4.5 w-4.5" /> Provision College
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">College Name</th>
                  <th className="py-3 px-2">Code</th>
                  <th className="py-3 px-2">Latitude</th>
                  <th className="py-3 px-2">Longitude</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
                {colleges.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                    <td className="py-4 px-2 font-semibold text-slate-200">{c.name}</td>
                    <td className="py-4 px-2 font-mono text-indigo-400 font-bold text-[11px]">{c.code}</td>
                    <td className="py-4 px-2 text-slate-400">{c.latitude || "37.77"}</td>
                    <td className="py-4 px-2 text-slate-400">{c.longitude || "-122.41"}</td>
                    <td className="py-4 px-2 text-right space-x-2">
                      <button
                        onClick={() => handleEditCollege(c)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 rounded-lg transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCollege(c.id)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-400 rounded-lg transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. COLLEGE ADMINS TAB */}
      {activeTab === "admins" && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 animate-fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4">
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-slate-200">College Administrators Directory</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Add, edit, suspend, or delete administrator entities responsible for college branches.</p>
            </div>
            <button
              onClick={() => {
                setEditingAdminId(null);
                setAdminForm({ name: "", email: "", college_id: colleges[0]?.id.toString() || "" });
                setIsAdminModalOpen(true);
              }}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition"
            >
              <UserPlus className="h-4.5 w-4.5" /> Register Admin
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Admin Name</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">College Node</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
                {users.filter(u => u.role === "college_admin").map((a) => {
                  const col = colleges.find(c => c.id === a.college_id);
                  return (
                    <tr key={a.id} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                      <td className="py-4 px-2 font-semibold text-slate-200">{a.name}</td>
                      <td className="py-4 px-2 text-slate-400">{a.email}</td>
                      <td className="py-4 px-2 text-indigo-400 font-semibold">{col ? col.name : "N/A"}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.status === "suspended" 
                            ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}>
                          {a.status || "active"}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right space-x-2">
                        <button
                          onClick={() => handleToggleSuspend(a)}
                          className={`px-2.5 py-1 text-[10px] font-bold border rounded-lg transition ${
                            a.status === "suspended"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                          }`}
                        >
                          {a.status === "suspended" ? "Unsuspend" : "Suspend"}
                        </button>
                        <button
                          onClick={() => handleEditAdmin(a)}
                          className="p-1.5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 rounded-lg transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(a.id)}
                          className="p-1.5 border border-slate-200 dark:border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ROLES & PERMISSIONS TAB */}
      {activeTab === "roles" && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4 gap-4">
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-slate-200">Global RBAC Authorization Panel</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Modify granular directory roles across students, advisors, officers, and admins.</p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-10 pr-4 py-2 w-full text-xs"
                placeholder="Search user name or email..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">User Entity</th>
                  <th className="py-3 px-2">Email Address</th>
                  <th className="py-3 px-2">Active Authorization Level</th>
                  <th className="py-3 px-2 text-right">Switch Access Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                    <td className="py-4 px-2 font-semibold text-slate-200">{u.name}</td>
                    <td className="py-4 px-2 text-slate-400 font-mono text-[11px]">{u.email}</td>
                    <td className="py-4 px-2">{getRoleBadge(u.role)}</td>
                    <td className="py-4 px-2 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="glass-input text-[11px] p-1.5 bg-slate-950 font-bold text-slate-300 outline-none max-w-[150px]"
                      >
                        <option value="student">Student</option>
                        <option value="class_advisor">Class Advisor</option>
                        <option value="department_officer">Department Officer</option>
                        <option value="college_admin">College Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. DIAGNOSTICS & TELEMETRY TAB */}
      {activeTab === "telemetry" && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Health parameters widgets */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-2">Active Health Node</h3>
                
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-400">Database Engine</span>
                    <span className="font-bold text-emerald-400">SQLite (3.x) Operational</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-400">NLP Classifier Sandbox</span>
                    <span className="font-bold text-emerald-400">Stanford-NLP Active</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-400">Voice Recognition Integration</span>
                    <span className="font-bold text-indigo-400">Web Speech API</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-400">Pending System Exceptions</span>
                    <span className="font-bold text-emerald-400">0 critical errors</span>
                  </div>
                </div>
              </div>

              {/* Stress indicators */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-2">Operational Stress Rates</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block">CPU</span>
                    <span className="text-sm font-extrabold text-indigo-400 mt-1 block">{cpuUsage}%</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block">RAM</span>
                    <span className="text-sm font-extrabold text-indigo-400 mt-1 block">{ramUsage}%</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block">PING</span>
                    <span className="text-sm font-extrabold text-emerald-400 mt-1 block">{dbLatency}ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE RECHARTS GRAPH */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Diagnostics Telemetry Streams (Live)</h3>
              <div className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: "#0b0f19", borderColor: "#1f2937" }} />
                    <Area type="monotone" dataKey="CPU" stroke="#6366f1" fillOpacity={1} fill="url(#colorCpu)" name="CPU Usage (%)" />
                    <Area type="monotone" dataKey="Latency" stroke="#10b981" fillOpacity={1} fill="url(#colorLat)" name="Latency (ms)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* College provision modal */}
      {isCollegeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200">
                {editingCollegeId ? "Update College Cluster" : "Provision College Cluster"}
              </h3>
              <button onClick={() => setIsCollegeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCollegeSubmit} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">College Name</label>
                <input
                  type="text"
                  required
                  value={collegeForm.name}
                  onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                  className="glass-input p-3 w-full"
                  placeholder="e.g. UC Berkeley College of Engineering"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">College Code Name</label>
                <input
                  type="text"
                  required
                  value={collegeForm.code}
                  onChange={(e) => setCollegeForm({ ...collegeForm, code: e.target.value })}
                  className="glass-input p-3 w-full"
                  placeholder="e.g. UCB"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400">Latitude (State Pin)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={collegeForm.latitude}
                    onChange={(e) => setCollegeForm({ ...collegeForm, latitude: parseFloat(e.target.value) })}
                    className="glass-input p-3 w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400">Longitude (State Pin)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={collegeForm.longitude}
                    onChange={(e) => setCollegeForm({ ...collegeForm, longitude: parseFloat(e.target.value) })}
                    className="glass-input p-3 w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-95 transition"
              >
                {editingCollegeId ? "Save Configurations" : "Provision Cluster"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin creation modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200">
                {editingAdminId ? "Edit College Admin Details" : "Register College Administrator"}
              </h3>
              <button onClick={() => setIsAdminModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="glass-input p-3 w-full"
                  placeholder="e.g. Dean Beatrice Vance"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="glass-input p-3 w-full"
                  placeholder="e.g. dean.vance@campusai.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">Assigned College Tenant</label>
                <select
                  value={adminForm.college_id}
                  onChange={(e) => setAdminForm({ ...adminForm, college_id: e.target.value })}
                  className="glass-input p-3 w-full bg-slate-950 text-slate-300 font-bold outline-none"
                >
                  <option value="">Select College</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-95 transition"
              >
                {editingAdminId ? "Save Admin Data" : "Provision Administrator"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
