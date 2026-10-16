import { useState } from "react";
import { db } from "../../../backend/db";

export function SecurityAuditModule() {
  const auditLogs = db.getRaw().auditLogs;
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");

  const filtered = auditLogs.filter((log) => {
    if (moduleFilter !== "All" && log.module !== moduleFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(term) ||
        log.staffName.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        (log.targetId && log.targetId.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Data Integrity & Security</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Security & Audit Logs ({auditLogs.length})</h2>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple/10 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search audit trail by action, staff, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-w-[16rem] flex-1 rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs outline-none focus:border-purple"
        />

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="All">All Operations Modules</option>
          <option value="Orders">Orders</option>
          <option value="Inventory">Inventory</option>
          <option value="Shipping">Shipping</option>
          <option value="Payments">Payments</option>
          <option value="Returns & Refunds">Returns & Refunds</option>
          <option value="Staff & Permissions">Staff & Permissions</option>
          <option value="Settings">Settings</option>
          <option value="Products">Products</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Module</th>
                <th className="px-4 py-3.5">Action Executed</th>
                <th className="px-4 py-3.5">Details & Changes</th>
                <th className="px-4 py-3.5">Acting Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="transition hover:bg-canvas/30">
                  <td className="px-4 py-3.5 font-mono text-[11px] text-ink/50 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString("en-IN")}{" "}
                    <span className="block text-[10px] text-ink/35">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-md bg-lilac/80 px-2 py-0.5 text-[9px] font-bold text-purple uppercase">
                      {log.module}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-purple-dark">{log.action}</td>
                  <td className="px-4 py-3.5 text-ink/75 leading-relaxed max-w-md">{log.details}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <strong className="block text-ink">{log.staffName}</strong>
                    <small className="text-[10px] text-ink/40">{log.staffRole}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
