"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  HelpCircle,
  ArrowRight,
  Shield,
  Search,
  Bot,
} from "lucide-react";
import { DuckLogo } from "./DuckLogo";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  tags?: string[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "concierge";
  text: string;
  time: string;
}

export function SmartFaqConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "concierge",
      text: "Bonjour! I am your Duck Cosmetics Maison Concierge. Select a common inquiry below or type any question regarding our formulations, waitlist, or delivery.",
      time: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/faqs?activeOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.faqs)) {
          setFaqs(data.faqs);
        }
      })
      .catch((err) => console.warn("Concierge FAQ fetch:", err));
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Keyword matching engine without any external generative AI
  const findBestAnswer = (query: string): string => {
    if (!faqs || faqs.length === 0) {
      return "I don't have the answer to that just yet. Please email our concierge team at crm@duckcosmetics.in and we will assist you immediately.";
    }

    const clean = query.toLowerCase().replace(/[^\w\s]/gi, "");
    const queryTokens = clean.split(/\s+/).filter((w) => w.length > 2);

    let bestScore = 0;
    let bestFaq: FaqItem | null = null;

    faqs.forEach((faq) => {
      let score = 0;
      const questionText = faq.question.toLowerCase();
      const answerText = faq.answer.toLowerCase();
      const tags = (faq.tags || []).map((t) => t.toLowerCase());

      queryTokens.forEach((token) => {
        if (questionText.includes(token)) score += 3;
        if (tags.some((t) => t.includes(token))) score += 2;
        if (answerText.includes(token)) score += 1;
      });

      if (score > bestScore) {
        bestScore = score;
        bestFaq = faq;
      }
    });

    if (bestScore > 0 && bestFaq) {
      return (bestFaq as FaqItem).answer;
    }

    // Exact requested fallback message
    return "I don't have the answer to that just yet. Please email our concierge team at crm@duckcosmetics.in and we will assist you immediately.";
  };

  const handleAsk = (questionText: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: questionText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const answerText = findBestAnswer(questionText);

    const conciergeMsg: ChatMessage = {
      id: `c-${Date.now() + 1}`,
      sender: "concierge",
      text: answerText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, conciergeMsg]);
    setInputQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    handleAsk(inputQuery.trim());
  };

  const topQuestions = faqs.slice(0, 5);

  return (
    <>
      {/* Floating Concierge Launcher Pill in Bottom Right */}
      <div className="fixed bottom-22 right-6 z-40">
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group inline-flex items-center gap-2.5 px-4.5 py-3 rounded-full bg-primary hover:bg-[#4A2D61] text-white shadow-[0_10px_25px_rgba(93,58,122,0.35)] transition-all duration-300 border border-primary-light/30 focus:outline-none"
          aria-label="Open Smart FAQ Concierge"
        >
          <Sparkles className="w-4 h-4 text-[#EADBF7] animate-pulse" />
          <span className="font-sans text-xs font-semibold tracking-wider uppercase">
            Maison Concierge
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </motion.button>
      </div>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="region"
            aria-label="Duck Cosmetics Smart Concierge Chat"
            className="fixed bottom-36 sm:bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-96 max-w-sm h-[560px] max-h-[82vh] bg-white rounded-3xl shadow-[0_24px_60px_rgba(93,58,122,0.22)] border border-lilac-border flex flex-col justify-between overflow-hidden z-50 font-sans selection:bg-primary selection:text-white"
          >
            {/* Header */}
            <div className="bg-primary text-white p-4.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Sparkles className="w-4 h-4 text-[#EADBF7]" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold tracking-wide text-white">
                    Duck Concierge
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#EADBF7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Instant Knowledge · Zero AI Fees</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
                aria-label="Close concierge chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body & Quick Question Chips */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-lilac/30 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      m.sender === "user"
                        ? "bg-primary text-white rounded-br-xs shadow-xs"
                        : "bg-white text-text-dark border border-lilac-border rounded-bl-xs shadow-xs"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-text-muted mt-1 px-1">
                    {m.sender === "user" ? "You" : "Concierge"} · {m.time}
                  </span>
                </div>
              ))}

              <div ref={messagesEndRef} />

              {/* Quick Inquiry Chips (Initial Guidance) */}
              {topQuestions.length > 0 && (
                <div className="pt-2">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Popular Inquiries
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {topQuestions.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleAsk(q.question)}
                        className="text-left text-[11px] font-medium py-1.5 px-3 rounded-full bg-white hover:bg-lilac border border-lilac-border text-primary transition shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {q.question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about formulation, waitlist, returns..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-lilac/50 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-40 transition shrink-0"
                aria-label="Send inquiry"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
