"use client";

import { useState, useEffect } from "react";
import { FileText, Printer, Search, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ReportsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      if (res.ok) setSales(data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  // Aggregations
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.totalProfit, 0);
  const totalItems = sales.reduce((sum, s) => sum + s.items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0), 0);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Hide on print */}
      <div className="print:hidden p-5 md:p-6 space-y-6 flex-1 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Financial Reports</h1>
            <p className="text-sm text-slate-500">Analyze sales performance and export data</p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            Export PDF / Print
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 border border-[#E2E8F0] rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-500 block mb-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-sm outline-none focus:border-[#714B67]"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-500 block mb-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-sm outline-none focus:border-[#714B67]"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border text-center border-[#E2E8F0] rounded-lg p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-slate-900">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-white border text-center border-[#E2E8F0] rounded-lg p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Net Profit</div>
            <div className="text-3xl font-bold text-emerald-600">₹{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-white border text-center border-[#E2E8F0] rounded-lg p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Items Sold</div>
            <div className="text-3xl font-bold text-blue-600">{totalItems.toLocaleString()}</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden">
          {loading ? (
             <div className="p-10 text-center text-slate-500 text-sm">Loading report...</div>
          ) : sales.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center">
              <FileText className="h-10 w-10 text-slate-300 mb-3" />
              No sales found in this period.
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F8FAFC] text-[10px] uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">D/T</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Invoice</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Customer</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Payment</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0] text-right">Revenue</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0] text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {sales.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 whitespace-nowrap text-slate-500">
                          {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap font-medium text-slate-900">{s.saleNumber}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-slate-700">{s.customer?.name || 'Walk-in'}</td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="uppercase text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">{s.paymentType}</span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right font-medium text-slate-900">₹{s.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-right font-medium text-emerald-600">₹{s.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-[#E2E8F0]">
                {sales.map((s) => (
                  <div key={s._id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-slate-900">#{s.saleNumber}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">₹{s.totalAmount.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-emerald-600">+₹{s.totalProfit.toLocaleString()} profit</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-slate-600 font-medium">{s.customer?.name || 'Walk-in'}</div>
                      <span className="uppercase text-[9px] bg-slate-100 font-bold px-1.5 py-0.5 rounded text-slate-500">{s.paymentType}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Print-Only View */}
      <div className="hidden print:block p-8 bg-white">
        <h1 className="text-2xl font-bold mb-1">Sales Report</h1>
        <p className="text-slate-500 mb-6">Period: {startDate} to {endDate}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-slate-300 p-4 rounded text-center">
            <div className="text-xs uppercase text-slate-500 mb-1">Total Revenue</div>
            <div className="text-xl font-bold">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="border border-slate-300 p-4 rounded text-center">
            <div className="text-xs uppercase text-slate-500 mb-1">Net Profit</div>
            <div className="text-xl font-bold">₹{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="border border-slate-300 p-4 rounded text-center">
            <div className="text-xs uppercase text-slate-500 mb-1">Items Sold</div>
            <div className="text-xl font-bold">{totalItems.toLocaleString()}</div>
          </div>
        </div>

        <table className="w-full text-sm text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-2">Date</th>
              <th className="border border-slate-300 p-2">Invoice</th>
              <th className="border border-slate-300 p-2">Customer</th>
              <th className="border border-slate-300 p-2 text-right">Revenue</th>
              <th className="border border-slate-300 p-2 text-right">Profit</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s._id}>
                <td className="border border-slate-300 p-2">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="border border-slate-300 p-2">{s.saleNumber}</td>
                <td className="border border-slate-300 p-2">{s.customer?.name || 'Walk-in'}</td>
                <td className="border border-slate-300 p-2 text-right">₹{s.totalAmount.toLocaleString()}</td>
                <td className="border border-slate-300 p-2 text-right">₹{s.totalProfit.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-12 text-center text-xs text-slate-400">
          Generated automatically by StockIQ.
        </div>
      </div>
    </div>
  );
}
