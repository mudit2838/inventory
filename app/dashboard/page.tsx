"use client";

import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { 
  LayoutDashboard, 
  LogOut, 
  PlusCircle, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Package, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ChevronRight,
  History,
  Coins
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

type Product = {
  _id: string;
  name: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  shelf: string;
  stockStatus: 'low' | 'ok';
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalSales: 0, totalProfit: 0 });
  const [dailySummary, setDailySummary] = useState<Array<{ _id: string; totalAmount: number; totalProfit: number; count: number }>>([]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Load all products for the low-stock overview (simplified for dashboard)
      const res = await fetch(`/api/products?limit=100`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      toast.error('Unable to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadSummary() {
    setReportLoading(true);
    try {
      const res = await fetch('/api/sales');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStats({ totalSales: data.stats?.totalSales || 0, totalProfit: data.stats?.totalProfit || 0 });
      setDailySummary(data.dailySummary || []);
    } catch {
      toast.error('Unable to load dashboard stats');
    } finally {
      setReportLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    loadSummary();
  }, [loadProducts]);

  const lowStockProducts = useMemo(() => 
    products.filter(p => p.stockStatus === 'low').slice(0, 5), 
  [products]);

  const chartData = useMemo(() => {
    return dailySummary.map(day => ({
      name: day._id,
      sales: day.totalAmount,
      profit: day.totalProfit
    })).reverse();
  }, [dailySummary]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[40%] bg-fuchsia-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 truncate">Business Command Center</h1>
              <p className="text-sm text-slate-500 truncate">Welcome back, <span className="text-indigo-600 font-semibold">{session?.user?.name || "Partner"}</span></p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 font-medium text-sm border border-slate-200 w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[
            { label: "Total Revenue", value: stats.totalSales, icon: Coins, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
            { label: "Net Profit", value: stats.totalProfit, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Products in Inventory", value: products.length, icon: Package, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Total Transactions", value: dailySummary.reduce((sum, d) => sum + d.count, 0), icon: BarChart3, color: "text-fuchsia-600", bg: "bg-fuchsia-50", border: "border-fuchsia-100" }
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 p-6 rounded-3xl hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300 border ${stat.border}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-widest border border-slate-100">
                  Live
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                {typeof stat.value === 'number' && i < 2 ? `₹${stat.value.toLocaleString()}` : stat.value}
              </h2>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 ml-2 text-slate-800">
            <PlusCircle className="w-5 h-5 text-indigo-500" />
            Priority Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dashboard/sell" className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300">
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center mb-4 text-white shadow-md shadow-indigo-200">
                   <ShoppingCart className="w-6 h-6" />
                 </div>
                 <h4 className="text-xl font-bold text-slate-900 mb-1">New Sale</h4>
                 <p className="text-slate-500 text-sm">Launch POS terminal & checkout</p>
               </div>
               <ArrowUpRight className="absolute top-6 right-6 w-6 h-6 text-slate-300 group-hover:text-indigo-500 transition-colors" />
               <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            </Link>

            <Link href="/dashboard/inventory" className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-amber-500 hover:shadow-amber-100/50 hover:-translate-y-1 transition-all duration-300">
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-600 border border-amber-200">
                   <Package className="w-6 h-6" />
                 </div>
                 <h4 className="text-xl font-bold text-slate-900 mb-1">Manage Stock</h4>
                 <p className="text-slate-500 text-sm">Review & update your inventory</p>
               </div>
               <ChevronRight className="absolute top-6 right-6 w-6 h-6 text-slate-300 group-hover:text-amber-500 transition-colors" />
            </Link>

            <Link href="/dashboard/customers" className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300">
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-600 border border-emerald-200">
                   <Users className="w-6 h-6" />
                 </div>
                 <h4 className="text-xl font-bold text-slate-900 mb-1">Customer CRM</h4>
                 <p className="text-slate-500 text-sm">Manage client data & balances</p>
               </div>
               <ChevronRight className="absolute top-6 right-6 w-6 h-6 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </Link>

            <Link href="/dashboard/reports" className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-fuchsia-500 hover:shadow-fuchsia-100/50 hover:-translate-y-1 transition-all duration-300">
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center mb-4 text-fuchsia-600 border border-fuchsia-200">
                   <BarChart3 className="w-6 h-6" />
                 </div>
                 <h4 className="text-xl font-bold text-slate-900 mb-1">Analytics</h4>
                 <p className="text-slate-500 text-sm">Deep dive into sales reports</p>
               </div>
               <ChevronRight className="absolute top-6 right-6 w-6 h-6 text-slate-300 group-hover:text-fuchsia-500 transition-colors" />
            </Link>
          </div>
        </section>

        {/* Main Insights Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 md:p-8 rounded-[32px] shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Sales Trend</h3>
                <p className="text-sm text-slate-500">Revenue performance over the last week</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Sales</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-fuchsia-500"></span> Profit</div>
              </div>
            </div>
            
            <div className="h-[300px] md:h-[350px] w-full mt-4 -ml-4 md:ml-0">

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#0f172a' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="profit" stroke="#d946ef" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Panels */}
          <div className="space-y-8">
            {/* Low Stock Panel */}
            <div className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Alerts
                </h3>
                <span className="text-xs text-slate-400 font-medium">Critical Stock</span>
              </div>
              <div className="space-y-4">
                {lowStockProducts.length > 0 ? lowStockProducts.map((p) => (
                  <div key={p._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-200 transition-all group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">Only {p.stock} units left</p>
                    </div>
                    <Link href={`/dashboard/inventory?search=${p.name}`} className="p-2 rounded-lg bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                      <Package className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-500">Inventory is healthy!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Mini */}
            <div className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                  <History className="w-5 h-5 text-indigo-500" />
                  Activity
                </h3>
                <Link href="/dashboard/sales" className="text-xs text-indigo-600 hover:underline font-bold">View History</Link>
              </div>
              <div className="space-y-6">
                {dailySummary.slice(0, 3).map((day, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 z-10 relative"></div>
                      {idx < 2 && <div className="absolute top-2.5 left-1 w-0.5 h-full bg-slate-100"></div>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">{day._id}</p>
                      <p className="text-sm text-slate-600">Generated <span className="text-slate-900 font-bold">₹{day.totalAmount.toLocaleString()}</span> from {day.count} sales.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
