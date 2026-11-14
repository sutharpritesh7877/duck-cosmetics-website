"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Plus,
  Trash2,
  Shield,
  User,
  Search,
  RefreshCw,
  X,
  Lock,
  Mail,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  createdAt: string;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as "ADMIN" | "STAFF",
  });

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.success && data.staff) {
        setStaffList(data.staff);
      } else {
        toastError(data.error || "Failed to load staff list");
      }
    } catch {
      toastError("Network error while loading staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add staff member");
      }

      toastSuccess(`Staff member ${formData.name} added successfully!`);
      setModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "STAFF",
      });
      fetchStaff();
    } catch (err: any) {
      toastError(err.message || "Failed to create staff member");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    if (member.email === "admin@duckcosmetics.com") {
      toastError("Cannot delete primary root Executive Administrator.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.name} (${member.email}) from staff access?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete staff member");
      }

      toastSuccess(`Staff member ${member.name} removed successfully.`);
      setStaffList((prev) => prev.filter((s) => s.id !== member.id));
    } catch (err: any) {
      toastError(err.message || "Failed to remove staff member");
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = staffList.filter((s) => s.role === "ADMIN").length;
  const staffCount = staffList.filter((s) => s.role === "STAFF").length;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Executive Staff Governance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Staff & Team Management
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Create staff accounts, grant executive or catalog permissions, and govern team access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchStaff}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Refresh staff list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Total Authorized Accounts
          </p>
          <p className="font-serif text-3xl font-bold text-text-dark mt-1">
            {staffList.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Executive Administrators
          </p>
          <p className="font-serif text-3xl font-bold text-primary mt-1">
            {adminCount}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Operations & Support Staff
          </p>
          <p className="font-serif text-3xl font-bold text-text-dark mt-1">
            {staffCount}
          </p>
        </div>
      </div>

      {/* Staff Table Section */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Table Search Toolbar */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>

          <span className="text-xs text-text-muted">
            Showing {filteredStaff.length} of {staffList.length} team members
          </span>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-lilac/40 text-[11px] font-semibold text-text-gray uppercase tracking-wider">
                <th className="py-3 px-5">Member</th>
                <th className="py-3 px-5">Assigned Role</th>
                <th className="py-3 px-5">Access Level</th>
                <th className="py-3 px-5">Added On</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted">
                    No staff members found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const isRootAdmin = member.email === "admin@duckcosmetics.com";
                  return (
                    <tr key={member.id} className="hover:bg-lilac/30 transition">
                      {/* Name & Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-lilac border border-lilac-border flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                            {member.name.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-text-dark text-xs">{member.name}</p>
                            <p className="text-[11px] text-text-muted">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-5">
                        {member.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-white">
                            <Shield className="w-3 h-3" />
                            <span>Executive Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-lilac text-primary border border-lilac-border">
                            <User className="w-3 h-3" />
                            <span>Staff Operator</span>
                          </span>
                        )}
                      </td>

                      {/* Permissions Description */}
                      <td className="py-4 px-5 text-text-gray">
                        {member.role === "ADMIN" ? (
                          <span className="text-[11px]">Full Root Access & Team Governance</span>
                        ) : (
                          <span className="text-[11px]">Catalog, Inquiries & CMS Management</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-5 text-text-muted text-[11px] whitespace-nowrap">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        {isRootAdmin ? (
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider bg-lilac px-2 py-1 rounded">
                            Root Protected
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(member)}
                            className="p-2 rounded-lg text-text-gray hover:text-rose-600 hover:bg-rose-50 transition"
                            title={`Revoke access for ${member.name}`}
                            aria-label={`Revoke access for ${member.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Member Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-lilac flex items-center justify-center text-primary">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-xl font-bold text-text-dark">
                  Add New Staff Member
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-text-muted hover:text-text-dark hover:bg-lilac transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="elena@duckcosmetics.com"
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Temporary Access Password (Min 6 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Assigned Authority Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "STAFF" })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      formData.role === "STAFF"
                        ? "border-primary bg-lilac text-primary"
                        : "border-gray-200 text-text-gray hover:bg-lilac/40"
                    }`}
                  >
                    <p className="font-bold text-xs uppercase">Staff Operator</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Can edit catalog, pages & inquiries
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "ADMIN" })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      formData.role === "ADMIN"
                        ? "border-primary bg-lilac text-primary"
                        : "border-gray-200 text-text-gray hover:bg-lilac/40"
                    }`}
                  >
                    <p className="font-bold text-xs uppercase">Administrator</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Full access including team governance
                    </p>
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold uppercase text-text-gray hover:bg-lilac transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-60"
                >
                  {creating ? "Adding Staff..." : "Create Staff Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
