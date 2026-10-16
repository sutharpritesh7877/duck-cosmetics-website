import { useState } from "react";
import { NotificationLog } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

export function NotificationsModule() {
  const currentStaff = authService.getCurrentUser();
  const notifications = db.getNotifications();

  const [channelFilter, setChannelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedNotification, setSelectedNotification] = useState<NotificationLog | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const canResend = authService.can("notifications:resend", currentStaff);

  const filtered = notifications.filter((n) => {
    if (channelFilter !== "All" && n.channel !== channelFilter) return false;
    if (statusFilter !== "All" && n.status !== statusFilter) return false;
    return true;
  });

  const handleResend = (n: NotificationLog) => {
    db.addNotification({
      orderId: n.orderId,
      orderNumber: n.orderNumber,
      recipient: n.recipient,
      channel: n.channel,
      type: n.type,
      subject: `[RESENT] ${n.subject}`,
      body: n.body,
      status: "Sent",
    });
    setToastMsg(`Notification re-dispatched via ${n.channel} to ${n.recipient}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Messaging Queue</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Customer Notifications ({notifications.length})</h2>
        </div>
      </div>

      {toastMsg && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {toastMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple/10 bg-white p-4 shadow-sm">
        <div className="flex gap-2 text-xs">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 font-semibold outline-none"
          >
            <option value="All">All Channels (WhatsApp, SMS, Email)</option>
            <option value="WhatsApp">WhatsApp Notifications</option>
            <option value="SMS">SMS Gateway</option>
            <option value="Email">Email Notifications</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 font-semibold outline-none"
          >
            <option value="All">All Delivery Statuses</option>
            <option value="Sent">Delivered / Sent</option>
            <option value="Failed">Failed / Undelivered</option>
            <option value="Queued">Queued</option>
          </select>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Trigger Event</th>
                <th className="px-4 py-3.5">Recipient</th>
                <th className="px-4 py-3.5">Channel</th>
                <th className="px-4 py-3.5">Subject & Preview</th>
                <th className="px-4 py-3.5">Sent At</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filtered.map((n) => (
                <tr key={n.id} className="transition hover:bg-canvas/30">
                  <td className="px-4 py-3.5">
                    <strong className="block text-purple font-semibold">{n.type}</strong>
                    <span className="font-mono text-[10px] text-ink/40">{n.orderNumber || "General"}</span>
                  </td>
                  <td className="px-4 py-3.5 text-ink/80">{n.recipient}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-lilac/80 px-2.5 py-0.5 text-[9px] font-bold text-purple uppercase">
                      {n.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    <strong className="block truncate text-ink font-semibold">{n.subject}</strong>
                    <span className="truncate block text-[10px] text-ink/50">{n.body}</span>
                  </td>
                  <td className="px-4 py-3.5 text-ink/45 text-[11px] whitespace-nowrap">
                    {new Date(n.sentAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                        n.status === "Sent" ? "bg-mint text-purple-dark" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => setSelectedNotification(n)}
                      className="rounded-full bg-canvas px-3 py-1 text-[10px] font-bold uppercase text-purple hover:bg-lilac"
                    >
                      Preview
                    </button>
                    {canResend && (
                      <button
                        onClick={() => handleResend(n)}
                        className="rounded-full bg-purple/10 px-3 py-1 text-[10px] font-bold uppercase text-purple hover:bg-purple hover:text-white"
                      >
                        Resend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedNotification(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase text-purple">{selectedNotification.channel} Message</span>
                <h3 className="font-display text-lg font-bold">{selectedNotification.type}</h3>
              </div>
              <button onClick={() => setSelectedNotification(null)} className="rounded-full bg-canvas px-3 py-1 text-xs">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="rounded-xl bg-canvas p-3">
                <p className="text-[9px] font-bold uppercase text-ink/40">Recipient</p>
                <p className="font-semibold text-ink">{selectedNotification.recipient}</p>
              </div>

              <div className="rounded-xl border border-purple/10 p-4 space-y-2">
                <p className="font-bold text-purple">{selectedNotification.subject}</p>
                <p className="text-ink/75 leading-relaxed whitespace-pre-wrap">{selectedNotification.body}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setSelectedNotification(null)} className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
