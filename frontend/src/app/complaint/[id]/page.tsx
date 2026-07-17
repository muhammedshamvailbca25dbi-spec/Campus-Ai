"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { 
  Bot, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Calendar,
  User,
  History
} from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  role: string;
  email: string;
}

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
  student: UserProfile;
  class_advisor?: UserProfile;
  assigned_officer?: UserProfile;
  created_at: string;
}

interface Message {
  id: number;
  sender_id?: number;
  sender?: UserProfile;
  content: string;
  is_ai: boolean;
  created_at: string;
}

interface ActionLog {
  id: number;
  action: string;
  details: string;
  created_at: string;
  user: UserProfile;
}

export default function ComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useApp();
  const id = params.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchAllData = async () => {
    if (!id) return;
    try {
      // 1. Fetch Ticket details
      const compRes = await fetch(`http://127.0.0.1:8000/api/complaints/${id}`);
      if (compRes.ok) {
        const compData = await compRes.json();
        setComplaint(compData);
      } else {
        setComplaint(null);
        setLoading(false);
        return;
      }

      // 2. Fetch Chat messages
      const msgRes = await fetch(`http://127.0.0.1:8000/api/complaints/${id}/messages`);
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData);
      }

      // 3. Fetch Action timeline logs
      const logsRes = await fetch(`http://127.0.0.1:8000/api/complaints/${id}/logs`);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
    } catch (err) {
      console.warn("Connection offline: Failed to fetch ticket detail records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Start polling chat updates every 3 seconds for mock real-time chats
    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !id) return;

    setSending(true);
    const content = newMessage;
    setNewMessage("");

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/complaints/${id}/messages?sender_id=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        // Immediate local fetch
        fetchAllData();
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Pending Advisor</span>;
      case "advisor_reviewed":
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Under Review</span>;
      case "officer_investigating":
        return <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Investigating</span>;
      case "resolved":
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Resolved</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-500 border border-slate-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-slate-400 text-xs">
          Loading grievance data...
        </div>
        <Footer />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
          <p className="text-slate-400 text-sm">Grievance ticket not found.</p>
          <button onClick={() => router.push("/dashboard")} className="mt-4 text-xs text-indigo-500 font-bold hover:underline">
            Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Back link */}
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* TICKET DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info (Left Col) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400">Grievance Ticket ID: #{complaint.id}</span>
                  <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{complaint.title}</h1>
                </div>
                {getStatusBadge(complaint.status)}
              </div>

              {/* Description Details */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description Details</span>
                <p className="p-4 bg-slate-900/10 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl leading-relaxed text-slate-700 dark:text-slate-300">
                  {complaint.description}
                </p>
              </div>

              {/* Triage summary */}
              <div className="border border-indigo-500/20 bg-indigo-950/10 p-5 rounded-2xl space-y-3.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-400 border-b border-indigo-500/10 pb-2">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Assistant Auto Analysis</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Diagnosis Summary:</span>
                  <p className="mt-1 text-slate-200 italic">"{complaint.ai_summary || 'Not generated.'}"</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Resolution Checklist:</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {complaint.ai_recommendations?.split(",").map((rec, i) => (
                      <span key={i} className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                        ✓ {rec.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* CHAT WINDOW ROOM */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[480px]">
              <h2 className="text-sm font-bold border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                Discussion Room
              </h2>

              {/* Messages viewport */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 text-xs">
                    No discussion logs found. Post a message to start communicating.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isCurrentUser = msg.sender_id === user?.id;
                    const isAi = msg.is_ai;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-xl px-4 py-2.5 text-xs border ${
                            isCurrentUser
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : isAi
                              ? "bg-indigo-950/40 border-indigo-500/20 text-indigo-200"
                              : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold mb-1 text-[9px] uppercase tracking-wider opacity-80">
                            {isCurrentUser ? (
                              <span>You ({user?.name})</span>
                            ) : isAi ? (
                              <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> CampusAI Assistant</span>
                            ) : (
                              <span>{msg.sender?.name || "User"} ({msg.sender?.role.replace("_", " ")})</span>
                            )}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <span className="text-[8px] opacity-60 float-right mt-1.5">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message form */}
              <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-slate-200 dark:border-slate-800 pt-3">
                <input
                  type="text"
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="glass-input p-3 text-xs flex-grow"
                  placeholder="Type your message here..."
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-lg text-white transition flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Action Log History Sidebar (Right Col) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Timeline */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-md font-bold mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <History className="h-4.5 w-4.5 text-indigo-500" />
                <span>Tracking History</span>
              </h2>

              <div className="space-y-6 relative pl-4">
                {logs.map((log, idx) => (
                  <div key={log.id} className="relative timeline-line timeline-line-active text-xs">
                    {/* Circle icon */}
                    <span className="absolute -left-[20px] top-1 h-3.5 w-3.5 rounded-full border-2 border-indigo-500 bg-slate-950 z-10" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold capitalize text-slate-200">{log.action.replace("_", " ")}</span>
                        <span className="text-[9px] text-slate-500">{new Date(log.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-400 text-[10px] leading-relaxed">{log.details}</p>
                      <p className="text-[9px] text-indigo-400 font-medium">By: {log.user.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stakeholder Assigned */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                Assigned Staff
              </h2>
              
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-500">Class Advisor:</span>
                  <p className="font-bold text-slate-300 mt-0.5">{complaint.class_advisor?.name || "Awaiting Assignment"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Department Officer:</span>
                  <p className="font-bold text-slate-300 mt-0.5">{complaint.assigned_officer?.name || "Awaiting Assignment"}</p>
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
