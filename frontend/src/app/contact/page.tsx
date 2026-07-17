"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-3xl font-extrabold sm:text-4xl gradient-text bg-gradient-to-r from-blue-500 to-purple-500">
              Contact Administration
            </h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">
              Need assistance? Fill out the form below or contact our global campus helpdesk directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Info Cards */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass-card p-6">
                <Mail className="h-5 w-5 text-indigo-500 mb-3" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</h3>
                <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 font-semibold">helpdesk@campusai.edu</p>
              </div>

              <div className="glass-card p-6">
                <Phone className="h-5 w-5 text-indigo-500 mb-3" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Support</h3>
                <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 font-semibold">+1 (555) 890-4820</p>
              </div>

              <div className="glass-card p-6">
                <MapPin className="h-5 w-5 text-indigo-500 mb-3" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Office Location</h3>
                <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 font-semibold leading-relaxed">
                  Student Affairs Wing, Block C<br />
                  ECT University Campus, CA
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce mb-4" />
                  <h3 className="text-lg font-bold text-slate-950 dark:text-slate-100">Message Received!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-2">
                    Thank you. Your message has been sent to the Student Welfare Officer. We will respond shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-medium">Your Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="glass-input p-3 text-xs"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-medium">Email Address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="glass-input p-3 text-xs"
                        placeholder="jane@example.edu"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="glass-input p-3 text-xs"
                      placeholder="Question about Hostel rules..."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Message Body</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="glass-input p-3 text-xs resize-none"
                      placeholder="Please write your inquiry in detail..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white text-xs font-semibold rounded-lg transition"
                  >
                    <Send className="h-4 w-4" />
                    Submit Ticket
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
