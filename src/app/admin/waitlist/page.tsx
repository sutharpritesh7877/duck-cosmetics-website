"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Download,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const pageSize = 15;

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist");
      const data = await res.json();
      if (data.success && data.waitlist) {
        setEntries(data.waitlist);
      } else {
        toastError(data.error || "Failed to load waitlist entries");
      }
    } catch {
      toastError("Network error while loading waitlist entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export-csv");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `duck_cosmetics_vip_waitlist_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toastSuccess(`Exported ${entries.length} waitlist emails to CSV successfully.`);
    } catch (err: any) {
      toastError(err.message || "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  // Derive distinct sources
  const sources = Array.from(new Set(entries.map((e) => e.source || "Hero CTA")));

  // Filter & Search Logic
  const filtered = entries.filter((item) => {
    const matchesSearch = item.email.toLowerCase().includes(search.toLowerCase());
    const matchesSource =
      sourceFilter === "ALL" ? true : (item.source || "").toLowerCase().includes(sourceFilter.toLowerCase());
    return matchesSearch && matchesSource;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Audience & Leads</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            VIP Pre-Launch Waitlist
          </h1>
          <p className="font-sans text-xs sm:text-sm text-text-gray mt-1">
            Browse captured buyer emails, trace signup attribution source, and export for marketing automation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchWaitlist}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Refresh list"
            aria-label="Refresh waitlist"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exporting || entries.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-sans text-xs font-semibold uppercase tracking-wider transition shadow-md shadow-primary/10 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? "Exporting..." : "Export to CSV"}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search email address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs font-sans text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-white transition"
          />
        </div>

        {/* Source Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Source:
          </span>
          <button
            onClick={() => {
              setSourceFilter("ALL");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold tracking-wider uppercase transition shrink-0 ${
              sourceFilter === "ALL"
                ? "bg-primary text-white"
                : "bg-lilac text-text-gray hover:text-text-dark"
            }`}
          >
            All Sources ({entries.length})
          </button>

          {sources.slice(0, 4).map((src) => (
            <button
              key={src}
              onClick={() => {
                setSourceFilter(src);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold tracking-wider uppercase transition shrink-0 truncate max-w-[180px] ${
                sourceFilter === src
                  ? "bg-primary text-white"
                  : "bg-lilac text-text-gray hover:text-text-dark"
              }`}
              title={src}
            >
              {src.length > 20 ? `${src.slice(0, 18)}...` : src}
            </button>
          ))}
        </div>
      </div>

      {/* Waitlist Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-lilac/70 border-b border-gray-200 text-[11px] font-sans font-semibold uppercase tracking-wider text-text-gray">
                <th className="py-3.5 px-5">Subscriber Email</th>
                <th className="py-3.5 px-5">Attribution Source</th>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5 text-right">VIP Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-sans">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-text-muted">
                    Loading VIP waitlist entries...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-text-muted">
                    No waitlist subscribers found.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-lilac/30 transition">
                    {/* Email */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-lilac border border-lilac-border flex items-center justify-center text-primary shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-text-dark font-sans text-sm">
                          {item.email}
                        </span>
                      </div>
                    </td>

                    {/* Attribution Source */}
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lilac border border-lilac-border text-[11px] font-medium text-text-dark">
                        <Sparkles className="w-3 h-3 text-primary shrink-0" />
                        <span>{item.source || "Hero CTA"}</span>
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-5 text-text-gray">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* VIP Status */}
                    <td className="py-4 px-5 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-purple-50 text-primary border border-purple-100 text-[10px] font-bold uppercase tracking-wider">
                        VIP Early Access
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-text-gray">
          <span>
            Showing {paginated.length} of {filtered.length} captured emails
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-lilac transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-text-dark">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-lilac transition"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
