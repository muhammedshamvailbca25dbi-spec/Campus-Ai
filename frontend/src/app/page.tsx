"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  ArrowRight, 
  Bot, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  Smile, 
  Users, 
  Workflow, 
  MessageCircle,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  ChevronDown
} from "lucide-react";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { label: "Grievances Resolved", value: "98.4%", icon: Smile, color: "text-emerald-500" },
    { label: "Avg Response Time", value: "< 24 Hrs", icon: Clock, color: "text-blue-500" },
    { label: "AI Auto-Categorized", value: "100%", icon: Bot, color: "text-purple-500" },
  ];

  const features = [
    {
      title: "Smart AI Triage",
      desc: "Instantly categorizes reports, analyzes description severity, extracts a clean summary, and automatically recommends action plans.",
      icon: Bot,
    },
    {
      title: "Granular Role RBAC",
      desc: "Seamlessly routes tickets through Student, Advisor, Department Officer, College Admin, and Super Admin levels.",
      icon: Users,
    },
    {
      title: "Real-time Chat",
      desc: "Enables interactive, instant discussion threads with officers, and has a floating helper assistant ready 24/7.",
      icon: MessageCircle,
    },
    {
      title: "Deep Analytics",
      desc: "Gives administrators advanced dashboards featuring performance trends, category distributions, and automated resolution rates.",
      icon: TrendingUp,
    },
  ];

  const workflowSteps = [
    { role: "Student Submission", desc: "Files a grievance. AI processes category, urgency, and provides immediate support recommendations." },
    { role: "Class Advisor Guidance", desc: "Monitors, verifies validity, offers counsel notes, and forwards it to the assigned Department Officer." },
    { role: "Department Investigation", desc: "The designated officer reviews, responds, updates status, and solves the ticket." },
    { role: "College Oversight", desc: "Admin reviews metrics, escalates anomalies, and signs off resolution reports." },
  ];

  const faqs = [
    { q: "How does the AI auto-classify grievances?", a: "When a student enters a title and description, our natural language parser matches academic, hostel, facility, and financial keywords. It determines the category, rates severity (low, medium, high), and writes a concise summary automatically." },
    { q: "Can I switch roles in the dashboard?", a: "Yes! In this sandbox preview, a floating Role Switcher is available in the top navbar. Clicking it switches your context instantly (e.g. Student to Department Officer) to view the entire platform's features." },
    { q: "What is the role of the Class Advisor?", a: "Class Advisors acts as the first line of triage. They guide students on academic bylaws, check if complaints are valid, and add advisory logs before escalating to the department officers." },
    { q: "Is the data persisted?", a: "Yes. The backend utilizes a SQLite database (SQLAlchemy ORM) locally, ensuring any complaint submitted or status updated is fully stored, tracked, and updated on the dashboard." },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40">
          {/* Background Blur Gradients */}
          <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl" />
          <div className="absolute top-10 right-10 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            
            {/* AI badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1 text-xs font-medium text-indigo-400 mb-8 animate-pulse">
              <Bot className="h-4 w-4" />
              <span>Next-Gen Grievance Redressal</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl mx-auto leading-none">
              Empowering Campus Grievance Resolution with{" "}
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              A responsive, role-based student helpdesk system. Submit complaints, track status pipelines, and coordinate resolution with admins through smart automation.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Go to Dashboard
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link 
                href="/contact" 
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                Contact Support
              </Link>
            </div>

            {/* Interactive Grid Mockup */}
            <div className="mt-16 sm:mt-20 border border-slate-200/80 dark:border-slate-800/85 rounded-2xl overflow-hidden glass-panel max-w-5xl mx-auto shadow-2xl animate-float">
              <div className="flex h-11 items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400 ml-4 font-mono">https://campusai.edu/student-grievance</span>
              </div>
              <div className="p-4 sm:p-8 bg-slate-900/40 text-left min-h-[300px] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest font-mono">Grievance Submission Mockup</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold">\"Broken light fixture and study table in Dorm Room 102\"</h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                    \"The fluorescent tube light is blinking rapidly and producing a loud buzzing noise, making it impossible to study. Also, the desk has a cracked wooden leg.\"
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-6 mt-8">
                  <div className="bg-slate-800/45 p-3.5 rounded-xl border border-slate-700/40">
                    <span className="text-[10px] uppercase font-bold text-slate-500">AI Summary</span>
                    <p className="text-xs mt-1 text-slate-200">Student reports broken bulb buzzing and cracked leg in Room 102.</p>
                  </div>
                  <div className="bg-slate-800/45 p-3.5 rounded-xl border border-slate-700/40">
                    <span className="text-[10px] uppercase font-bold text-slate-500">AI Classified Category</span>
                    <p className="text-xs mt-1 text-indigo-400 font-semibold">Facilities & Hostel</p>
                  </div>
                  <div className="bg-slate-800/45 p-3.5 rounded-xl border border-slate-700/40">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Auto Route Assignment</span>
                    <p className="text-xs mt-1 text-emerald-400 font-semibold">Class Advisor Assigned</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* STATISTICS SECTION */}
        <section className="py-12 border-y border-slate-200/80 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl glass-card p-6">
                  <div className={`p-3 rounded-xl bg-slate-200/50 dark:bg-slate-900/80 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold sm:text-4xl">Platform Features</h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">Everything needed to resolve problems and manage student grievances efficiently.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feat, i) => (
                <div key={i} className="rounded-2xl glass-card p-6 flex flex-col items-start">
                  <div className="mb-4 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 p-3 text-white">
                    <feat.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-md font-semibold">{feat.title}</h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFLOW TIMELINE SECTION */}
        <section className="py-20 sm:py-24 bg-slate-100/40 dark:bg-slate-900/10 border-y border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold sm:text-4xl">The Resolution Pipeline</h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">An optimized workflow ensuring issues escalate to correct personnel automatically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {workflowSteps.map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center p-4">
                  {/* Step bubble */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold mb-4 shadow-lg">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-sm">{step.role}</h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">Common questions about sandbox capabilities, rules-engine, and database access.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => {
                const isOpen = activeFaq === i;
                return (
                  <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden glass-panel">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="p-5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/10">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="py-20 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">Get in touch with us</h2>
                <p className="mt-4 text-slate-400 text-sm max-w-md">
                  Have questions about integrating CampusAI into your educational institute? Contact our team for detailed implementation documentation and pricing.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-indigo-400" />
                    <span className="text-sm text-slate-300">support@campusai.edu</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-indigo-400" />
                    <span className="text-sm text-slate-300">+1 (555) 019-2834</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-indigo-400" />
                    <span className="text-sm text-slate-300">100 Tech Plaza, San Francisco, CA</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-medium">First Name</label>
                      <input type="text" className="bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500" placeholder="Jane" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-medium">Last Name</label>
                      <input type="text" className="bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Email Address</label>
                    <input type="email" className="bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500" placeholder="jane@example.edu" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Message</label>
                    <textarea rows={4} className="bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500 resize-none" placeholder="Write your inquiry here..." />
                  </div>
                  <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg transition-colors">
                    Send Inquiry
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
