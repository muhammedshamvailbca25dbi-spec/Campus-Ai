"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  MessageSquare,
  Volume1
} from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
}

export const GlobalAiWidget: React.FC = () => {
  const router = useRouter();
  const { theme, toggleTheme, addNotification } = useApp();
  
  // Widget Visibility states
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "voice">("chat");

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { sender: "ai", text: "Hello! I am CampusAI, your digital helpdesk assistant. How can I help you today? You can type your query or try my voice assistant!" }
  ]);
  const [chatSuggestions, setChatSuggestions] = useState<string[]>([
    "File hostel complaint",
    "Who resolves academic issues?",
    "Check my complaint status"
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice States
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [recognizedText, setRecognizedText] = useState("");
  const [aiVoiceResponse, setAiVoiceResponse] = useState("");
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Web Speech API instances
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setVoiceStatus("listening");
          setRecognizedText("Listening...");
        };

        rec.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          setRecognizedText(transcript);
          setVoiceStatus("thinking");
          
          // Process voice input
          await handleVoiceCommand(transcript);
        };

        rec.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setVoiceStatus("idle");
          setRecognizedText("Speech recognition failed or permission denied.");
        };

        rec.onend = () => {
          // If we transitioned to thinking or speaking, don't reset to idle
          setVoiceStatus((prev) => (prev === "listening" ? "idle" : prev));
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const speakText = (text: string) => {
    if (!synthRef.current || isAudioMuted) return;
    
    synthRef.current.cancel(); // Terminate existing voices
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      setVoiceStatus("speaking");
    };
    
    utterance.onend = () => {
      setVoiceStatus("idle");
    };
    
    utterance.onerror = () => {
      setVoiceStatus("idle");
    };

    synthRef.current.speak(utterance);
  };

  const handleVoiceCommand = async (text: string) => {
    const cleanText = text.toLowerCase().trim();
    
    // Define Voice commands action listeners
    if (cleanText.includes("toggle theme") || cleanText.includes("switch theme") || cleanText.includes("dark mode") || cleanText.includes("light mode")) {
      toggleTheme();
      const reply = "Toggling interface display theme mode.";
      setAiVoiceResponse(reply);
      speakText(reply);
      addNotification(`Voice Action: Toggle Theme Mode.`);
      return;
    }

    if (cleanText.includes("go to dashboard") || cleanText.includes("open dashboard") || cleanText.includes("show dashboard")) {
      router.push("/dashboard");
      const reply = "Navigating to your role dashboard panel.";
      setAiVoiceResponse(reply);
      speakText(reply);
      addNotification(`Voice Action: Navigating to Dashboard.`);
      return;
    }

    if (cleanText.includes("file complaint") || cleanText.includes("submit grievance") || cleanText.includes("report issue")) {
      router.push("/dashboard");
      const reply = "Opening your dashboard. Please fill out the grievance form.";
      setAiVoiceResponse(reply);
      speakText(reply);
      addNotification(`Voice Action: Navigating to Grievance Form.`);
      return;
    }

    if (cleanText.includes("go back") || cleanText.includes("go to home") || cleanText.includes("open landing")) {
      router.push("/");
      const reply = "Navigating to welcome landing page.";
      setAiVoiceResponse(reply);
      speakText(reply);
      return;
    }

    if (cleanText.includes("open settings") || cleanText.includes("show settings")) {
      router.push("/settings");
      const reply = "Navigating to settings panel.";
      setAiVoiceResponse(reply);
      speakText(reply);
      return;
    }

    // Default: query FastAPI AI Chatbot
    try {
      const res = await fetch("http://127.0.0.1:8000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        const data = await res.json();
        setAiVoiceResponse(data.response);
        
        // Add to chat logs too so user sees conversational logs
        setChatMessages((prev) => [
          ...prev,
          { sender: "user", text },
          { sender: "ai", text: data.response }
        ]);
        
        speakText(data.response);
      } else {
        const reply = "I encountered an error querying the backend AI helper.";
        setAiVoiceResponse(reply);
        speakText(reply);
      }
    } catch (err) {
      console.warn("Backend down. Fallback to client response", err);
      const reply = "I could not reach the server, but you can file a complaint directly using the dashboard forms.";
      setAiVoiceResponse(reply);
      speakText(reply);
    }
  };

  const startListening = () => {
    if (synthRef.current) {
      synthRef.current.cancel(); // Stop talking before listening
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition already active", e);
      }
    } else {
      setRecognizedText("Speech recognition not supported on this browser.");
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setVoiceStatus("idle");
    }
  };

  const handleSendChatMessage = async (textToSend: string) => {
    if (!textToSend.trim() || chatLoading) return;
    
    const userText = textToSend;
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { sender: "ai", text: data.response }]);
        setChatSuggestions(data.suggestions);
        
        // Also speak chatbot answer out loud if not muted
        speakText(data.response);
      }
    } catch (err) {
      console.warn("Offline fallback", err);
      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Offline fallback: I could not contact the backend API, please ensure port 8000 is open." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING ACTION TRIGGER BUBBLE */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative group"
        >
          <Bot className="h-6 w-6 transform group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-indigo-400 border-2 border-slate-900 animate-ping" />
        </button>
      </div>

      {/* CHAT/VOICE EXPANDED SIDEBAR PANEL */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] sm:w-[400px] h-[520px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in text-slate-800 dark:text-slate-200">
          
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold">CampusAI Assistant</span>
                <p className="text-[9px] text-slate-400 leading-none">Online & Voice enabled</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                stopSpeaking();
                setIsOpen(false);
              }}
              className="text-slate-450 hover:text-slate-200 p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => {
                stopSpeaking();
                setActiveTab("chat");
              }}
              className={`py-3 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === "chat" 
                  ? "border-indigo-500 text-indigo-500 bg-indigo-50/10" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Text Chat
            </button>
            <button
              onClick={() => setActiveTab("voice")}
              className={`py-3 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === "voice" 
                  ? "border-indigo-500 text-indigo-500 bg-indigo-50/10" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Mic className="h-4 w-4" />
              Voice Assistant
            </button>
          </div>

          {/* TAB BODY CONTROLS */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/10">
            
            {/* CHATBOT INTERFACE */}
            {activeTab === "chat" ? (
              <div className="flex-grow flex flex-col min-h-0">
                {/* Scroll Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3.5 scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border ${
                          msg.sender === "user"
                            ? "bg-indigo-650 border-indigo-500 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-200 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 rounded-2xl px-4 py-2 text-xs text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 animate-spin text-purple-500" />
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggestions */}
                {chatSuggestions.length > 0 && (
                  <div className="px-4 py-2 bg-slate-100/50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5 items-center">
                    {chatSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendChatMessage(sug)}
                        className="text-[9px] bg-slate-250 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-800 px-2.5 py-1 rounded text-slate-700 dark:text-slate-300 transition"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage(chatInput);
                  }}
                  className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2"
                >
                  <input
                    type="text"
                    required
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="glass-input p-2.5 text-xs flex-grow"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-grow flex flex-col justify-between p-6">
                {/* VOICE ASSISTANT INTERFACE ("GEMINI LIVE" Siri-like pulsing orb) */}
                
                {/* Audio controls (Mute toggle / stop speech) */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Live Voice Mode</span>
                  <div className="flex items-center gap-2">
                    {voiceStatus === "speaking" && (
                      <button 
                        onClick={stopSpeaking}
                        className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-450 px-2 py-1 rounded-lg font-semibold"
                      >
                        Stop
                      </button>
                    )}
                    <button
                      onClick={() => setIsAudioMuted(!isAudioMuted)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-800 transition text-slate-450"
                    >
                      {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Pulsing Visual Orb */}
                <div className="flex flex-col items-center justify-center my-6 relative">
                  
                  {/* Outer morphing waves */}
                  <div className={`absolute rounded-full bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-purple-500/20 blur-xl transition-all duration-700 ${
                    voiceStatus === "listening" ? "h-48 w-48 animate-ping" :
                    voiceStatus === "thinking" ? "h-44 w-44 animate-spin duration-[4000ms]" :
                    voiceStatus === "speaking" ? "h-56 w-56 animate-pulse" : "h-36 w-36"
                  }`} />
                  
                  {/* Central glowing Orb */}
                  <button
                    onClick={startListening}
                    disabled={voiceStatus === "thinking"}
                    className={`h-28 w-28 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-2xl relative z-10 transition-all duration-350 hover:scale-105 active:scale-95 ${
                      voiceStatus === "listening" ? "ring-8 ring-indigo-500/30 border-2 border-emerald-400" :
                      voiceStatus === "speaking" ? "scale-110 border-2 border-blue-400 shadow-indigo-500/40" : ""
                    }`}
                  >
                    {voiceStatus === "listening" ? (
                      <Mic className="h-10 w-10 text-emerald-300 animate-bounce" />
                    ) : (
                      <Mic className="h-10 w-10" />
                    )}
                  </button>

                  {/* Status label */}
                  <span className="text-xs font-bold text-slate-450 mt-8 capitalize tracking-wider animate-pulse flex items-center gap-1.5">
                    {voiceStatus === "listening" && <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />}
                    {voiceStatus === "speaking" && <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse" />}
                    {voiceStatus === "thinking" && <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-spin" />}
                    {voiceStatus === "idle" && <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />}
                    <span>
                      {voiceStatus === "idle" && "Tap orb to speak"}
                      {voiceStatus === "listening" && "Listening..."}
                      {voiceStatus === "thinking" && "Processing..."}
                      {voiceStatus === "speaking" && "Speaking..."}
                    </span>
                  </span>
                </div>

                {/* Subtitle Telemetries */}
                <div className="bg-slate-900/35 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl min-h-[90px] flex flex-col justify-center text-xs">
                  {recognizedText && (
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Speech Transcript</span>
                      <p className="text-slate-600 dark:text-slate-300 italic font-medium">"{recognizedText}"</p>
                    </div>
                  )}
                  {aiVoiceResponse && voiceStatus === "speaking" && (
                    <div className="space-y-1 mt-2 border-t border-slate-800 pt-2">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">AI Reply</span>
                      <p className="text-indigo-400 dark:text-indigo-300 line-clamp-2 font-medium">{aiVoiceResponse}</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
          
        </div>
      )}
    </>
  );
};
