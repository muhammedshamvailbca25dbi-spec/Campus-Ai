"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  ClipboardList, 
  UserCheck, 
  Send, 
  MessageSquare,
  Sparkles,
  User,
  AlertCircle,
  Activity,
  Award,
  Users,
  CheckCircle,
  Mail,
  Calendar,
  X
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
    id: number;
    name: string;
    email: string;
    department?: string;
    attendance_rate?: number;
    gpa?: number;
  };
  created_at: string;
}

interface Officer {
  id: number;
  name: string;
  department?: string;
}

interface StudentRow {
  id: number;
  name: string;
  email: string;
  attendance: number;
  gpa: number;
  riskStatus: "low" | "medium" | "high";
  riskDetails: string;
}

export const AdvisorDashboard: React.FC = () => {
  const { user, addNotification } = useApp();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tab control: "tickets" vs "students"
  const [activeSubTab, setActiveSubTab] = useState<"tickets" | "students">("tickets");

  // Escalation States
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [forwarding, setForwarding] = useState(false);

  // Student list in department (CS)
  const [studentIndex, setStudentIndex] = useState<StudentRow[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [counselNote, setCounselNote] = useState("");
  const [isCounselModalOpen, setIsCounselModalOpen] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const compRes = await fetch(`http://127.0.0.1:8000/api/complaints?role=class_advisor&user_id=${user.id}`);
      if (compRes.ok) {
        const compData = await compRes.json();
        setComplaints(compData);
        if (compData.length > 0) {
          setSelectedComplaint(compData[0]);
        }
      }

      const offRes = await fetch(`http://127.0.0.1:8000/api/users?role=department_officer&college_id=${user.college_id}`);
      if (offRes.ok) {
        const offData = await offRes.json();
        setOfficers(offData);
        if (offData.length > 0) {
          setSelectedOfficerId(offData[0].id.toString());
        }
      }
    } catch (err) {
      console.warn(err);
      // Fallback Seed Complaints
      setComplaints([
        {
          id: 101,
          title: "Broken water heater in Hostel Block A room 302",
          description: "The hot water heater is completely broken and leaking water on the floor.",
          category: "facilities",
          status: "pending",
          urgency: "high",
          ai_summary: "Student reports broken hot water heater leaking in Block A Room 302.",
          ai_urgency_reason: "High priority. Water leak hazards.",
          ai_recommendations: "Inspect room immediately, Contact Hostel Warden",
          student: { id: 50, name: "Alex Mercer", email: "student@campusai.com", department: "Computer Science", attendance_rate: 92.5, gpa: 3.6 },
          created_at: new Date().toISOString()
        }
      ]);
      setSelectedComplaint({
        id: 101,
        title: "Broken water heater in Hostel Block A room 302",
        description: "The hot water heater is completely broken and leaking water on the floor.",
        category: "facilities",
        status: "pending",
        urgency: "high",
        ai_summary: "Student reports broken hot water heater leaking in Block A Room 302.",
        ai_urgency_reason: "High priority. Water leak hazards.",
        ai_recommendations: "Inspect room immediately, Contact Hostel Warden",
        student: { id: 50, name: "Alex Mercer", email: "student@campusai.com", department: "Computer Science", attendance_rate: 92.5, gpa: 3.6 },
        created_at: new Date().toISOString()
      });
      setOfficers([
        { id: 4, name: "Prof. Alan Smith", department: "Facilities & Hostel" },
        { id: 6, name: "Mr. James Croft", department: "Finance" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Populate student engagement index
    setStudentIndex([
      { id: 50, name: "Alex Mercer", email: "student@campusai.com", attendance: 92.5, gpa: 3.6, riskStatus: "low", riskDetails: "Good standing. Attendance rates exceed 90% threshold." },
      { id: 51, name: "Clara Oswald", email: "clara@campusai.com", attendance: 76.8, gpa: 1.8, riskStatus: "high", riskDetails: "Critical risk! GPA below 2.0 and attendance approaching 75% limit." },
      { id: 52, name: "Danny Pink", email: "danny.pink@campusai.com", attendance: 82.1, gpa: 2.4, riskStatus: "medium", riskDetails: "Moderate alert. Watch attendance metrics." },
      { id: 53, name: "Rory Williams", email: "rory.w@campusai.com", attendance: 95.0, gpa: 3.1, riskStatus: "low", riskDetails: "Excellent academic standing." }
    ]);
  }, [user]);

  const handleForward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedOfficerId || !user) return;

    setForwarding(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/complaints/${selectedComplaint.id}/forward?user_id=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_id: parseInt(selectedOfficerId),
          remarks: remarks
        })
      });

      if (res.ok) {
        addNotification(`Forwarded Ticket #${selectedComplaint.id} to Department Officer.`);
        setRemarks("");
        setSelectedComplaint(null);
        fetchData();
      }
    } catch (err) {
      console.warn(err);
      setComplaints(complaints.map(c => c.id === selectedComplaint.id ? { ...c, status: "advisor_reviewed" } : c));
      setSelectedComplaint(null);
      addNotification("Forwarded complaint (Sandbox Mode).");
    } finally {
      setForwarding(false);
    }
  };

  const submitCounselLog = () => {
    if (!selectedStudent || !counselNote.trim()) return;
    addNotification(`Logged academic counseling notes for ${selectedStudent.name}.`);
    setIsCounselModalOpen(false);
    setCounselNote("");
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
        return <span className="bg-amber-500/15 text-amber-500 text-[10px] px-2 py-0.5 rounded-full font-bold">Awaiting Advisor</span>;
      case "advisor_reviewed":
        return <span className="bg-blue-500/15 text-blue-500 text-[10px] px-2 py-0.5 rounded-full font-bold">Forwarded to Dept</span>;
      case "officer_investigating":
        return <span className="bg-indigo-500/15 text-indigo-500 text-[10px] px-2 py-0.5 rounded-full font-bold">Under Investigation</span>;
      case "resolved":
        return <span className="bg-emerald-500/15 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold">Resolved</span>;
      default:
        return <span className="bg-slate-500/15 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">{status}</span>;
    }
  };

  // Quick remarks helper template
  const applyQuickTemplate = (text: string) => {
    setRemarks(text);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Class Advisor Guidance Hub</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor student academic engagement profiles, review incoming tickets, and route details to department officers.
        </p>
      </div>

      {/* SUBNAV TAB CONTROL */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-850 text-xs font-bold text-slate-400 max-w-sm">
        <button
          onClick={() => setActiveSubTab("tickets")}
          className={`flex-1 py-2.5 text-center rounded-xl transition ${
            activeSubTab === "tickets" 
              ? "bg-slate-900 text-indigo-400 font-bold border border-slate-800" 
              : "hover:text-slate-200"
          }`}
        >
          Grievance Tickets ({complaints.length})
        </button>
        <button
          onClick={() => setActiveSubTab("students")}
          className={`flex-1 py-2.5 text-center rounded-xl transition ${
            activeSubTab === "students" 
              ? "bg-slate-900 text-indigo-400 font-bold border border-slate-800" 
              : "hover:text-slate-200"
          }`}
        >
          Engagement Index ({studentIndex.length})
        </button>
      </div>

      {/* VIEW PIPELINE FOR TICKETS */}
      {activeSubTab === "tickets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COMPLAINTS LIST */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-md font-bold mb-4 flex items-center justify-between">
              <span>Student Complaints</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                {complaints.length} Assigned
              </span>
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-slate-400 text-center py-12 text-xs">Loading assignments...</div>
              ) : complaints.length === 0 ? (
                <div className="text-slate-500 text-center py-12 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                  <ClipboardList className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  No student complaints assigned to review.
                </div>
              ) : (
                complaints.map((c) => (
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
                    <p className="text-[10px] text-slate-400 font-medium">By: {c.student?.name} ({c.student?.department})</p>
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

          {/* TICKET DETAILS & ACTION PANEL */}
          <div className="lg:col-span-2 space-y-6">
            {selectedComplaint ? (
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                
                {/* Ticket Title Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-850 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Ticket ID: #{selectedComplaint.id}</span>
                      {getStatusBadge(selectedComplaint.status)}
                    </div>
                    <h2 className="text-lg font-bold mt-1 text-slate-805 dark:text-slate-100">{selectedComplaint.title}</h2>
                  </div>
                  <button
                    onClick={() => window.open(`/complaint/${selectedComplaint.id}`, "_blank")}
                    className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 hover:underline self-start sm:self-center"
                  >
                    Full Details & Chat →
                  </button>
                </div>

                {/* Student Metadata with Risk Indicator */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-100/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-850/50 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Student Name:</span>
                    <p className="font-bold text-slate-200 mt-0.5">{selectedComplaint.student?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Academic Stand:</span>
                    <p className="font-bold mt-0.5 text-slate-200">
                      Attendance: <span className="text-indigo-400">{selectedComplaint.student?.attendance_rate || 92}%</span> | GPA: <span className="text-indigo-400">{selectedComplaint.student?.gpa || 3.6}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Adviser Risk Assessment:</span>
                    <span className="inline-block mt-0.5 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                      Safe Standing
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Description</span>
                  <p className="text-slate-700 dark:text-slate-355 leading-relaxed bg-slate-950/20 p-3 border border-slate-200 dark:border-slate-850 rounded-xl">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* AI Triaging Details */}
                <div className="border border-indigo-500/20 bg-indigo-950/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 border-b border-indigo-500/10 pb-2">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Triaging Assistant Logs</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3.5 text-xs">
                    <div>
                      <span className="font-semibold text-slate-400">AI Complaint Summary:</span>
                      <p className="mt-1 text-slate-200 italic">"{selectedComplaint.ai_summary || 'Not generated.'}"</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400">Recommended Resolution Checklist:</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedComplaint.ai_recommendations?.split(",").map((rec, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-300">
                            ✓ {rec.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forward/Action Form */}
                {selectedComplaint.status === "pending" && (
                  <form onSubmit={handleForward} className="border-t border-slate-200 dark:border-slate-850 pt-6 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <UserCheck className="h-4 w-4 text-indigo-500" />
                      <span>Forward to Department Officer</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400">Select Department Officer</label>
                        <select
                          value={selectedOfficerId}
                          onChange={(e) => setSelectedOfficerId(e.target.value)}
                          className="glass-input p-3 text-xs bg-slate-950 text-slate-300 font-semibold w-full outline-none"
                        >
                          {officers.map((off) => (
                            <option key={off.id} value={off.id} className="bg-slate-900">
                              {off.name} ({off.department || 'General'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Remarks Templates */}
                    <div className="space-y-1.5 text-xs">
                      <label className="text-slate-500 font-semibold uppercase tracking-wider text-[9px] block">Quick Template Remarks</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => applyQuickTemplate("Midterm grading error verified with TA record. Forwarding for official database adjustment.")}
                          className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 rounded-lg transition"
                        >
                          Grading Verification
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTemplate("Hostel room maintenance request inspected and confirmed leaking water heater. Urgently routing to facilities.")}
                          className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 rounded-lg transition"
                        >
                          Hostel Repair Urgent
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTemplate("Student merit scholarship credit verification pending college invoice adjustment. Forwarding to Finance officer.")}
                          className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 rounded-lg transition"
                        >
                          Scholarship Audit
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-semibold">Advisor Remarks & Guidance Notes</label>
                      <textarea
                        rows={3}
                        required
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add observations about student academic/hostel logs or suggestions for the department officer."
                        className="glass-input p-3 text-xs resize-none w-full outline-none text-slate-200"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forwarding}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 text-xs w-full hover:opacity-95 transition"
                    >
                      <Send className="h-4 w-4" />
                      {forwarding ? "Forwarding Ticket..." : "Verify & Forward Complaint"}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="glass-panel p-12 text-center text-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <ClipboardList className="h-12 w-12 mx-auto text-slate-700 mb-2" />
                Select a student complaint from the sidebar to review and forward.
              </div>
            )}
          </div>

        </div>
      )}

      {/* STUDENT ENGAGEMENT INDEX VIEW */}
      {activeSubTab === "students" && (
        <div className="space-y-8 animate-fade-in">
          
          {/* AI ADVISING RECOMMENDATION BOX */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider border-b border-indigo-900/30 pb-2">
              <Sparkles className="h-4 w-4" /> AI Student Support suggestions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-xl space-y-2">
                <span className="inline-block bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                  High Counseling Priority
                </span>
                <h4 className="font-bold text-slate-200">Clara Oswald: Low Attendance Risk</h4>
                <p className="text-slate-400 leading-normal">
                  Clara's attendance stands at <span className="text-red-400">76.8%</span> with GPA <span className="text-red-400">1.8</span>. AI recommends scheduling an academic probation guidance counselling session.
                </p>
                <button 
                  onClick={() => {
                    setSelectedStudent(studentIndex[1]); // Clara
                    setIsCounselModalOpen(true);
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2 underline"
                >
                  <Calendar className="h-3.5 w-3.5" /> Book Guidance Appointment
                </button>
              </div>

              <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-xl space-y-2">
                <span className="inline-block bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                  SLA Monitoring Review
                </span>
                <h4 className="font-bold text-slate-200">Alex Mercer: Midterm Grading Discrepancy</h4>
                <p className="text-slate-400 leading-normal">
                  Alex maintains a <span className="text-emerald-400">3.6 GPA</span>. Midterm grade inputs show an anomaly (45 vs 85 on exam sheet). AI suggests reviewing records.
                </p>
                <button 
                  onClick={() => {
                    setSelectedStudent(studentIndex[0]); // Alex
                    setIsCounselModalOpen(true);
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2 underline"
                >
                  <Mail className="h-3.5 w-3.5" /> Email Grading Department
                </button>
              </div>
            </div>
          </div>

          {/* STUDENT ROSTER INDEX TABLE */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-250 mb-4 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-indigo-500" />
              Department Roster & Risk Metrics
            </h3>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-850 font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Student Name</th>
                    <th className="py-3 px-2">Email Address</th>
                    <th className="py-3 px-2">Attendance Rate</th>
                    <th className="py-3 px-2">GPA Grade</th>
                    <th className="py-3 px-2">Engagement Status</th>
                    <th className="py-3 px-2 text-right">Counseling Logs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-850/80">
                  {studentIndex.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/10">
                      <td className="py-4 px-2 font-bold text-slate-200">{s.name}</td>
                      <td className="py-4 px-2 text-slate-400 font-mono">{s.email}</td>
                      <td className={`py-4 px-2 font-bold ${s.attendance < 80 ? "text-red-400 animate-pulse" : "text-slate-300"}`}>
                        {s.attendance}%
                      </td>
                      <td className={`py-4 px-2 font-bold ${s.gpa < 2.0 ? "text-red-400" : "text-slate-300"}`}>
                        {s.gpa}
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          s.riskStatus === "high" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                          s.riskStatus === "medium" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}>
                          {s.riskStatus} Risk
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setIsCounselModalOpen(true);
                          }}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 hover:border-indigo-500 text-slate-350 hover:text-indigo-400 rounded-lg text-[10px] font-semibold transition"
                        >
                          Counsel Student
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COUNSELING NOTES MODAL */}
      {isCounselModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200">
                Academic Counseling Notes: {selectedStudent.name}
              </h3>
              <button onClick={() => setIsCounselModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-normal">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">AI Diagnostic Risk Assessment</span>
                <p className="mt-1 text-slate-350">{selectedStudent.riskDetails}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Counseling Session Summary Remarks</label>
                <textarea
                  rows={4}
                  required
                  value={counselNote}
                  onChange={(e) => setCounselNote(e.target.value)}
                  placeholder="Record summary remarks of student performance guidance reviews, action plans, or advisor advisements..."
                  className="glass-input p-3 w-full resize-none text-slate-200 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={submitCounselLog}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-95 transition"
              >
                Log Guidance Notes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
