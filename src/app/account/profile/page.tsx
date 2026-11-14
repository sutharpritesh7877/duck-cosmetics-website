"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AccountProfilePage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/account/profile")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.profile) {
          setProfileForm({
            name: data.profile.name || "",
            email: data.profile.email || "",
            phone: data.profile.phone || "",
          });
        }
      })
      .catch((err) => {
        console.warn("Profile fetch error:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toastError("Name and Email are required.");
      return;
    }

    setProfileSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess("Your profile details have been saved.");
        // Update localStorage
        const stored = localStorage.getItem("duck_customer");
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "duck_customer",
            JSON.stringify({ ...parsed, name: profileForm.name, email: profileForm.email })
          );
        }
      } else {
        toastError(data.error || "Failed to update profile.");
      }
    } catch {
      toastError("Network error while updating profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toastError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toastError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess("Your password has been changed securely.");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toastError(data.error || "Failed to change password.");
      }
    } catch {
      toastError("Network error while updating password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-text-dark font-normal">
          Personal Profile & Security
        </h2>
        <p className="text-xs sm:text-sm text-text-gray mt-1">
          Manage your personal atelier identity, verified contact details, and account credentials.
        </p>
      </div>

      {/* 1. Profile Information Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-lilac-border shadow-xs">
        <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-lilac flex items-center justify-center text-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-text-dark">Profile Details</h3>
            <p className="text-xs text-text-muted">Used for order dispatches, invoicing, and VIP correspondence.</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Lady Vivienne Montgomery"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  required
                />
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  required
                />
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-2">
              Contact Telephone / WhatsApp
            </label>
            <div className="relative max-w-sm">
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+91 98250 12345"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
              />
              <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-text-muted mt-1.5">
              Used strictly for courier tracking updates and WhatsApp atelier delivery alerts.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm shadow-primary/20 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{profileSaving ? "Saving..." : "Save Profile Details"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Password & Security Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-lilac-border shadow-xs">
        <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-lilac flex items-center justify-center text-primary">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-text-dark">Change Password</h3>
            <p className="text-xs text-text-muted">Ensure your account is protected with a 256-bit encrypted credential.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                required
              />
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                  required
                />
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                  required
                />
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm shadow-primary/20 disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{passwordSaving ? "Updating..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
