"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  PackageOpen, // Changed from Package to PackageOpen
  Users,
  Wallet,
  FileText,
  Search,
  Bell,
  LogOut,
  Receipt,
  History,
  Menu,
  X
} from "lucide-react";

import { Input } from "@/components/ui/input";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ products: any[], customers: any[] }>({ products: [], customers: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ products: [], customers: [] });
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${searchQuery}`);
        const data = await res.json();
        setSearchResults({
          products: Array.isArray(data?.products) ? data.products : [],
          customers: Array.isArray(data?.customers) ? data.customers : []
        });
        setShowSearchResults(true);
      } catch (err) {
        setSearchResults({ products: [], customers: [] });
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        setNotifications([]);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Pulse every minute
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center p-6 text-slate-500">Loading workspace...</div>;
  }

  const navGroups = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      ]
    },
    {
      label: "Operations",
      items: [
        { name: "Point of Sale", href: "/dashboard/sell", icon: ShoppingCart },
        { name: "Products", href: "/dashboard/products", icon: PackageOpen }, // Icon changed to PackageOpen
        { name: "Customers", href: "/dashboard/customers", icon: Users },
        { name: "History", href: "/dashboard/history", icon: History }, // Added
      ]
    },
    {
      label: "Finance",
      items: [
        { name: "Credit & Dues", href: "/dashboard/credit", icon: Wallet },
        { name: "Reports", href: "/dashboard/reports", icon: FileText },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Backdrop for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-50 text-brand-600 font-bold">
              SIQ
            </div>
            <span className="font-semibold text-slate-900 truncate">
              {(session?.user as any)?.businessName || "StockIQ"}
            </span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Quick find (Name, SKU, Shelf)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              className="w-full bg-[#F8FAFC] pl-8 h-9 text-[13px] border-[#E2E8F0] focus:ring-1 focus:ring-[#714B67]"
            />
            {showSearchResults && (searchQuery.length >= 2) && (
              <div className="absolute left-0 right-0 top-full mt-2 z-[60] bg-white border border-[#E2E8F0] shadow-xl rounded-lg max-h-[400px] overflow-y-auto">
                {searchResults.products.length > 0 && (
                  <div className="p-2 border-b border-[#E2E8F0] last:border-0">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Products</div>
                    {searchResults.products.map(p => (
                      <Link key={p._id} href="/dashboard/products" onClick={() => setShowSearchResults(false)} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md transition-colors">
                        <div className="flex-1 truncate mr-2">
                          <div className="text-[13px] font-medium text-slate-900 truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{p.sku} • Shelf: {p.shelfNo || "N/A"}</div>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{p.stock}</div>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.customers.length > 0 && (
                  <div className="p-2 border-b border-[#E2E8F0] last:border-0">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customers</div>
                    {searchResults.customers.map(c => (
                      <Link key={c._id} href={`/dashboard/customers/${c._id}`} onClick={() => setShowSearchResults(false)} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md transition-colors">
                        <div className="flex-1 truncate mr-2">
                          <div className="text-[13px] font-medium text-slate-900 truncate">{c.name}</div>
                          <div className="text-[10px] text-slate-500">{c.phone || "No phone"}</div>
                        </div>
                        <div className="text-[10px] font-bold text-amber-600">₹{c.totalDue?.toLocaleString()}</div>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.products.length === 0 && searchResults.customers.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">No matches found for "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <div className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${isActive
                            ? "bg-[#F3EEF7] text-[#714B67] border-l-[3px] border-l-[#714B67] font-medium"
                            : "text-[#475569] hover:bg-[#F8FAFC] border-l-[3px] border-l-transparent"
                          }`}
                      >
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-[#714B67]' : 'text-[#64748B]'}`} />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3EEF7] text-[10px] font-medium text-[#714B67]">
                {(session?.user?.name || "User").slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-900 truncate">
                {session?.user?.name || "User"}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-slate-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center text-sm text-slate-500 truncate">
              <span className="hidden sm:inline">StockIQ</span>
              <span className="mx-2 hidden sm:inline">/</span>
              <span className="font-medium text-slate-900 capitalize truncate">
                {pathname.split("/").pop() || "Dashboard"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-1.5 rounded-full"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-[#E2E8F0] shadow-2xl rounded-xl z-[70] overflow-hidden transform transition-all">
                  <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h3>
                    <span className="bg-[#714B67] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">All Clear</div>
                        <p className="text-xs text-slate-500 mt-1">No alerts at this moment.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <Link
                          key={n.id}
                          href={n.link}
                          onClick={() => setShowNotifications(false)}
                          className="block p-4 border-b border-[#F1F5F9] last:border-0 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.type === 'low-stock' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                            <div>
                              <div className="text-[13px] font-semibold text-slate-900 leading-none">{n.title}</div>
                              <p className="text-xs text-slate-500 mt-1.5 leading-snug">{n.message}</p>
                              <div className="text-[10px] text-slate-400 mt-2 font-medium">Just now</div>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] text-center">
                      <button className="text-[11px] font-semibold text-[#714B67] hover:underline">Mark all as read</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
