import { useState } from "react";
import { StaffUser, StaffRole } from "../../../types";
import { db } from "../../../backend/db";
import { authService, ROLE_PERMISSIONS } from "../../../backend/authService";

const ROLES: StaffRole[] = [
  "Owner / Super Admin",
  "Admin Manager",
  "Order Processing",
  "Packing Staff",
  "Shipping Staff",
  "Finance Staff",
  "Customer Support",
];

export function StaffPermissionsModule() {
  const currentStaff = authService.getCurrentUser();
  const staffList = db.getStaff();

  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const canManage = authService.can("staff:manage", currentStaff);

  const handleSaveStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const role = form.get("role") as StaffRole;

    const staffData: StaffUser = {
      id: editingStaff?.id || `stf-${Date.now()}`,
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      role,
      isActive: form.get("isActive") === "true",
      permissions: ROLE_PERMISSIONS[role] || [],
      createdAt: editingStaff?.createdAt || new Date().toISOString(),
    };

    db.saveStaff(staffData, currentStaff.name, currentStaff.role);
    setFeedback(`Staff account ${staffData.name} saved.`);
    setEditingStaff(null);
    setIsNewModalOpen(false);
  };

  const handleSwitchActiveRole = (s: StaffUser) => {
    authService.setCurrentUser(s);
    setFeedback(`Now viewing dashboard as ${s.name} (${s.role}).`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Access Control & Team</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Staff & Permissions ({staffList.length})</h2>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditingStaff(null);
              setIsNewModalOpen(true);
            }}
            className="rounded-full bg-purple px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-purple-dark shadow-sm"
          >
            + Add Staff Member
          </button>
        )}
      </div>

      {feedback && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {feedback}
        </div>
      )}

      {/* Current Active Staff Badge */}
      <div className="flex items-center justify-between rounded-2xl bg-lilac/50 p-4 border border-purple/15">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-purple font-bold text-white text-sm">
            {currentStaff.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <span className="text-[9px] font-bold text-purple uppercase">Currently Signed In As:</span>
            <strong className="block text-sm text-purple-dark">{currentStaff.name}</strong>
            <span className="text-xs text-ink/60 font-semibold">{currentStaff.role} · {currentStaff.email}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="rounded-full bg-purple px-3 py-1 text-[9px] font-bold text-white uppercase">
            Active Session
          </span>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Staff Member</th>
                <th className="px-4 py-3.5">Assigned Operational Role</th>
                <th className="px-4 py-3.5">Contact Email & Phone</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {staffList.map((s) => (
                <tr key={s.id} className="transition hover:bg-canvas/30">
                  <td className="px-4 py-3.5">
                    <strong className="block text-ink font-semibold">{s.name}</strong>
                    <span className="text-[10px] text-ink/40">ID: {s.id}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-lilac px-3 py-1 text-[10px] font-bold text-purple">
                      {s.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-ink/80">{s.email}</div>
                    <small className="text-ink/45">{s.phone}</small>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                        s.isActive ? "bg-mint text-purple-dark" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => handleSwitchActiveRole(s)}
                      className="rounded-full bg-canvas px-3 py-1 text-[10px] font-bold text-purple uppercase hover:bg-lilac transition"
                    >
                      Test as this user
                    </button>
                    {canManage && (
                      <button
                        onClick={() => setEditingStaff(s)}
                        className="rounded-full bg-purple/10 px-3 py-1 text-[10px] font-bold text-purple uppercase hover:bg-purple hover:text-white transition"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Card */}
      <section className="rounded-2xl border border-purple/10 bg-white p-6 shadow-sm">
        <h3 className="font-display text-xl font-bold text-purple-dark">Role-Based Access Control (RBAC) Matrix</h3>
        <p className="mt-1 text-xs text-ink/50">
          Granular permission policies governing operations in the Duck Cosmetics dashboard.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          {ROLES.map((role) => (
            <div key={role} className="rounded-xl border border-purple/10 bg-canvas/40 p-4">
              <strong className="block text-sm font-bold text-purple-dark">{role}</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {(ROLE_PERMISSIONS[role] || []).map((perm) => (
                  <span key={perm} className="rounded bg-white px-2 py-0.5 text-[9px] font-mono text-ink/70 border border-purple/10">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Staff Modal */}
      {(isNewModalOpen || editingStaff) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            setIsNewModalOpen(false);
            setEditingStaff(null);
          }}
        >
          <form
            onSubmit={handleSaveStaff}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-display text-xl font-bold text-purple-dark">
              {editingStaff ? `Edit: ${editingStaff.name}` : "Add Staff Account"}
            </h3>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Full Name</span>
              <input
                name="name"
                defaultValue={editingStaff?.name || ""}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Staff Email</span>
              <input
                type="email"
                name="email"
                defaultValue={editingStaff?.email || ""}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Mobile Phone</span>
              <input
                name="phone"
                defaultValue={editingStaff?.phone || ""}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Operational Role</span>
              <select
                name="role"
                defaultValue={editingStaff?.role || "Order Processing"}
                className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none font-semibold"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Account Active</span>
              <select
                name="isActive"
                defaultValue={editingStaff?.isActive !== false ? "true" : "false"}
                className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none"
              >
                <option value="true">Active</option>
                <option value="false">Disabled / Suspended</option>
              </select>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsNewModalOpen(false);
                  setEditingStaff(null);
                }}
                className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark"
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
