"use client";

import { useState } from "react";
import { Calendar, ShoppingCart, Download } from "lucide-react";
import { exportHistoryToCsv } from "@/lib/excel-utils";
import InvoiceModal from "./InvoiceModal";

export default function SalesHistoryTable({ sales, showCustomer = false }: { sales: any[], showCustomer?: boolean }) {
  const [selectedSale, setSelectedSale] = useState<any | null>(null);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-slate-500">
          Showing {sales.length} transactions
        </div>
        {sales.length > 0 && (
          <button 
            onClick={() => exportHistoryToCsv(sales)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] shadow-sm hover:bg-slate-50 text-[#714B67] rounded-lg text-sm font-semibold transition-all hover:border-[#714B67]/30"
          >
            <Download className="w-4 h-4" />
            Download History
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <ShoppingCart className="w-12 h-12 text-slate-200 mb-3" />
            <p>No purchases recorded yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-[#F8FAFC] text-[10px] uppercase text-slate-500 tracking-wider sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Date</th>
                    <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Invoice</th>
                    {showCustomer && <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Customer</th>}
                    <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Items</th>
                    <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Payment</th>
                    <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {sales.map((s) => (
                    <tr 
                      key={s._id} 
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedSale(s)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 ml-5">{new Date(s.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {s.saleNumber}
                      </td>
                      {showCustomer && (
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {s.customer?.name || s.customerName || "Walk-in Customer"}
                          {s.customerPhone && <div className="text-[10px] font-normal text-slate-400">{s.customerPhone}</div>}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {s.items.map((item: any, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs">
                              {item.name} <span className="font-bold text-slate-400">x{item.quantity}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`uppercase text-[10px] px-2 py-1 rounded font-bold ${
                          s.paymentType === 'cash' ? 'bg-emerald-50 text-emerald-700' :
                          s.paymentType === 'credit' ? 'bg-amber-50 text-amber-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {s.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        ₹{s.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-[#E2E8F0]">
              {sales.map((s) => (
                <div 
                  key={s._id} 
                  className="p-4 space-y-3 active:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedSale(s)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-semibold text-[#714B67] mb-1">#{s.saleNumber}</div>
                      <div className="text-sm font-bold text-slate-900">
                        {showCustomer ? (s.customer?.name || s.customerName || "Walk-in") : "Sale Entry"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">₹{s.totalAmount.toLocaleString()}</div>
                      <span className={`uppercase text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        s.paymentType === 'cash' ? 'bg-emerald-50 text-emerald-700' :
                        s.paymentType === 'credit' ? 'bg-amber-50 text-amber-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {s.paymentType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                    <div>{new Date(s.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="flex-1 text-right italic truncate">
                      {s.items.length} {s.items.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <InvoiceModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </>
  );
}
