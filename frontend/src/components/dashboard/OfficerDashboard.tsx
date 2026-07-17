"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  ClipboardList, 
  RotateCw, 
  CheckCircle, 
  AlertTriangle,
  MessageSquare,
  Sparkles,
  User,
  ArrowRight,
  TrendingUp,
  Sliders,
  Send,
  CheckSquare,
  Square,
  Users
} from "lucide-react";

interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  urgency: string;
  ai_summary?: string;
  ai_urgency_reason?: string;
  ai_recommendations?: string;
  student: {
    name: string;
    email: string;
    department?: string;
  };
  created_at: string;
}

export const OfficerDashboard: React.FC = () => {
  const { user, addNotification } = useApp();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Actions
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Board Filter Tab
  const [boardTab, setBoardTab] = useState<"awaiting" | "investigating" | "resolved" | "all">("awaiting");

  // Recommendation Checklist State (mapped by complaintId -> recommendationIndex -> checked)
  const [checklists, setChecklists] = useState<Record<string, boolean>>({});

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/complaints?role=department_officer&user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
        if (data.length > 0) {
          // Keep active ticket selected if it's still in the list
          const activeId = selectedComplaint?.id;
          const found = data.find((c: Complaint) => c.id === activeId);
          setSelectedComplaint(found || data[0]);
        } else {
          setSelectedComplaint(null);
        }
      }
    } catch (err) {
      console.warn(err);
      // Fallback local seed data
      setComplaints([
        {
          id: 101,
          title: "Broken water heater in Hostel Block A room 302",
          description: "The hot water heater is completely broken and leaking water on the floor. It has been cold for 3 days and there's a risk of water damage. Please fix it immediately.",
          category: "facilities",
          status: "advisor_reviewed",
          urgency: "high",
          ai_summary: "Student reports broken hot water heater leaking in Block A Room 302.",
          ai_urgency_reason: "High priority due to leaking water and risk of property damage.",
          ai_recommendations: "Inspect room immediately, Contact Hostel Warden, Dispatch plumber, Order parts",
          student: { name: "Alex Mercer", email: "student@campusai.com", department: "Computer Science" },
          created_at: new Date().toISOString()
        },
        {
          id: 102,
          title: "Grading error on Algorithms Midterm exam",
          description: "My midterm grade was entered as 45 instead of 85. I have the physical graded paper showing 85/100 signed by the TA.",
          category: "academic",
          status: "officer_investigating",
          urgency: "medium",
          ai_summary: "Student reports midterm exam grade input discrepancy (45 vs 85).",
          ai_urgency_reason: "Medium priority. Impact on academic records, target resolution within 48h.",
          ai_recommendations: "Consult Department Head, Verify student records, Meet with course TA",
          student: { name: "Alex Mercer", email: "student@campusai.com", department: "Computer Science" },
          created_at: new Date().toISOString()
        }
      ]);
      setSelectedComplaint(selectedComplaint || {
        id: 101,
        title: "Broken water heater in Hostel Block A room 302",
        description: "The hot water heater is completely broken and leaking water on the floor. It has been cold for 3 days and there's a risk of water damage. Please fix it immediately.",
        category: "facilities",
        status: "advisor_reviewed",
        urgency: "high",
        ai_summary: "Student reports broken hot water heater leaking in Block A Room 302.",
        ai_urgency_reason: "High priority due to leaking water and risk of property damage.",
        ai_recommendations: "Inspect room immediately, Contact Hostel Warden, Dispatch plumber, Order parts",
        student: { name: "Alex Mercer", email: "student@campusai.com", department: "Computer Science" },
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  // Load checklists from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("officer_checklists");
    if (saved) {
      try {
        setChecklists(JSON.parse(saved));
      } catch (err) {
        console.warn(err);
      }
    }
  }, []);

  const toggleChecklistItem = (complaintId: number, itemIndex: number, itemText: string) => {
    const key = `${complaintId}-${itemIndex}`;
    const nextChecklists = { ...checklists, [key]: !checklists[key] };
    setChecklists(nextChecklists);
    localStorage.setItem("officer_checklists", JSON.stringify(nextChecklists));
    
    addNotification(`AI Step: "${itemText}" marked as ${!checklists[key] ? "Completed" : "Pending"}`);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedComplaint || !user) return;
    setUpdatingStatus(newStatus);
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/complaints/${selectedComplaint.id}/status?user_id=${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        addNotification(`Grievance status updated to ${newStatus.toUpperCase()}`);
        fetchComplaints();
      }
    } catch (err) {
      console.warn(err);
      setComplaints(complaints.map(c => c.id === selectedComplaint.id ? { ...c, status: newStatus } : c));
      setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      addNotification(`Updated status to ${newStatus} (Sandbox Mode).`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-red-500 border border-red-500/20 bg-red-500/10";
      case "medium": return "text-amber-500 border border-amber-500/20 bg-amber-500/10";
      default: return "text-slate-400 border border-slate-850 bg-slate-850/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Awaiting Advisor</span>;
      case "advisor_reviewed":
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Awaiting Action</span>;
      case "officer_investigating":
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Investigating</span>;
      case "resolved":
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Resolved</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">{status}</span>;
    }
  };

  // Filter complaints based on Selected Board Tab
  const filteredComplaints = complaints.filter(c => {
    if (boardTab === "awaiting") return c.status === "advisor_reviewed" || c.status === "pending";
    if (boardTab === "investigating") return c.status === "officer_investigating";
    if (boardTab === "resolved") return c.status === "resolved";
    return true; // "all"
  });

  // Calculate active workload & gauge metrics
  const activeCount = complaints.filter(c => c.status !== "resolved").length;
  // Low load: <=2, Moderate load: 3-5, High load: >=6
  const getWorkloadStatus = (cnt: number) => {
    if (cnt <= 2) return { text: "Low Load", color: "text-emerald-500", progressColor: "bg-emerald-500", percent: 25 };
    if (cnt <= 5) return { text: "Moderate Load", color: "text-amber-500", progressColor: "bg-amber-500", percent: 60 };
    return { text: "High Load Risk", color: "text-red-500", progressColor: "bg-red-500", percent: 90 };
  };
  const workload = getWorkloadStatus(activeCount);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Department Officer Grievance Console</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Respond to student complaints, check off AI-recommended resolution logs, and update ticket investigations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COMPLAINTS PIPELINE BOARD */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            {/* WORKLOAD GAUGE */}
            <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850 space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Active Workload Gauge</span>
                <span className={`font-bold font-mono ${workload.color}`}>{workload.text} ({activeCount} Cases)</span>
              </div>
              
              {/* SVG Gauge design */}
              <div className="flex justify-center items-center py-2">
                <svg viewBox="0 0 100 55" className="w-full max-w-[140px]">
                  {/* Outer circle arc */}
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                  
                  {/* Dynamic colored arc */}
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke={`url(#gaugeGrad)`} 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeDasharray="126" 
                    strokeDashoffset={126 - (126 * (workload.percent / 100))}
                    className="transition-all duration-1000"
                  />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>

                  {/* Workload Number Text */}
                  <text x="50" y="45" textAnchor="middle" className="text-[12px] font-extrabold fill-slate-300 font-mono">
                    {activeCount}
                  </text>
                </svg>
              </div>

              <div className="w-full h-1 bg-slate-850 rounded-full overflow-hidden">
                <div className={`h-full ${workload.progressColor} transition-all duration-500`} style={{ width: `${Math.min(100, (activeCount/8)*100)}%` }} />
              </div>
            </div>

            {/* TAB SELECTOR FOR BOARD PIPELINE */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 text-[10px] font-bold text-slate-400 mb-4">
              {(["awaiting", "investigating", "resolved"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBoardTab(tab)}
                  className={`flex-1 py-2 text-center rounded-lg capitalize transition ${
                    boardTab === tab 
                      ? "bg-slate-900 text-indigo-400 font-bold border border-slate-800" 
                      : "hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* BOARD TICKET CARDS QUEUE */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-slate-400 text-center py-12 text-xs">Loading queue...</div>
              ) : filteredComplaints.length === 0 ? (
                <div className="text-slate-500 text-center py-12 text-xs border border-dashed border-slate-850 rounded-xl bg-slate-950/20">
                  <ClipboardList className="h-8 w-8 mx-auto text-slate-700 mb-2 animate-pulse" />
                  No tickets matching this status.
                </div>
              ) : (
                filteredComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col gap-2.5 ${
                      selectedComplaint?.id === c.id 
                        ? "bg-indigo-950/20 border-indigo-500/80 shadow-indigo-500/5" 
                        : "border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/30 hover:border-slate-350 dark:hover:border-slate-750"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-200 line-clamp-1 flex-1">{c.title}</h3>
                      {getStatusBadge(c.status)}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Student: {c.student?.name} ({c.student?.department})</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] border-t border-slate-200 dark:border-slate-850/60 pt-2 text-slate-400">
                      <span className={`px-2 py-0.5 rounded-full font-bold capitalize text-[8px] ${getUrgencyColor(c.urgency)}`}>
                        {c.urgency} Urgency
                      </span>
                      <span>ID: #{c.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* DETAILS & ACTION BOX */}
        <div className="lg:col-span-2 space-y-6">
          {selectedComplaint ? (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              
              {/* Title Block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-850 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">Ticket ID: #{selectedComplaint.id}</span>
                    {getStatusBadge(selectedComplaint.status)}
                  </div>
                  <h2 className="text-lg font-bold mt-1 text-slate-800 dark:text-slate-100">{selectedComplaint.title}</h2>
                </div>
                <button
                  onClick={() => window.open(`/complaint/${selectedComplaint.id}`, "_blank")}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-400 hover:underline self-start sm:self-center"
                >
                  <MessageSquare className="h-4.5 w-4.5" />
                  Open Live Chat Room →
                </button>
              </div>

              {/* Student info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-100/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-850/50">
                <div className="text-xs">
                  <span className="text-slate-400 font-medium">Lodge Student:</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedComplaint.student?.name} ({selectedComplaint.student?.email})</p>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 font-medium">Department Area:</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedComplaint.student?.department || 'Computer Science'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Description Details</span>
                <p className="text-slate-700 dark:text-slate-355 leading-relaxed bg-slate-950/20 p-3 border border-slate-200 dark:border-slate-850 rounded-xl">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* INTERACTIVE AI RECOMMENDATIONS CHECKLIST */}
              <div className="border border-indigo-500/20 bg-indigo-950/15 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 border-b border-indigo-500/10 pb-2">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Recommendations & Diagnostic checklist</span>
                </div>
                
                <div className="space-y-3.5 text-xs">
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-400 block mb-1">Verify Diagnostic Checklist:</span>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedComplaint.ai_recommendations?.split(",").map((rec, idx) => {
                        const trimmed = rec.trim();
                        const key = `${selectedComplaint.id}-${idx}`;
                        const isChecked = !!checklists[key];
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleChecklistItem(selectedComplaint.id, idx, trimmed)}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition select-none ${
                              isChecked
                                ? "bg-indigo-950/20 border-indigo-500/40 text-slate-300"
                                : "bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-800"
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                            ) : (
                              <Square className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                            )}
                            <span className={isChecked ? "line-through opacity-65" : ""}>{trimmed}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-850 pt-3">
                    <div>
                      <span className="font-semibold text-slate-400">Diagnosis Summary:</span>
                      <p className="mt-1 text-slate-200 italic">"{selectedComplaint.ai_summary || 'Not generated.'}"</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400">AI Priority Explanation:</span>
                      <p className="mt-1 text-slate-200">{selectedComplaint.ai_urgency_reason || 'Standard priority.'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Sliders className="h-4 w-4 text-indigo-500" />
                  <span>Update Complaint Status Pipeline</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedComplaint.status === "advisor_reviewed" && (
                    <button
                      onClick={() => handleUpdateStatus("officer_investigating")}
                      disabled={updatingStatus !== null}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition disabled:opacity-50"
                    >
                      <RotateCw className={`h-4 w-4 ${updatingStatus === "officer_investigating" ? "animate-spin" : ""}`} />
                      Begin Investigation
                    </button>
                  )}
                  {selectedComplaint.status !== "resolved" ? (
                    <button
                      onClick={() => handleUpdateStatus("resolved")}
                      disabled={updatingStatus !== null}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Resolved
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold w-full animate-fade-in">
                      <CheckCircle className="h-5 w-5" />
                      This grievance has been resolved. You can still message the student in the Chat Room.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <ClipboardList className="h-12 w-12 mx-auto text-slate-700 mb-2" />
              Select an assigned complaint from the list to update its status or communicate.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
