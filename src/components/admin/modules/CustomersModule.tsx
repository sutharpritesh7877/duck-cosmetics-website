import { useState } from "react";
import { Customer } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

export function CustomersModule() {
  const currentStaff = authService.getCurrentUser();
  const customers = db.getCustomers();
  const orders = db.getOrders();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState("");
  const [feedback, setFeedback] = useState("");

  const showSensitive = authService.canViewCustomerSensitive(currentStaff);
  const canEdit = authService.can("customers:edit", currentStaff);

  const filtered = customers.filter((c) => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.phone.includes(term);
    }
    return true;
  });

  const handleAddNote = () => {
    if (!selectedCustomer || !newNote.trim()) return;
    const stamp = `[${new Date().toLocaleDateString("en-IN")} by ${currentStaff.name}]: `;
    const updated: Customer = {
      ...selectedCustomer,
      internalNotes: selectedCustomer.internalNotes
        ? `${selectedCustomer.internalNotes}\n${stamp}${newNote.trim()}`
        : `${stamp}${newNote.trim()}`,
    };
    db.saveCustomer(updated);
    setSelectedCustomer(updated);
    setNewNote("");
    setFeedback("Customer support note saved.");
  };

  const handleStatusChange = (newStatus: Customer["status"]) => {
    if (!selectedCustomer) return;
    const updated: Customer = { ...selectedCustomer, status: newStatus };
    db.saveCustomer(updated);
    setSelectedCustomer(updated);
    setFeedback(`Customer status set to ${newStatus}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">CRM & Accounts</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Customers Directory ({customers.length})</h2>
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
          placeholder="Search by customer name, email, or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-w-[16rem] flex-1 rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs outline-none focus:border-purple"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="All">All Customer Accounts</option>
          <option value="VIP">VIP Customers</option>
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Total Orders</th>
                <th className="px-4 py-3.5">Lifetime Spend</th>
                <th className="px-4 py-3.5">Primary Location</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filtered.map((customer) => {
                const primaryAddress = customer.addresses[0];
                return (
                  <tr key={customer.id} className="transition hover:bg-canvas/30">
                    <td className="px-4 py-3.5">
                      <strong className="block text-ink font-semibold">{customer.name}</strong>
                      <span className="text-[10px] text-ink/40">Registered {new Date(customer.createdAt).toLocaleDateString("en-IN")}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-ink/80">{showSensitive ? customer.phone : `${customer.phone.slice(0, 3)}•••••${customer.phone.slice(-2)}`}</div>
                      <small className="text-ink/50">{showSensitive ? customer.email : `${customer.email.slice(0, 3)}••••@•••.com`}</small>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-purple">{customer.totalOrders} orders</td>
                    <td className="px-4 py-3.5 font-bold text-purple-dark">₹{customer.totalSpent.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5 text-ink/65">
                      {primaryAddress ? `${primaryAddress.city}, ${primaryAddress.state}` : "No address saved"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                          customer.status === "VIP" ? "bg-amber-100 text-amber-800" :
                          customer.status === "Blocked" ? "bg-red-100 text-red-700" :
                          "bg-mint text-purple-dark"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="rounded-full bg-purple/10 px-3 py-1 text-[10px] font-bold text-purple uppercase hover:bg-purple hover:text-white transition"
                      >
                        View Profile & CRM
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & CRM Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedCustomer(null)}>
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[9px] font-bold tracking-wider text-purple uppercase">Customer CRM Profile</span>
                <h3 className="font-display text-2xl font-bold text-purple-dark">{selectedCustomer.name}</h3>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="rounded-full bg-canvas px-3 py-1 text-xs">✕</button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-2xl bg-canvas p-3">
                <span className="text-[9px] font-bold text-ink/40 uppercase">Total Spend</span>
                <strong className="block text-lg font-bold text-purple-dark">₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}</strong>
              </div>
              <div className="rounded-2xl bg-canvas p-3">
                <span className="text-[9px] font-bold text-ink/40 uppercase">Total Orders</span>
                <strong className="block text-lg font-bold text-purple">{selectedCustomer.totalOrders}</strong>
              </div>
              <div className="rounded-2xl bg-canvas p-3">
                <span className="text-[9px] font-bold text-ink/40 uppercase">Account Status</span>
                <strong className="block text-lg font-bold capitalize">{selectedCustomer.status}</strong>
              </div>
            </div>

            {/* Address Details */}
            {selectedCustomer.addresses[0] && (
              <div className="rounded-2xl border border-purple/10 p-4 text-xs">
                <span className="text-[9px] font-bold uppercase text-purple">Saved Delivery Address</span>
                <p className="mt-1 leading-relaxed text-ink/70">
                  {selectedCustomer.addresses[0].addressLine1}
                  {selectedCustomer.addresses[0].addressLine2 ? `, ${selectedCustomer.addresses[0].addressLine2}` : ""}
                  <br />
                  {selectedCustomer.addresses[0].city}, {selectedCustomer.addresses[0].state} – {selectedCustomer.addresses[0].pinCode}
                </p>
              </div>
            )}

            {/* Customer Purchase History */}
            <div className="rounded-2xl border border-purple/10 p-4">
              <span className="text-[9px] font-bold uppercase text-purple">Purchase History</span>
              <div className="mt-2 divide-y divide-purple/10 text-xs">
                {orders
                  .filter((o) => o.customerId === selectedCustomer.id || o.customerName === selectedCustomer.name)
                  .map((o) => (
                    <div key={o.id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-purple">{o.orderNumber}</span>
                        <span className="text-[10px] text-ink/40 ml-2">{new Date(o.createdAt).toLocaleDateString("en-IN")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">₹{o.grandTotal}</span>
                        <span className="rounded bg-lilac px-2 py-0.5 text-[8px] font-bold text-purple uppercase">{o.orderStatus}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Internal CRM Notes */}
            <div className="rounded-2xl border border-purple/10 p-4 text-xs">
              <span className="text-[9px] font-bold uppercase text-purple">Internal Support & VIP Notes</span>
              <div className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-xl bg-canvas p-3 font-mono text-[11px] text-ink/75">
                {selectedCustomer.internalNotes || "No notes recorded."}
              </div>

              {canEdit && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add CRM note about customer preferences or issues..."
                    className="flex-1 rounded-xl border border-purple/15 bg-white p-2 outline-none"
                  />
                  <button onClick={handleAddNote} className="rounded-xl bg-purple px-4 py-2 font-bold text-white uppercase text-[10px]">
                    Save Note
                  </button>
                </div>
              )}
            </div>

            {/* Change Status */}
            {canEdit && (
              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <span className="font-semibold text-ink/60">Account Classification:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange("Active")}
                    className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase ${
                      selectedCustomer.status === "Active" ? "bg-purple text-white" : "bg-canvas"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleStatusChange("VIP")}
                    className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase ${
                      selectedCustomer.status === "VIP" ? "bg-amber-500 text-white" : "bg-canvas"
                    }`}
                  >
                    VIP
                  </button>
                  <button
                    onClick={() => handleStatusChange("Blocked")}
                    className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase ${
                      selectedCustomer.status === "Blocked" ? "bg-red-600 text-white" : "bg-canvas"
                    }`}
                  >
                    Block Account
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
