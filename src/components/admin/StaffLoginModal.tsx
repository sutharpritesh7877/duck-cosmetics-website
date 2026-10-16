import { useState } from "react";
import { authService } from "../../backend/authService";

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StaffLoginModal({ isOpen, onClose, onSuccess }: StaffLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = authService.loginStaff(email, password);
      setLoading(false);
      if (result.success) {
        setEmail("");
        setPassword("");
        onSuccess();
      } else {
        setError(result.error || "Authentication failed. Invalid staff credentials.");
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-dark/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-purple-dark via-purple to-purple-dark p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 p-2 shadow-inner border border-white/25">
            <img src="/duck-logo.png" alt="Duck Cosmetics" className="h-10 w-10 object-contain drop-shadow" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-lilac">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            OMS Secure Staff Gate
          </div>

          <h2 className="mt-2 font-display text-2xl font-bold">Duck Personnel Sign-In</h2>
          <p className="mt-1 text-xs text-lilac/80">Authorized Staff & Super Admin Access Only</p>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <strong className="block font-bold">Authentication Failed</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-purple mb-1">
                Corporate Username / Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your corporate email address"
                className="w-full rounded-xl border border-purple/20 bg-canvas px-4 py-2.5 text-sm font-semibold text-ink outline-none transition focus:border-purple focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-purple">
                  Security Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  className="w-full rounded-xl border border-purple/20 bg-canvas px-4 py-2.5 pr-11 text-sm font-semibold text-ink outline-none transition focus:border-purple focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink/50 hover:text-purple"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-purple py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple/25 transition hover:bg-purple-dark disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Admin OMS"}
            </button>
          </form>

          {/* Security Notice & Store Link */}
          <div className="flex items-center justify-between pt-4 border-t border-purple/10 text-[10px] text-ink/50">
            <span className="flex items-center gap-1 font-medium">
              🔒 256-Bit Encrypted Audit Ledger
            </span>
            <button
              type="button"
              onClick={onClose}
              className="font-bold text-purple uppercase hover:underline"
            >
              ← Back to Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
