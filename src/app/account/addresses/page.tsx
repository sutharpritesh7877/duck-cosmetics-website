"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Home,
  Briefcase,
  Star,
  X,
  Save,
  Phone,
  User,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Address {
  id: string;
  name: string;
  phone: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: "SHIPPING" | "BILLING";
  isDefault: boolean;
}

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    type: "SHIPPING" as "SHIPPING" | "BILLING",
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/account/addresses");
      const data = await res.json();
      if (data.success && Array.isArray(data.addresses)) {
        setAddresses(data.addresses);
      }
    } catch {
      toastError("Failed to load address book.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openCreateModal = () => {
    setEditingAddress(null);
    setFormData({
      name: "",
      phone: "",
      street1: "",
      street2: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
      type: "SHIPPING",
      isDefault: addresses.length === 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      street1: addr.street1,
      street2: addr.street2 || "",
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country || "India",
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.street1 || !formData.city || !formData.zip) {
      toastError("Please fill out all required address fields.");
      return;
    }

    setSaving(true);
    try {
      const url = editingAddress
        ? `/api/account/addresses/${editingAddress.id}`
        : "/api/account/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess(editingAddress ? "Address updated." : "Address added to book.");
        setModalOpen(false);
        fetchAddresses();
      } else {
        toastError(data.error || "Failed to save address.");
      }
    } catch {
      toastError("Network error while saving address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        toastSuccess("Address removed.");
      } else {
        toastError(data.error || "Failed to remove address.");
      }
    } catch {
      toastError("Error deleting address.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id }))
        );
        toastSuccess("Default address updated.");
      }
    } catch {
      toastError("Failed to update default address.");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-text-dark font-normal">
            Saved Address Book
          </h2>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Store primary dispatch locations for one-click checkout and VIP pre-launch allocations.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm shadow-primary/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="p-6 rounded-3xl bg-[#F8F6FA] border border-lilac-border animate-pulse h-48" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-[#F8F6FA] border border-lilac-border max-w-md mx-auto">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-lg font-bold text-text-dark">No saved addresses</h3>
          <p className="text-xs text-text-gray mt-1 max-w-xs mx-auto">
            Add your primary shipping or billing address for expedited bespoke dispatches.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between ${
                addr.isDefault
                  ? "border-primary/50 shadow-[0_10px_25px_rgba(93,58,122,0.08)] ring-1 ring-primary/20"
                  : "border-lilac-border shadow-xs hover:border-primary/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-lilac px-2.5 py-0.5 rounded-full border border-lilac-border">
                      {addr.type}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Default</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-lilac transition"
                      title="Edit Address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-serif text-base font-bold text-text-dark">
                  {addr.name}
                </h4>
                <p className="text-xs text-text-gray mt-1 leading-relaxed">
                  {addr.street1}
                  {addr.street2 && <>, {addr.street2}</>}
                  <br />
                  {addr.city}, {addr.state} {addr.zip}
                  <br />
                  {addr.country}
                </p>
                <p className="text-xs text-text-muted mt-2 font-mono">
                  Tel: {addr.phone}
                </p>
              </div>

              {!addr.isDefault && (
                <div className="mt-5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-semibold text-primary hover:underline uppercase tracking-wider"
                  >
                    Set as Default
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-lilac-border max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="font-serif text-xl font-bold text-text-dark">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-full text-text-muted hover:text-text-dark hover:bg-lilac transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priyanshu Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98250 12345"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={formData.street1}
                    onChange={(e) => setFormData({ ...formData, street1: e.target.value })}
                    placeholder="Flat / Villa / House number & street"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.street2}
                    onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
                    placeholder="Apartment, suite, landmark"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ahmedabad"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Gujarat"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      placeholder="380054"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                      Address Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                    >
                      <option value="SHIPPING">Shipping Address</option>
                      <option value="BILLING">Billing Address</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="isDefault" className="text-xs text-text-dark font-medium cursor-pointer">
                    Set as my primary default address
                  </label>
                </div>

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
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Saving..." : "Save Address"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
