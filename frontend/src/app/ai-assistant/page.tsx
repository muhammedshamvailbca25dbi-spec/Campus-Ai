"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Bot, 
  Send, 
  Sparkles, 
  MessageSquare,
  Zap,
  HelpCircle
} from "lucide-react";

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "ai";
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I am CampusAI, your academic helpdesk support bot. How can I assist you today? You can write a description of your issue, and I will help classify it and direct it to the right department.",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([
    "How do I submit a complaint?",
    "Broken bathroom tap in hostel Block B",
    "Scholarship invoice is delayed",
    "Who resolves grading issues?"
  ]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend;
    setInput("");
    
    // Add user message locally
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text: userText, sender: "user" }
    ]);
    
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: data.response, sender: "ai" }
        ]);
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.warn(err);
      // Fallback
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: "I'm having trouble connecting to my servers right now, but you can file a ticket directly in the Dashboard complaints form.", sender: "ai" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 sm:py-10 flex flex-col">
        
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Bot className="h-7 w-7 text-indigo-500" />
            <span>AI Helpdesk Assistant</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Get instant guidance on grievance regulations, college policies, mess timings, or draft complaints automatically.
          </p>
        </div>

        {/* CHAT CONTAINER */}
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 flex-grow flex flex-col h-[520px]">
          
          {/* Scrollable messages area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4.5 py-3 text-xs leading-relaxed border ${
                    msg.sender === "user"
                      ? "bg-indigo-650 border-indigo-500 text-white"
                      : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350"
                  }`}
                >
                  <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold mb-1 opacity-70">
                    {msg.sender === "user" ? (
                      <span>You</span>
                    ) : (
                      <span className="flex items-center gap-1 text-indigo-400"><Bot className="h-3 w-3" /> CampusAI Agent</span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 rounded-2xl px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-purple-500" />
                  AI is typing...
                </div>
              </div>
            )}
          </div>

          {/* Prompt Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-6 py-3 bg-slate-100/50 dark:bg-slate-900/35 border-t border-slate-200 dark:border-slate-850/80 flex flex-wrap gap-2 items-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" /> Suggested:
              </span>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug)}
                  className="text-[10px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-3"
          >
            <input
              type="text"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="glass-input p-3 text-xs flex-grow"
              placeholder="Ask me anything, e.g. 'How can I file a hostel maintenance complaint?'"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4.5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white transition disabled:opacity-50"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

        </div>

      </main>

      <Footer />
    </div>
  );
}
