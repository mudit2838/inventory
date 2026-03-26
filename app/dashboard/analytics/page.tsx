"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from "recharts";
import { TrendingUp, Package, Users, IndianRupee, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['#714B67', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/stats?range=${range}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [range]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-slate-500">
        Loading analytics...
      </div>
    );
  }

  const { stats, salesData: chartData, topProducts } = data;

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC] p-5 md:p-6 space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500">Insights and performance metrics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-1.5 rounded-lg border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center">
            <button 
              onClick={() => setRange("7d")}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${range === "7d" ? "bg-[#714B67] text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setRange("30d")}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${range === "30d" ? "bg-[#714B67] text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              30 Days
            </button>
            <button 
              onClick={() => setRange("90d")}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${range === "90d" ? "bg-[#714B67] text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              90 Days
            </button>
          </div>
          <div className="hidden sm:block w-px h-4 bg-slate-200" />
          <button className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-md border border-slate-100 sm:border-none">
            <Calendar className="w-3.5 h-3.5" />
            Custom Range
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{stats.totalSales.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Profit</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{stats.totalProfit.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Items in Stock</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.productsInStock}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#714B67]/10 rounded-full flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#714B67]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credit Owed</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{stats.creditDue.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-4 md:p-6 border border-[#E2E8F0] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 border-l-4 border-brand-500 pl-3">Revenue Trend</h3>
            <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-full">Daily Average: ₹{Math.round(chartData.reduce((acc: number, curr: any) => acc + curr.total, 0) / chartData.length).toLocaleString()}</span>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#714B67" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#714B67" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 11}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 11}}
                  tickFormatter={(value) => `₹${value >= 1000 ? (value/1000) + 'k' : value}`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="total" stroke="#714B67" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions/Sales Trend */}
        <div className="bg-white p-4 md:p-6 border border-[#E2E8F0] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 border-l-4 border-amber-500 pl-3">Sales Volume</h3>
            <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-full">Total: {chartData.reduce((acc: number, curr: any) => acc + curr.count, 0)} sales</span>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 11}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 11}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-[#E2E8F0] bg-white">
          <CardHeader className="border-b border-[#E2E8F0] pb-4">
            <CardTitle className="text-base font-semibold text-slate-900">Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155' }} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                <Bar dataKey="sales" name="Units Sold" radius={[0, 4, 4, 0]} barSize={28}>
                  {topProducts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-[#E2E8F0] bg-white">
          <CardHeader className="border-b border-[#E2E8F0] pb-4">
            <CardTitle className="text-base font-semibold text-slate-900">Product Volume Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="sales"
                >
                  {topProducts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
