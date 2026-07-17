"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  FilePlus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  MessageSquare,
  Bot, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  CheckSquare,
  Mic,
  MicOff,
  Volume2,
  Bookmark,
  Calendar
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
  created_at: string;
}

export const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const { user, addNotification } = useApp();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Submit Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("facilities");
  const [urgency, setUrgency] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  // Selected Complaint for Stepper Timeline
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // AI Suggestion Templates
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [analyzingText, setAnalyzingText] = useState(false);

  // Voice dictation state
  const [isListening, setIsListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState("Click mic and speak your issue");

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/complaints?role=student&user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
        if (data.length > 0) {
          setSelectedComplaint(data[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to load complaints from API", err);
      // Fallback Seed Data
      const dummyComplaints = [
        {
          id: 101,
          title: "Broken water heater in Hostel Block A room 302",
          description: "The hot water heater is completely broken and leaking water on the floor. It has been cold for 3 days and there's a risk of water damage. Please fix it immediately.",
          category: "facilities",
          status: "pending",
          urgency: "high",
          ai_summary: "Student reports broken hot water heater leaking in Block A Room 302.",
          created_at: new Date().toISOString()
        },
        {
          id: 103,
          title: "Scholarship disbursement delay for Semester 2",
          description: "My merit scholarship credit of $1200 has not been applied to my student invoice yet.",
          category: "finance",
          status: "resolved",
          urgency: "medium",
          ai_summary: "Scholarship transaction discrepancy verification logged.",
          created_at: new Date().toISOString()
        }
      ];
      setComplaints(dummyComplaints);
      setSelectedComplaint(dummyComplaints[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  // Real-time AI templates helper when title shifts
  useEffect(() => {
    if (title.length < 8) {
      setAiSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setAnalyzingText(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: `I want to report: ${title}. Provide 3 short templates.` }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiSuggestions(data.suggestions.slice(0, 3));
        }
      } catch (err) {
        console.warn(err);
        setAiSuggestions([
          "Hostel tap leaking - urgent plumber request",
          "Algorithms midterm score discrepancy audit request",
          "Finance late fees waiver query"
        ]);
      } finally {
        setAnalyzingText(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !user) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          urgency,
          student_id: user.id,
          college_id: user.college_id || 1,
        }),
      });

      if (res.ok) {
        const newTicket = await res.json();
        addNotification(`New grievance submitted: ${newTicket.title}`);
        setTitle("");
        setDescription("");
        fetchComplaints();
      }
    } catch (err) {
      console.warn(err);
      // Fallback sandbox create
      const newDummy = {
        id: Date.now() % 1000,
        title,
        description,
        category,
        urgency,
        status: "pending",
        ai_summary: `AI Draft summary of ${title}`,
        created_at: new Date().toISOString()
      };
      setComplaints([newDummy, ...complaints]);
      setSelectedComplaint(newDummy);
      setTitle("");
      setDescription("");
      addNotification("Complaint submitted (Sandbox Mode).");
    } finally {
      setSubmitting(false);
    }
  };

  // Voice Assistant Dictator
  const triggerVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsListening(true);
      setVoiceHint("Browser doesn't support Web Speech. Dictating mockup issues...");
      setTimeout(() => {
        setTitle("Bathroom water tap leaking rapidly");
        setDescription("The shower tap is completely broken and water is splashing everywhere. I need a plumber dispatched as soon as possible to repair it.");
        setCategory("facilities");
        setUrgency("high");
        addNotification("Voice dictated draft populated.");
        setIsListening(false);
        setVoiceHint("Click mic and speak your issue");
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
        setVoiceHint("Dictating... Speak title and description details now.");
      };

      rec.onresult = (e: any) => {
        const trans = e.results[0][0].transcript;
        // Populate form fields based on keyword detection
        setTitle(trans);
        setDescription(`Voice generated transcript description: "${trans}". Please adjust as necessary.`);
        
        if (trans.toLowerCase().includes("hostel") || trans.toLowerCase().includes("shower") || trans.toLowerCase().includes("water")) {
          setCategory("hostel");
        } else if (trans.toLowerCase().includes("gpa") || trans.toLowerCase().includes("exam") || trans.toLowerCase().includes("grade")) {
          setCategory("academic");
        }
        addNotification("Voice dictation input successfully captured.");
      };

      rec.onerror = (e: any) => {
        console.warn(e);
        setIsListening(false);
        setVoiceHint("Error dictating voice. Click to try again.");
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

  const getUrgencyBadge = (urg: string) => {
    switch (urg) {
      case "high":
        return <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle className="h-3 w-3" /> High Urgency</span>;
      case "medium":
        return <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="h-3 w-3" /> Medium SLA</span>;
      default:
        return <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="h-3 w-3" /> Low</span>;
    }
  };

  // Timeline lifecycle checker
  // Stages: Lodged -> Advisor Reviewed -> Investigating -> Resolved
  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: "lodged", label: "Ticket Lodged", desc: "Ticket automatically processed and parsed by AI.", active: true },
      { key: "advisor", label: "Advisor Guidance", desc: "First-level triage and verification by Class Advisor.", active: false },
      { key: "investigating", label: "Investigation", desc: "Assigned Department Officer starts resolving.", active: false },
      { key: "resolved", label: "Resolved State", desc: "Administrative team registers solution approval.", active: false }
    ];

    if (status === "advisor_reviewed") {
      steps[1].active = true;
    } else if (status === "officer_investigating") {
      steps[1].active = true;
      steps[2].active = true;
    } else if (status === "resolved" || status === "closed") {
      steps[1].active = true;
      steps[2].active = true;
      steps[3].active = true;
    }

    return steps;
  };

  const currentTimeline = selectedComplaint ? getTimelineSteps(selectedComplaint.status) : [];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Student Grievance Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit new issues, review ticket resolution pipelines, and chat with administrative officers.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs text-indigo-400">
          <Bot className="h-4.5 w-4.5" />
          <span className="font-semibold">AI Assistant online</span>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Student Attendance Rate</span>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{user?.attendance_rate || "92.5"}%</p>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1">In Good Standing</span>
          </div>
          <Award className="h-10 w-10 text-indigo-500/40" />
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Cumulative GPA Score</span>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{user?.gpa || "3.6"}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Syllabus Grade Safe</span>
          </div>
          <Users className="h-10 w-10 text-blue-500/40" />
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Grievance Profile Progress</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-2 bg-slate-850 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: "85%" }} />
              </div>
              <span className="text-xs font-extrabold text-slate-300">85%</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-medium mt-1">Tenant ID Verified</span>
          </div>
          <Bookmark className="h-10 w-10 text-purple-500/40" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COMPLAINT SUBMISSION FORM */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <FilePlus className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-md font-bold">Lodge a New Grievance</h2>
            </div>
            
            {/* SPEECH INPUT BUTTON */}
            <button
              type="button"
              onClick={triggerVoiceDictation}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold transition ${
                isListening 
                  ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" 
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span>{isListening ? "Listening..." : "Dictate Issue"}</span>
            </button>
          </div>

          {isListening && (
            <div className="bg-indigo-950/20 p-3.5 border border-indigo-900/30 rounded-xl flex items-center gap-3 text-xs text-indigo-200">
              <div className="flex gap-1 items-center shrink-0">
                <div className="w-1 h-4 bg-indigo-400 animate-pulse delay-75" />
                <div className="w-1 h-6 bg-indigo-500 animate-pulse" />
                <div className="w-1 h-5 bg-indigo-400 animate-pulse delay-100" />
              </div>
              <p className="italic">"{voiceHint}"</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Grievance Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input p-3 text-xs w-full outline-none text-slate-100"
                placeholder="Brief summary (e.g. WiFi not working in Dorm room, midterm grade error)"
              />
              
              {/* Real-time AI Helpers */}
              {analyzingText && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                  <Sparkles className="h-3 w-3 animate-spin text-purple-500" />
                  AI is analyzing and drafting suggestions...
                </span>
              )}

              {aiSuggestions.length > 0 && (
                <div className="mt-2 bg-slate-950/50 rounded-xl p-3 border border-slate-850 space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    AI Template suggestions (Click to apply)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setTitle(sug);
                          setDescription(`Regarding my request for: "${sug}". Please assign the designated department officer to review.`);
                        }}
                        className="text-[10px] text-left bg-slate-900 border border-slate-850 rounded px-2 py-1 text-slate-350 hover:bg-slate-800 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Category Area</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-input p-3 bg-slate-950 text-slate-300 font-bold outline-none"
                >
                  <option value="facilities">Facilities & repairs</option>
                  <option value="hostel">Hostel & mess housing</option>
                  <option value="academic">Academic & grades</option>
                  <option value="finance">Finance & billing</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Self-reported Severity</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="glass-input p-3 bg-slate-950 text-slate-300 font-bold outline-none"
                >
                  <option value="low">Low - General query</option>
                  <option value="medium">Medium - SLA standard (48h)</option>
                  <option value="high">High - Urgent repair (24h)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Detailed Description</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-input p-3 text-xs w-full resize-none outline-none text-slate-200"
                placeholder="Describe details of the issue. E.g. room number, exact problem, TA/Professor names..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-lg transition"
            >
              {submitting ? "Submitting Grievance..." : "File Grievance Ticket"}
            </button>
          </form>
        </div>

        {/* PERSONAL ADVISORY RECOMMENDATIONS */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-850 pb-2">
            <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
            AI Advising Guidance
          </h3>

          <div className="space-y-4 text-xs">
            <div className="bg-emerald-950/20 p-4 border border-emerald-900/30 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle className="h-4 w-4" /> Good Standing Status
              </div>
              <p className="text-emerald-200/90 leading-relaxed">
                Your cumulative Computer Science course attendance stands at {user?.attendance_rate || "92.5"}%. No debarment warnings present. Keep it up!
              </p>
            </div>

            {selectedComplaint && selectedComplaint.status === "pending" && (
              <div className="bg-amber-950/20 p-4 border border-amber-900/30 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Clock className="h-4 w-4 animate-spin" /> Ticket Under Review
                </div>
                <p className="text-amber-200/90 leading-relaxed">
                  Your hostel complaint #{selectedComplaint.id} is queued for Advisor review. Standard verification completes within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* COMPLAINTS TIMELINE PROGRESS TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COMPLAINTS HISTORY SIDEBAR */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Lodge History</h2>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-slate-400 text-center py-6 text-xs">Loading history...</div>
            ) : complaints.length === 0 ? (
              <div className="text-slate-500 text-center py-6 text-xs italic">No tickets lodged.</div>
            ) : (
              complaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedComplaint?.id === c.id 
                      ? "bg-indigo-950/20 border-indigo-500/80" 
                      : "border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/30 hover:border-slate-350 dark:hover:border-slate-750"
                  }`}
                >
                  <div className="flex justify-between items-start text-xs font-bold">
                    <span className="truncate max-w-[150px] text-slate-200">{c.title}</span>
                    <span className="text-[10px] text-slate-400">#{c.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2">
                    <span className="capitalize font-mono text-indigo-400">{c.status.replace("_", " ")}</span>
                    {getUrgencyBadge(c.urgency)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* STEPPER TIMELINE BLOCK */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          {selectedComplaint ? (
            <div className="space-y-6">
              <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Grievance Lifecycle tracker</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tracking code: #{selectedComplaint.id} - "{selectedComplaint.title}"</p>
                </div>
                <button
                  onClick={() => router.push(`/complaint/${selectedComplaint.id}`)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-400"
                >
                  <MessageSquare className="h-4 w-4" /> Message Thread →
                </button>
              </div>

              {/* TIMELINE TIMELINE TIMELINE */}
              <div className="relative py-4">
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-800 z-0" />
                
                <div className="space-y-6 relative z-10 text-xs">
                  {currentTimeline.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      {/* Node Bullet */}
                      <div className={`h-12 w-12 rounded-full shrink-0 flex items-center justify-center border font-bold ${
                        step.active
                          ? "bg-indigo-650 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-slate-900 border-slate-800 text-slate-500"
                      }`}>
                        {step.active ? "✓" : idx + 1}
                      </div>

                      {/* Details */}
                      <div>
                        <h4 className={`font-bold ${step.active ? "text-indigo-400" : "text-slate-500"}`}>{step.label}</h4>
                        <p className={`text-[11px] mt-0.5 leading-normal ${step.active ? "text-slate-300" : "text-slate-500"}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Select a complaint from history to view progress stepper details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
