import { useState } from "react";
import { StaffUser } from "../../types";
import { authService } from "../../backend/authService";

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStaff: StaffUser;
  onUpdated: () => void;
}

export function StaffProfileModal({ isOpen, onClose, currentStaff, onUpdated }: StaffProfileModalProps) {
  const [name, setName] = useState(currentStaff.name);
  const [phone, setPhone] = useState(currentStaff.phone);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword) {
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirmation password do not match.");
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      const result = authService.updateProfile({
        name,
        phone,
        password: newPassword || undefined,
      });

      setLoading(false);
      if (result.success) {
        setSuccess("Profile details and security credentials updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
        onUpdated();
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(result.error || "Failed to update profile.");
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-purple/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-dark to-purple p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white font-bold text-purple text-lg shadow-sm">
              {currentStaff.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <span className="text-[9px] font-bold tracking-wider text-lilac uppercase">Staff Profile & Credentials</span>
              <h3 className="font-display text-xl font-bold">{currentStaff.name}</h3>
              <p className="text-xs text-lilac/80">{currentStaff.role}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold">
              ✓ {success}
            </div>
          )}

          {/* Locked Assigned Duty */}
          <div className="rounded-2xl bg-canvas p-3 border border-purple/10 flex items-center justify-between text-xs">
            <div>
              <span className="block text-[8px] font-bold text-ink/40 uppercase">Assigned Operational Duty</span>
              <strong className="text-purple-dark text-xs">{currentStaff.role}</strong>
            </div>
            <span className="rounded-full bg-purple/10 px-2.5 py-0.5 text-[9px] font-bold text-purple uppercase">
              Duty Locked
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-purple mb-1">
              Corporate Email (Login ID)
            </label>
            <input
              type="email"
              disabled
              value={currentStaff.email}
              className="w-full rounded-xl border border-purple/10 bg-canvas/70 px-3.5 py-2 text-xs font-semibold text-ink/60 cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-purple mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-purple/20 bg-canvas px-3.5 py-2 text-xs font-semibold text-ink outline-none focus:border-purple focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-purple mb-1">
              Contact Mobile Phone
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-purple/20 bg-canvas px-3.5 py-2 text-xs font-semibold text-ink outline-none focus:border-purple focus:bg-white"
            />
          </div>

          {/* Password Change Section */}
          <div className="border-t border-purple/10 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple">
                Change Security Password
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-purple hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="space-y-2">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (optional)"
                className="w-full rounded-xl border border-purple/20 bg-canvas px-3.5 py-2 text-xs font-semibold text-ink outline-none focus:border-purple focus:bg-white"
              />
              {newPassword && (
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-purple/20 bg-canvas px-3.5 py-2 text-xs font-semibold text-ink outline-none focus:border-purple focus:bg-white"
                />
              )}
            </div>
            <small className="block mt-1 text-[9px] text-ink/45">
              Leave blank if you do not want to change your current password.
            </small>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-purple/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
