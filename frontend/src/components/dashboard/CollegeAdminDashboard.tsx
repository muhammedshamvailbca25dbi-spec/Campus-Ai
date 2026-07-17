"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  Building, 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  FileDown, 
  Plus,
  BookOpen,
  Briefcase,
  Trash2,
  Edit2,
  Bell,
  X,
  UserCheck,
  AlertCircle
} from "lucide-react";

interface Metrics {
  total_complaints: number;
  pending_complaints: number;
  in_progress_complaints: number;
  resolved_complaints: number;
  category_counts: Record<string, number>;
  status_counts: Record<string, number>;
  avg_resolution_time_days: number;
}

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  college_id?: number;
}

interface ToastMessage {
  id: number;
  title: string;
  desc: string;
  type: "info" | "warning" | "success";
}

export const CollegeAdminDashboard: React.FC = () => {
  const { user, addNotification } = useApp();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Form & Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [staffForm, setStaffForm] = useState({ name: "", email: "", role: "department_officer", department: "Academics" });

  // Toast Alerts States
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Simulation of incoming reports for real-time vibe
  useEffect(() => {
    const alerts = [
      { title: "Grievance Lodged", desc: "Broken desk in dorm Block A room 112", type: "info" as const },
      { title: "Urgent Complaint", desc: "Internet connection down in Exam Hall", type: "warning" as const },
      { title: "SLA Close Alert", desc: "Hostel tap repair marked complete by officer Alan", type: "success" as const }
    ];

    const interval = setInterval(() => {
      const alert = alerts[Math.floor(Math.random() * alerts.length)];
      const id = Date.now();
      setToasts(prev => [...prev, { id, ...alert }]);
      
      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 6000);
      
      addNotification(`[Real-time Event] ${alert.title}: ${alert.desc}`);
    }, 28000); // Trigger notification simulation every 28s

    return () => clearInterval(interval);
  }, []);

  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analytics?college_id=${user?.college_id || 1}`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.warn(err);
      setMetrics({
        total_complaints: 18,
        pending_complaints: 4,
        in_progress_complaints: 6,
        resolved_complaints: 8,
        category_counts: { hostel: 6, academic: 4, finance: 3, facilities: 5 },
        status_counts: { pending: 4, in_progress: 6, resolved: 8 },
        avg_resolution_time_days: 1.8
      });
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users?college_id=${user?.college_id || 1}`);
      if (res.ok) {
        const data = await res.json();
        // Filter out super_admin and student roles to show only administrative staff
        setStaff(data.filter((u: StaffMember) => u.role === "department_officer" || u.role === "class_advisor"));
      }
    } catch (err) {
      console.warn(err);
      setStaff([
        { id: 10, name: "Prof. Alan Smith", email: "hostelofficer@campusai.com", role: "department_officer", department: "Facilities & Hostel" },
        { id: 11, name: "Dr. Helen Carter", email: "academicofficer@campusai.com", role: "department_officer", department: "Academics" },
        { id: 12, name: "Mr. James Croft", email: "financeofficer@campusai.com", role: "department_officer", department: "Finance" },
        { id: 13, name: "Prof. Evelyn Vance", email: "advisor@campusai.com", role: "class_advisor", department: "Computer Science" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchStaff();
  }, [user]);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...staffForm,
      college_id: user?.college_id || 1,
    };

    try {
      let res;
      if (editingStaffId) {
        res = await fetch(`http://127.0.0.1:8000/api/users/${editingStaffId}`, {
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
        addNotification(editingStaffId ? "Staff member details updated" : "Successfully registered new staff member");
        setStaffForm({ name: "", email: "", role: "department_officer", department: "Academics" });
        setIsModalOpen(false);
        setEditingStaffId(null);
        fetchStaff();
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Error saving staff member");
      }
    } catch (err) {
      console.warn(err);
      // Fallback local edit for sandbox
      if (editingStaffId) {
        setStaff(staff.map(s => s.id === editingStaffId ? { ...s, ...payload } : s));
      } else {
        setStaff([...staff, { id: staff.length + 10, ...payload }]);
      }
      setIsModalOpen(false);
      setEditingStaffId(null);
      addNotification("Saved staff info (Sandbox Mode).");
    }
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaffId(member.id);
    setStaffForm({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department || "Academics"
    });
    setIsModalOpen(true);
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm("Are you sure you want to delete this staff member? They will lose access to the administrative console.")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addNotification("Staff member deleted");
        fetchStaff();
      }
    } catch (err) {
      console.warn(err);
      setStaff(staff.filter(s => s.id !== id));
      addNotification("Deleted staff member (Sandbox Mode).");
    }
  };

  const triggerCSVDownload = () => {
    addNotification("Generating and downloading CSV grievance report...");
    const headers = "Grievance ID,Title,Category,Status,Urgency,Date\n";
    const row1 = "101,Broken water heater in Hostel,Facilities,Pending,High,2026-07-14\n";
    const row2 = "102,Midterm grading error,Academic,In Progress,Medium,2026-07-15\n";
    const row3 = "103,Merit Scholarship delay,Finance,Resolved,Medium,2026-07-12\n";
    
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + row1 + row2 + row3);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `Grievance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts Chart Configs
  const categoryData = metrics ? Object.entries(metrics.category_counts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];

  const trendData = [
    { month: "Feb", Complaints: 12, Resolved: 8 },
    { month: "Mar", Complaints: 18, Resolved: 14 },
    { month: "Apr", Complaints: 25, Resolved: 20 },
    { month: "May", Complaints: 15, Resolved: 12 },
    { month: "Jun", Complaints: 30, Resolved: 25 },
    { month: "Jul", Complaints: metrics?.total_complaints || 8, Resolved: metrics?.resolved_complaints || 5 },
  ];

  // Workload analysis of departments
  const departmentWorkloadData = [
    { name: "Academics", Active: staff.filter(s => s.department === "Academics").length * 2 + 1, Limit: 10 },
    { name: "Hostels", Active: staff.filter(s => s.department === "Facilities & Hostel").length * 3 + 2, Limit: 12 },
    { name: "Finance", Active: staff.filter(s => s.department === "Finance").length * 2, Limit: 8 },
    { name: "CompSci", Active: staff.filter(s => s.department === "Computer Science").length * 1 + 1, Limit: 6 },
  ];

  const COLORS = ["#4f46e5", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* FLOAT TOAST NOTIFICATIONS BAR */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 w-80">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`p-4 rounded-xl border shadow-xl flex justify-between items-start text-xs text-white backdrop-blur-md animate-slide-in ${
              t.type === "warning" ? "bg-amber-900/90 border-amber-600/40" :
              t.type === "success" ? "bg-emerald-900/90 border-emerald-600/40" :
              "bg-indigo-950/90 border-indigo-600/40"
            }`}
          >
            <div className="flex gap-2">
              {t.type === "warning" ? <AlertCircle className="h-4.5 w-4.5 text-amber-400 shrink-0" /> : <Bell className="h-4.5 w-4.5 text-indigo-400 shrink-0" />}
              <div>
                <span className="font-bold block text-slate-100">{t.title}</span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{t.desc}</p>
              </div>
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-white ml-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">College Administration Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Overview metrics for Engineering College of Technology, track officer performance logs, and manage staff credentials.
          </p>
        </div>
        <button
          onClick={triggerCSVDownload}
          className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 transition"
        >
          <FileDown className="h-4 w-4" />
          Export CSV Report
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Grievances</span>
            <Building className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold mt-2">{loading ? "..." : metrics?.total_complaints}</p>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> +12% from last month
          </span>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Awaiting Review</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold mt-2">{loading ? "..." : metrics?.pending_complaints}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1">Average response SLA 24h</span>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tickets Resolved</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold mt-2">{loading ? "..." : metrics?.resolved_complaints}</p>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1">94.8% SLA compliance</span>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Resolution Time</span>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold mt-2">{loading ? "..." : `${metrics?.avg_resolution_time_days} days`}</p>
          <span className="text-[10px] text-indigo-400 font-medium mt-1">Ranked #2 in college list</span>
        </div>
      </div>

      {/* ANALYTICAL CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MONTHLY COMPLAINTS CHART */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Grievance Trends & Resolutions</h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: "#0b0f19", borderColor: "#1f2937" }} />
                <Legend />
                <Area type="monotone" dataKey="Complaints" stroke="#4f46e5" fillOpacity={1} fill="url(#colorComp)" />
                <Area type="monotone" dataKey="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CATEGORY RATIO PIE CHART */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Complaint Category Split</h3>
          <div className="h-72 w-full flex items-center justify-center text-xs">
            {loading ? (
              <p className="text-slate-400">Loading charts...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0b0f19", borderColor: "#1f2937" }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* DEPARTMENT PERFORMANCE COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BAR CHART WORKLOAD */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-500" />
            Department Workload & Active Grievances SLA
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentWorkloadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: "#0b0f19", borderColor: "#1f2937" }} />
                <Legend />
                <Bar dataKey="Active" fill="#4f46e5" name="Active Tickets" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Limit" fill="#334155" name="SLA Safe Limit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DEPARTMENT HEALTH CARD */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Critical SLA Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs p-3 bg-slate-950/45 rounded-xl border border-slate-850">
                <span className="text-slate-400 font-semibold">Facilities & Hostel</span>
                <span className="font-bold text-red-400">High Workload (5 active)</span>
              </div>
              <div className="flex justify-between items-center text-xs p-3 bg-slate-950/45 rounded-xl border border-slate-850">
                <span className="text-slate-400 font-semibold">Academics Office</span>
                <span className="font-bold text-emerald-400">Safe SLA (2 active)</span>
              </div>
              <div className="flex justify-between items-center text-xs p-3 bg-slate-950/45 rounded-xl border border-slate-850">
                <span className="text-slate-400 font-semibold">Finance & Dues</span>
                <span className="font-bold text-emerald-400">Optimal (1 active)</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 italic text-center block mt-4">
            Department escalations auto-alert College Admin after 72 hrs.
          </span>
        </div>

      </div>

      {/* DEPARTMENT STAFF & OFFICERS MANAGEMENT */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Department Officers & Advisors</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Manage officers and class advisors assigned to handle student complaints.</p>
          </div>
          <button 
            onClick={() => {
              setEditingStaffId(null);
              setStaffForm({ name: "", email: "", role: "department_officer", department: "Academics" });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
          >
            <Plus className="h-4 w-4" />
            Add Staff Member
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-2">Staff Name</th>
                <th className="py-2.5 px-2">Email Address</th>
                <th className="py-2.5 px-2">Role Status</th>
                <th className="py-2.5 px-2">Assigned Department</th>
                <th className="py-2.5 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                  <td className="py-3 px-2 font-semibold text-slate-200">{s.name}</td>
                  <td className="py-3 px-2 text-slate-400 font-mono text-[11px]">{s.email}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.role === "department_officer" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {s.role === "department_officer" ? "Dept Officer" : "Class Advisor"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-400 font-medium">{s.department || "General"}</td>
                  <td className="py-3 px-2 text-right space-x-2">
                    <button
                      onClick={() => handleEditStaff(s)}
                      className="p-1 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 rounded-lg transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(s.id)}
                      className="p-1 border border-slate-200 dark:border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-400 rounded-lg transition"
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

      {/* STAFF DETAILS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200">
                {editingStaffId ? "Edit Staff Configurations" : "Add Department Staff Entity"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="glass-input p-3 w-full"
                  placeholder="e.g. Prof. Evelyn Vance"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="glass-input p-3 w-full"
                  placeholder="e.g. evelyn.vance@campusai.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Role Status</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="glass-input p-3 w-full bg-slate-950 text-slate-300 font-bold outline-none"
                  >
                    <option value="department_officer">Dept Officer</option>
                    <option value="class_advisor">Class Advisor</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Assigned Department</label>
                  <select
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="glass-input p-3 w-full bg-slate-950 text-slate-300 font-bold outline-none"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Facilities & Hostel">Facilities & Hostel</option>
                    <option value="Finance">Finance</option>
                    <option value="Academics">Academics</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-95 transition"
              >
                {editingStaffId ? "Save Configurations" : "Add Staff Member"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
