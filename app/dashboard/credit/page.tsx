"use client";

import { useState, useEffect } from "react";
import { Wallet, Search, CheckCircle2, AlertTriangle, IndianRupee } from "lucide-react";
import { toast } from "react-hot-toast";
import InvoiceModal from "@/components/InvoiceModal";

export default function CreditPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({ customerId: "", amount: "", notes: "" });

  const totalOutstanding = customers.reduce((acc, curr) => acc + (curr.totalDue || 0), 0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, cxRes] = await Promise.all([
        fetch("/api/credit"),
        fetch("/api/customers")
      ]);
      const txData = await txRes.json();
      const cxData = await cxRes.json();
      if (txRes.ok) setTransactions(txData);
      if (cxRes.ok) setCustomers(cxData.filter((c: any) => c.totalDue > 0)); // Only show customers with dues for payment
    } catch {
      toast.error("Failed to load credit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: Number(formData.amount) };
      const res = await fetch("/api/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Payment recorded successfully");
      setIsPanelOpen(false);
      setFormData({ customerId: "", amount: "", notes: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC] p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Credit & Dues</h1>
          <p className="text-sm text-slate-500">Track charges and record settlements</p>
        </div>
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#714B67] hover:bg-[#5C3D54] text-white px-4 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm w-full sm:w-auto"
        >
          <Wallet className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 h-full overflow-hidden">
        
        {/* Active Debts Sidebar */}
        <div className="w-full lg:w-80 flex flex-col bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden shrink-0">
          <div className="p-4 border-b border-[#E2E8F0] bg-amber-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Active Dues
            </h2>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Owed</div>
              <div className="text-lg font-bold text-amber-600 leading-none mt-0.5">₹{totalOutstanding.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center text-sm text-slate-500 py-4">Loading dues...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                No outstanding dues. Great job!
              </div>
            ) : (
              customers.map(c => (
                <div key={c._id} className="p-3 border border-[#E2E8F0] rounded-md hover:border-amber-200 hover:bg-amber-50/30 transition-colors flex items-center justify-between cursor-pointer" onClick={() => {
                  setFormData({ customerId: c._id, amount: String(c.totalDue), notes: "" });
                  setIsPanelOpen(true);
                }}>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.phone || "No phone"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-slate-400" />{c.totalDue.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-medium text-amber-600 mt-0.5 group-hover:underline">Settle &rarr;</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ledger History */}
        <div className="flex-1 bg-white border border-[#E2E8F0] shadow-sm rounded-lg flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Transaction Ledger</h2>
          </div>
          <div className="overflow-auto flex-1 h-full">
          {loading ? (
             <div className="p-12 text-center text-slate-500 text-sm">Loading ledger...</div>
          ) : transactions.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center">
              <Wallet className="h-10 w-10 text-slate-300 mb-3" />
              No credit transactions found
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-[#F8FAFC] text-[10px] uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Date</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Customer</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Reference</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Type</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {transactions.map((tx) => (
                      <tr 
                        key={tx._id} 
                        className={`transition-colors ${tx.sale ? 'hover:bg-[#F8FAFC] cursor-pointer group' : 'hover:bg-slate-50'}`}
                        onClick={() => { if (tx.sale) setSelectedInvoice(tx.sale); }}
                      >
                        <td className="px-6 py-4">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{tx.customer?.name || "Unknown"}</span>
                        </td>
                        <td className="px-6 py-4">
                          {tx.sale ? (
                            <div className="flex flex-col">
                              <span className="text-slate-900 font-medium group-hover:text-[#714B67]">Invoice #{tx.sale.saleNumber}</span>
                              <span className="text-[10px] text-slate-400">Click to view details</span>
                            </div>
                          ) : (
                            <span className="text-slate-600">{tx.notes}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {tx.type === 'charge' ? (
                             <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded">
                               Charge
                             </span>
                          ) : (
                             <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#D1FAE5] text-[#065F46] px-2 py-0.5 rounded">
                               <CheckCircle2 className="w-3 h-3" /> Payment
                             </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          <span className={tx.type === 'charge' ? 'text-red-600' : 'text-emerald-600'}>
                             {tx.type === 'charge' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden divide-y divide-[#E2E8F0]">
                {transactions.map((tx) => (
                  <div 
                    key={tx._id} 
                    className="p-4 space-y-2 active:bg-slate-50 transition-colors"
                    onClick={() => { if (tx.sale) setSelectedInvoice(tx.sale); }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{tx.customer?.name || "Unknown"}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${tx.type === 'charge' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {tx.type === 'charge' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-600 italic">
                        {tx.sale ? `Invoice #${tx.sale.saleNumber}` : tx.notes}
                      </div>
                      {tx.type === 'charge' ? (
                         <span className="text-[9px] font-bold bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded uppercase">Charge</span>
                      ) : (
                         <span className="text-[9px] font-bold bg-[#D1FAE5] text-[#065F46] px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                           <CheckCircle2 className="w-2.5 h-2.5" /> Payment
                         </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 transform transition-all">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Record Payment</h2>
            
            {customers.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-sm">
                No customers currently have dues.
                <button onClick={() => setIsPanelOpen(false)} className="mt-4 w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Customer</label>
                  <select required value={formData.customerId} onChange={e => {
                    const c = customers.find(x => x._id === e.target.value);
                    setFormData({...formData, customerId: e.target.value, amount: c ? String(c.totalDue) : "" });
                  }} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm bg-white focus:ring-[#714B67]/20 focus:border-[#714B67]">
                    <option value="">Select a customer...</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name} (Due: ₹{c.totalDue})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Payment Amount (₹)</label>
                  <input required type="number" min="1" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm focus:ring-[#714B67]/20 focus:border-[#714B67]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
                  <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Cash settlement" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm focus:ring-[#714B67]/20 focus:border-[#714B67]" />
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsPanelOpen(false)} className="flex-1 px-4 py-2 border border-[#E2E8F0] font-medium text-sm rounded-md hover:bg-slate-50 text-slate-700">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-[#714B67] text-white font-medium text-sm rounded-md hover:bg-[#5C3D54]">Confirm</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <InvoiceModal sale={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </div>
  );
}
