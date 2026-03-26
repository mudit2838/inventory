"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Users, Phone, Mail, ShoppingCart, History } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?search=${search}`);
      const data = await res.json();
      if (res.ok) setCustomers(data);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Customer added");
      setIsPanelOpen(false);
      setFormData({ name: "", phone: "", email: "" });
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC] p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage client relationships and dues</p>
        </div>
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#714B67] hover:bg-[#5C3D54] text-white px-4 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E2E8F0]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all"
            />
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
             <div className="p-12 text-center text-slate-500 text-sm">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center px-4">
              <Users className="h-10 w-10 text-slate-300 mb-3" />
              No customers found
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-[#F8FAFC] text-[10px] uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Customer info</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Contact</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0] text-right">Total Purchases</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0] text-right">Credit Due</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {customers.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3EEF7] text-[10px] font-bold text-[#714B67]">
                              {c.name.slice(0,2).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="space-y-1">
                            {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400"/> {c.phone}</div>}
                            {c.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400"/> {c.email}</div>}
                            {!c.phone && !c.email && <span className="text-xs italic text-slate-400">No contact info</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                          ₹{c.totalPurchases.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {c.totalDue > 0 ? (
                            <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded text-xs">₹{c.totalDue.toLocaleString()} Due</span>
                          ) : (
                            <span className="text-emerald-600 font-medium text-xs">Cleared</span>
                          )}
                        </td>
                        <td className="px-6 py-4 flex items-center justify-end gap-2">
                          <Link 
                            href={`/dashboard/sell?customerId=${c._id}`}
                            className="p-1.5 bg-[#714B67]/10 hover:bg-[#714B67]/20 text-[#714B67] rounded transition-colors group relative"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">New Sale</span>
                          </Link>
                          <Link 
                            href={`/dashboard/customers/${c._id}`}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors group relative"
                          >
                            <History className="w-4 h-4" />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">History</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden divide-y divide-[#E2E8F0]">
                {customers.map((c) => (
                  <div key={c._id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3EEF7] text-[10px] font-bold text-[#714B67]">
                          {c.name.slice(0,2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{c.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          href={`/dashboard/sell?customerId=${c._id}`}
                          className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-md"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`/dashboard/customers/${c._id}`}
                          className="p-2 bg-slate-100 text-slate-600 rounded-md"
                        >
                          <History className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-[13px]">
                      <div className="col-span-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact</div>
                        <div className="text-slate-600 space-y-1">
                          {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400"/> {c.phone}</div>}
                          {c.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400"/> {c.email}</div>}
                          {!c.phone && !c.email && <span className="text-xs italic text-slate-400">No contact info</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Purchases</div>
                        <div className="font-medium text-slate-900">₹{c.totalPurchases.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Balance</div>
                        <div>
                          {c.totalDue > 0 ? (
                            <span className="text-red-600 font-semibold">₹{c.totalDue.toLocaleString()} Due</span>
                          ) : (
                            <span className="text-emerald-600 font-medium">Cleared</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 transform transition-all">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Email (Optional)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsPanelOpen(false)} className="flex-1 px-4 py-2 border font-medium text-sm rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#714B67] text-white font-medium text-sm rounded-md hover:bg-[#5C3D54]">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
