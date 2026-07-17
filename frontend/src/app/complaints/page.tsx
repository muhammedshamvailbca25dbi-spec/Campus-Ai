"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Inbox, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";

interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  urgency: string;
  ai_summary?: string;
  created_at: string;
  student: {
    name: string;
    department?: string;
  };
}

export default function ComplaintsPage() {
  const router = useRouter();
  const { user } = useApp();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/complaints?role=${user.role}&user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  // Client-side filtering logic based on inputs
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase()) ||
                          c.id.toString() === search.trim();
    
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">Pending Advisor</span>;
      case "advisor_reviewed":
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">Under Review</span>;
      case "officer_investigating":
        return <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">Investigating</span>;
      case "resolved":
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">Resolved</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-500 border border-slate-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">{status}</span>;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-red-500 border border-red-500/20 bg-red-500/10";
      case "medium": return "text-amber-500 border border-amber-500/20 bg-amber-500/10";
      default: return "text-slate-400 border border-slate-800 bg-slate-800/20";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Grievance Central Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and review historical and active student submissions across departments.
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 mb-8">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input pl-10 pr-4 py-2.5 text-xs w-full"
              placeholder="Search by Title, ID, or keywords..."
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent border-0 outline-none text-xs text-slate-300 font-semibold"
              >
                <option value="all" className="bg-slate-900">All Categories</option>
                <option value="facilities" className="bg-slate-900">Facilities</option>
                <option value="hostel" className="bg-slate-900">Hostel</option>
                <option value="academic" className="bg-slate-900">Academic</option>
                <option value="finance" className="bg-slate-900">Finance</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-0 outline-none text-xs text-slate-300 font-semibold"
              >
                <option value="all" className="bg-slate-900">All Statuses</option>
                <option value="pending" className="bg-slate-900">Pending Advisor</option>
                <option value="advisor_reviewed" className="bg-slate-900">Under Review</option>
                <option value="officer_investigating" className="bg-slate-900">Investigating</option>
                <option value="resolved" className="bg-slate-900">Resolved</option>
              </select>
            </div>
          </div>

        </div>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-xs">Loading grievances...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-20 glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 max-w-xl mx-auto">
            <Inbox className="h-12 w-12 mx-auto text-slate-700 mb-3" />
            <h3 className="font-bold text-sm">No Grievances Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-normal">
              We couldn't find any complaints matching your search query or filter tags.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/complaint/${c.id}`)}
                className="glass-card p-6 flex flex-col justify-between cursor-pointer border border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/30 hover:border-indigo-500/50 transition duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">ID: #{c.id}</span>
                    {getStatusBadge(c.status)}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-200 dark:border-slate-800/60 pt-4 flex items-center justify-between text-[10px]">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold capitalize text-[8px] ${getUrgencyColor(c.urgency)}`}>
                    {c.urgency} Urgency
                  </span>
                  <span className="text-slate-400 font-medium">
                    By: {c.student.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
