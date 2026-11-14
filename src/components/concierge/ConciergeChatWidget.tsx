"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Search,
  MessageCircle,
  Mail,
  ArrowRight,
  ShieldCheck,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

interface ConciergeQA {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
}

interface ChatMessage {
  id: string;
  sender: "concierge" | "user";
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

const DEFAULT_QUESTIONS: ConciergeQA[] = [
  {
    id: "q-1",
    question: "When is the official launch date and how does the waitlist work?",
    answer:
      "Duck Cosmetics officially launches in Spring 2026. VIP Waitlist members receive private 48-hour pre-launch ordering privileges, complimentary bespoke packaging, and priority dispatch before the public drop.",
    isActive: true,
    order: 1,
  },
  {
    id: "q-2",
    question: "Is Duck Cosmetics 100% cruelty-free and vegan?",
    answer:
      "Yes, absolutely. Every Duck Cosmetics formulation is certified cruelty-free and 100% vegan. We never test on animals or commission third-party animal testing anywhere globally.",
    isActive: true,
    order: 2,
  },
  {
    id: "q-3",
    question: "What are your shipping rates and estimated delivery timelines?",
    answer:
      "We offer complimentary domestic express shipping across India on all pre-launch and launch orders. International express transit takes 3–5 business days via DHL Express with complete end-to-end temperature-controlled tracking.",
    isActive: true,
    order: 3,
  },
  {
    id: "q-4",
    question: "Are your Baby Care formulations dermatologist and pediatrician approved?",
    answer:
      "Yes. The Duck Baby Care atelier collection is certified hypoallergenic, tear-free, and clinically tested under pediatric and dermatological supervision for newborn and sensitive skin.",
    isActive: true,
    order: 4,
  },
  {
    id: "q-5",
    question: "What is your return and satisfaction guarantee policy?",
    answer:
      "We offer a 100% risk-free 30-day Atelier Guarantee. If any formulation does not exceed your expectations, returns and exchanges are complimentary.",
    isActive: true,
    order: 5,
  },
  {
    id: "q-6",
    question: "How do you source your Ayurvedic botanical ingredients?",
    answer:
      "Our Ayurvedic formulas feature single-origin, ethically harvested ingredients including Kashmiri Mogra Saffron, cold-pressed cold-climate Kumkumadi oils, and organic vetiver directly sourced from artisanal grower cooperatives.",
    isActive: true,
    order: 6,
  },
];

export function ConciergeChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [qas, setQas] = useState<ConciergeQA[]>(DEFAULT_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Fetch active Q&A items from database
  useEffect(() => {
    let isMounted = true;
    fetch("/api/concierge-qa")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.qas) && data.qas.length > 0) {
          setQas(data.qas);
        }
      })
      .catch((err) => {
        console.warn("Concierge Q&A fallback:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize initial greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages([
        {
          id: "welcome-1",
          sender: "concierge",
          text: "Bonjour! I am your Duck Cosmetics atelier digital concierge. Tap any inquiry below or search your question to receive instant verified answers regarding our formulas, waitlist privileges, and international dispatches.",
          timestamp: now,
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom on message updates
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSelectQA = (qa: ConciergeQA) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add user question
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: qa.question,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate luxury concierge response delay
    setTimeout(() => {
      const conciergeMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        sender: "concierge",
        text: qa.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, conciergeMsg]);
      setIsTyping(false);
    }, 450);

    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: time,
    };
    setMessages((prev) => [...prev, userMsg]);
    setSearchQuery("");
    setIsTyping(true);

    // Find best match in Q&A
    const lower = query.toLowerCase();
    const match = qas.find((qa) => {
      const qLower = qa.question.toLowerCase();
      const aLower = qa.answer.toLowerCase();
      return (
        qLower.includes(lower) ||
        lower.split(" ").some((word) => word.length > 3 && qLower.includes(word)) ||
        aLower.includes(lower)
      );
    });

    setTimeout(() => {
      if (match) {
        const replyMsg: ChatMessage = {
          id: `c-${Date.now()}`,
          sender: "concierge",
          text: match.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, replyMsg]);
      } else {
        // Fallback for unhandled queries as required
        const fallbackMsg: ChatMessage = {
          id: `c-${Date.now()}`,
          sender: "concierge",
          text: "Our digital concierge doesn't have that answer yet. Please email crm@duckcosmetics.in for immediate assistance.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isFallback: true,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
      setIsTyping(false);
    }, 550);
  };

  const handleReset = () => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "concierge",
        text: "Conversation refreshed. How may our atelier assist you now?",
        timestamp: now,
      },
    ]);
  };

  // Filtered recommendations based on live search
  const filteredQas = searchQuery.trim()
    ? qas.filter(
        (qa) =>
          qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          qa.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : qas.slice(0, 5);

  return (
    <>
      {/* Floating Trigger Button (Refined w-12 h-12, stacked perfectly with gap-4 above WhatsApp) */}
      <div className="fixed bottom-[88px] right-6 z-40 flex items-center gap-3">
        {/* Tooltip Pill */}
        <AnimatePresence>
          {tooltipOpen && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-xl border border-lilac-border text-xs font-sans text-text-dark"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-text-dark">AI Atelier Concierge</span>
              <span className="text-text-muted">· Instant Q&A</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open AI Beauty Concierge"
          className="w-12 h-12 rounded-full bg-primary hover:bg-[#4A2D61] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(93,58,122,0.28)] hover:shadow-[0_10px_25px_rgba(93,58,122,0.36)] border border-lilac-border/30 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20 cursor-pointer"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-5.5 h-5.5 text-amber-200" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-primary" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Expandable Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] max-h-[640px] h-[580px] bg-white rounded-3xl shadow-[0_25px_60px_rgba(93,58,122,0.25)] border border-lilac-border flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-primary text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-normal tracking-wide text-white leading-tight">
                    Duck AI Concierge
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider text-white/80">
                      Pre-Loaded Atelier Q&A
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
                  title="Reset Conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
                  aria-label="Close Chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Top Search Bar */}
            <div className="p-3 bg-[#FAF7FC] border-b border-lilac-border/60 shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="How can we assist you today?"
                  className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-white border border-lilac-border text-xs text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-2xs"
                />
                <Search className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>

            {/* Chat Body */}
            <div
              ref={chatScrollRef}
              className="flex-grow p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-[#FAF7FC] to-white"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                      msg.sender === "user"
                        ? "bg-primary text-white rounded-br-xs"
                        : "bg-white border border-lilac-border text-text-dark rounded-bl-xs"
                    }`}
                  >
                    {msg.sender === "concierge" && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        <Sparkles className="w-3 h-3" />
                        <span>Atelier Concierge</span>
                      </div>
                    )}
                    <p>{msg.text}</p>

                    {/* If fallback, render email and contact buttons */}
                    {msg.isFallback && (
                      <div className="mt-3 pt-2.5 border-t border-lilac-border/60 flex flex-col gap-1.5">
                        <a
                          href="mailto:crm@duckcosmetics.in?subject=Atelier%20Inquiry%20from%20Website"
                          className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email crm@duckcosmetics.in</span>
                        </a>
                        <a
                          href="https://wa.me/919825010194?text=Bonjour%20Duck%20Cosmetics%2C%20I%20have%20an%20inquiry%20regarding%20your%20atelier."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-emerald-600 text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-emerald-700 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-text-muted mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-lilac-border max-w-[120px] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
            </div>

            {/* Quick Questions Chips / Pills */}
            <div className="p-3 bg-[#FAF7FC] border-t border-lilac-border/60 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  <span>Frequently Asked Topics</span>
                </span>
                <span className="text-[10px] text-primary font-medium">Click to ask</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {filteredQas.map((qa) => (
                  <button
                    key={qa.id}
                    type="button"
                    onClick={() => handleSelectQA(qa)}
                    className="text-left text-[11px] font-sans font-medium px-3 py-1.5 rounded-xl bg-white border border-lilac-border hover:border-primary hover:text-primary hover:bg-lilac transition duration-150 truncate max-w-full text-text-dark shadow-2xs"
                  >
                    {qa.question}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
