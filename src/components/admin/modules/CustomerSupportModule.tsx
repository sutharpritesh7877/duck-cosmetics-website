import { useState } from "react";
import { SupportTicket } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

export function CustomerSupportModule() {
  const currentStaff = authService.getCurrentUser();
  const tickets = db.getTickets();
  const staffList = db.getStaff();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [feedback, setFeedback] = useState("");

  const canReply = authService.can("support:reply", currentStaff);

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        t.ticketNumber.toLowerCase().includes(term) ||
        t.customerName.toLowerCase().includes(term) ||
        t.subject.toLowerCase().includes(term) ||
        (t.orderNumber && t.orderNumber.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "Support Agent" as const,
      senderName: currentStaff.name,
      text: replyText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated: SupportTicket = {
      ...selectedTicket,
      status: "Waiting on Customer",
      assignedTo: selectedTicket.assignedTo || currentStaff.name,
      messages: [...selectedTicket.messages, newMsg],
      updatedAt: new Date().toISOString(),
    };

    db.saveTicket(updated, currentStaff.name, currentStaff.role);
    setSelectedTicket(updated);
    setReplyText("");
    setFeedback(`Reply sent to ${selectedTicket.customerName}.`);
  };

  const handleResolveTicket = () => {
    if (!selectedTicket) return;
    const updated: SupportTicket = {
      ...selectedTicket,
      status: "Resolved",
      updatedAt: new Date().toISOString(),
    };
    db.saveTicket(updated, currentStaff.name, currentStaff.role);
    setSelectedTicket(updated);
    setFeedback(`Ticket ${selectedTicket.ticketNumber} marked as Resolved.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Helpdesk & CRM</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Customer Support ({tickets.length})</h2>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {feedback}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple/10 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by ticket #, customer, order #, subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-w-[16rem] flex-1 rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs outline-none focus:border-purple"
        />

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 font-semibold outline-none"
          >
            <option value="All">All Ticket Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting on Customer">Waiting on Customer</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 font-semibold outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Ticket #</th>
                <th className="px-4 py-3.5">Customer & Order</th>
                <th className="px-4 py-3.5">Subject & Category</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Assigned Agent</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filtered.map((t) => (
                <tr key={t.id} className="transition hover:bg-canvas/30">
                  <td className="px-4 py-3.5 font-mono font-bold text-purple">{t.ticketNumber}</td>
                  <td className="px-4 py-3.5">
                    <strong className="block text-ink font-semibold">{t.customerName}</strong>
                    <span className="text-[10px] text-ink/40 font-mono">{t.orderNumber || "General Query"}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <strong className="block text-ink">{t.subject}</strong>
                    <span className="text-[10px] text-purple">{t.category}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                        t.priority === "Urgent" ? "bg-red-100 text-red-700" :
                        t.priority === "High" ? "bg-amber-100 text-amber-800" : "bg-canvas text-ink/70"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-ink/70">{t.assignedTo || "Unassigned"}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                        t.status === "Resolved" ? "bg-mint text-purple-dark" :
                        t.status === "Open" ? "bg-red-100 text-red-700 font-bold" : "bg-sky text-purple-dark"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="rounded-full bg-purple/10 px-3 py-1 text-[10px] font-bold text-purple uppercase hover:bg-purple hover:text-white transition"
                    >
                      Open Conversation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Conversation Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedTicket(null)}>
          <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <header className="flex items-center justify-between border-b border-purple/10 p-5 bg-canvas/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple">{selectedTicket.ticketNumber}</span>
                  <span className="rounded bg-lilac px-2 py-0.5 text-[8px] font-bold text-purple uppercase">{selectedTicket.category}</span>
                </div>
                <h3 className="mt-1 font-display text-lg font-bold text-ink">{selectedTicket.subject}</h3>
                <small className="text-ink/40">From: {selectedTicket.customerName} ({selectedTicket.customerPhone})</small>
              </div>
              <div className="flex items-center gap-2">
                {selectedTicket.status !== "Resolved" && (
                  <button
                    onClick={handleResolveTicket}
                    className="rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white uppercase hover:bg-emerald-700"
                  >
                    Mark Resolved ✓
                  </button>
                )}
                <button onClick={() => setSelectedTicket(null)} className="rounded-full bg-canvas px-3 py-1 text-xs">✕</button>
              </div>
            </header>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-canvas/40">
              {selectedTicket.messages.map((msg) => {
                const isAgent = msg.sender === "Support Agent";
                return (
                  <div key={msg.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-xs ${isAgent ? "bg-purple text-white rounded-br-xs" : "bg-white text-ink border border-purple/10 rounded-bl-xs shadow-xs"}`}>
                      <div className="flex justify-between items-center gap-4 mb-1">
                        <strong className={`text-[10px] ${isAgent ? "text-lilac" : "text-purple"}`}>{msg.senderName}</strong>
                        <small className="text-[9px] opacity-60">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            {canReply && (
              <div className="p-4 bg-white border-t border-purple/10">
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder="Type official reply to customer..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 rounded-xl border border-purple/15 p-2 text-xs outline-none resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="rounded-xl bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark disabled:opacity-40"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
