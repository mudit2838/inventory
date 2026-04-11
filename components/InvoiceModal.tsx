"use client";

import { X, Receipt, Download, Printer } from "lucide-react";
import { exportInvoiceToCsv } from "@/lib/excel-utils";

interface SaleItem {
  name: string;
  quantity: number;
  sellingPrice: number;
}

interface Sale {
  saleNumber: string;
  createdAt: string;
  customer?: {
    name: string;
    phone: string;
  };
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  totalAmount: number;
  paymentType: string;
}

interface InvoiceModalProps {
  sale: Sale;
  onClose: () => void;
}

export default function InvoiceModal({ sale, onClose }: InvoiceModalProps) {
  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-200 printable-area">
        
        {/* Print Only Header */}
        <div className="hidden print-only p-8 border-b-2 border-slate-900 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">STOCK IQ</h1>
              <p className="text-sm font-bold text-slate-500">INVENTORY & SALES MANAGEMENT</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-900 uppercase">Tax Invoice</h2>
              <p className="text-xs font-mono text-slate-500">#{sale.saleNumber}</p>
            </div>
          </div>
        </div>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-none mb-1">Sale Invoice</h3>
              <p className="text-xs text-slate-500 font-mono">{sale.saleNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-1.5 rounded-md transition-colors no-print">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] print:max-h-none print:overflow-visible text-sm">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-[#E2E8F0] border-dashed">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</div>
              <div className="font-semibold text-slate-900">{sale.customer?.name || sale.customerName || "Walk-in Customer"}</div>
              {(sale.customer?.phone || sale.customerPhone) && (
                <div className="text-slate-500 text-xs mt-0.5">{sale.customer?.phone || sale.customerPhone}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</div>
              <div className="font-semibold text-slate-900">{new Date(sale.createdAt).toLocaleDateString()}</div>
              <div className="text-slate-500 text-xs mt-0.5">{new Date(sale.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>

          <table className="w-full text-left mb-6">
            <thead className="text-[10px] uppercase text-slate-400 tracking-wider shrink-0 border-b border-[#E2E8F0]">
              <tr>
                <th className="py-2 font-bold">Item Description</th>
                <th className="py-2 font-bold text-center">Qty</th>
                <th className="py-2 font-bold text-right">Price</th>
                <th className="py-2 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {sale.items.map((item: SaleItem, idx: number) => (
                <tr key={idx}>
                  <td className="py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="py-3 text-center text-slate-600 font-mono text-xs">{item.quantity}</td>
                  <td className="py-3 text-right text-slate-600 font-mono text-xs">₹{item.sellingPrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-semibold text-slate-800">₹{(item.quantity * item.sellingPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Payment Method:</span>
                <span className="font-medium uppercase">{sale.paymentType}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount:</span>
                <span>₹{sale.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Print Only Footer */}
          <div className="hidden print-only mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-sm font-semibold text-slate-900">Thank you for your business!</p>
            <p className="text-[10px] text-slate-400 mt-1">This is a computer-generated invoice and does not require a physical signature.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex justify-end gap-2 no-print">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 border border-[#E2E8F0] shadow-sm bg-white text-slate-500 hover:bg-slate-50 rounded-md font-medium text-xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button 
            onClick={() => exportInvoiceToCsv(sale)}
            className="px-4 py-2 bg-[#714B67] text-white hover:bg-[#5a3c52] rounded-md font-bold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>

      </div>
    </div>
  );
}
