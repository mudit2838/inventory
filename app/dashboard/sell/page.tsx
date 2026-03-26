"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { buildWhatsAppReceipt, buildWhatsAppLink } from "@/lib/utils";

export default function PointOfSalePage() {
  const searchParams = useSearchParams();
  const initialCustomerId = searchParams.get('customerId') || "";

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);

  // Walk-in overrides
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");

  const [paymentType, setPaymentType] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<"products" | "cart">("products");

  // Checkout Modal
  const [completedSale, setCompletedSale] = useState<any>(null);

  const cart = useCart();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?search=${search}&status=in`);
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
    } catch {
      toast.error("Failed to load products");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/customers`);
      const data = await res.json();
      if (res.ok) setCustomers(data || []);
    } catch { }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return toast.error("Cart is empty");
    if (paymentType === 'credit' && !selectedCustomerId) return toast.error("Select a customer for credit sales");

    setLoading(true);
    try {
      const payload = {
        items: cart.items.map(i => ({
          product: i.productId,
          name: i.name,
          quantity: i.quantity,
          purchasePrice: i.purchasePrice,
          sellingPrice: i.sellingPrice
        })),
        paymentType,
        customerId: selectedCustomerId || undefined,
        customerName: !selectedCustomerId ? walkinName : undefined,
        customerPhone: !selectedCustomerId ? walkinPhone : undefined
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Success
      setCompletedSale(data);
      cart.clearCart();
      fetchProducts(); // Refresh stock
      toast.success("Sale completed successfully!");

    } catch (err: any) {
      toast.error(err.message || "Failed to process sale");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomerName = customers.find(c => c._id === selectedCustomerId)?.name || "Walk-in";

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-56px)] overflow-hidden bg-[#F8FAFC]">

      {/* Left Panel: Products */}
      <div className={`flex-1 flex flex-col border-r border-[#E2E8F0] ${activeView !== 'products' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 bg-white border-b border-[#E2E8F0] shrink-0 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all"
            />
          </div>
          <button 
            onClick={() => setActiveView('cart')}
            className="lg:hidden relative p-2 bg-white border border-[#E2E8F0] rounded-lg text-slate-600 grow-0 shrink-0"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.items.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <div
                key={p._id}
                onClick={() => cart.addItem(p)}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 cursor-pointer hover:border-[#714B67] hover:shadow-md transition-all group flex flex-col h-full"
              >
                <div className="flex-1 text-center">
                  <div className="h-12 w-12 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-[#714B67]/5 transition-colors mb-3">
                    <ShoppingCart className="h-5 w-5 group-hover:text-[#714B67]" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug">{p.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">{p.sku}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                  <span className="text-sm font-bold text-slate-900">₹{p.sellingPrice.toFixed(2)}</span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{p.stock} in stock</span>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500 text-sm">
                No products found. Add products in the inventory or clear search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Cart */}
      <div className={`w-full lg:w-[400px] flex flex-col bg-white shrink-0 ${activeView !== 'cart' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView('products')}
              className="lg:hidden p-1.5 -ml-1.5 text-slate-400 hover:text-slate-600"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-brand-600" />
              Current Sale
            </h2>
          </div>
          <span className="bg-[#F3EEF7] text-[#714B67] text-xs font-bold px-2 py-1 rounded-full">
            {cart.items.length} items
          </span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <ShoppingCart className="w-12 h-12 text-slate-200" />
              <p className="text-sm text-slate-500">Cart is empty.<br />Scan or select products to add.</p>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.productId} className="flex gap-3 p-3 bg-white border border-[#E2E8F0] rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-900 leading-tight">{item.name}</h4>
                  <div className="text-xs text-slate-500 mt-1">₹{item.sellingPrice.toFixed(2)}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-slate-900 border-none bg-transparent w-auto">₹</span>
                    <input
                      type="number"
                      value={item.sellingPrice}
                      onChange={(e) => cart.updatePrice(item.productId, Number(e.target.value))}
                      className="text-sm font-semibold text-slate-900 w-16 text-right outline-none p-0.5 border border-transparent focus:border-slate-300 rounded focus:ring-0 transition-all font-mono"
                      min={0}
                      step="0.01"
                    />
                  </div>

                  <div className="flex items-center border border-[#E2E8F0] rounded-md h-7 bg-white">
                    <button
                      onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 h-full hover:bg-slate-50 text-slate-500 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => cart.updateQuantity(item.productId, Number(e.target.value))}
                      className="w-10 h-full text-center text-xs font-semibold focus:outline-none border-x border-[#E2E8F0] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min={1}
                    />
                    <button
                      onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 h-full hover:bg-slate-50 text-slate-500 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => cart.removeItem(item.productId)}
                      className="px-2 border-l border-[#E2E8F0] h-full hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer / Checkout Form */}
        <div className="p-4 border-t border-[#E2E8F0] bg-slate-50 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-700 block mb-1">Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-sm focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {selectedCustomerId && (() => {
                const customer = customers.find(c => c._id === selectedCustomerId);
                if (!customer) return null;
                return (
                  <div className="text-right shrink-0">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">Outstanding</label>
                    <Link href="/dashboard/credit" className="text-sm font-bold text-red-600 hover:underline">
                      ₹{customer.totalDue?.toLocaleString() || 0}
                    </Link>
                  </div>
                );
              })()}
            </div>

            {!selectedCustomerId && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Name (Optional)</label>
                  <input type="text" value={walkinName} onChange={e => setWalkinName(e.target.value)} placeholder="Walk-in Name" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-xs focus:ring-1 focus:ring-[#714B67]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">WhatsApp (Optional)</label>
                  <input type="tel" value={walkinPhone} onChange={e => setWalkinPhone(e.target.value)} placeholder="Phone Number" className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-xs focus:ring-1 focus:ring-[#714B67]" />
                </div>
              </div>
            )}

            <div className="pt-1">
              <label className="text-xs font-medium text-slate-700 block mb-1">Payment Method</label>
              <div className="grid grid-cols-4 gap-2">
                {['cash', 'upi', 'card', 'credit'].map(type => (
                  <button
                    key={type}
                    onClick={() => setPaymentType(type)}
                    className={`px-2 py-2 text-xs font-medium rounded-md capitalize transition-colors ${paymentType === type
                        ? "bg-[#714B67] text-white border border-transparent shadow-sm"
                        : "bg-white text-slate-600 border border-[#E2E8F0] hover:bg-slate-100"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-base font-medium text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Payable</span>
            <span className="text-xl font-bold">₹{cart.cartTotal().toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.items.length === 0 || loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCompletedSale(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center transform animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Sale Complete!</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">Invoice #{completedSale.saleNumber}</p>

            <div className="space-y-3">
              {(() => {
                const customer = customers.find(c => c._id === completedSale.customer);
                const phone = customer?.phone || completedSale.customerPhone;
                const name = customer?.name || completedSale.customerName || "Walk-in";
                const receiptText = buildWhatsAppReceipt(completedSale.saleNumber, name, completedSale.items, completedSale.totalAmount);

                if (phone) {
                  return (
                    <a
                      href={buildWhatsAppLink(phone, receiptText)}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                    >
                      Send WhatsApp Receipt directly to {phone}
                    </a>
                  );
                } else {
                  return (
                    <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium text-left border border-amber-200">
                      No phone number provided for WhatsApp integration.
                    </div>
                  );
                }
              })()}
              <button
                onClick={() => {
                  setCompletedSale(null);
                  setWalkinName("");
                  setWalkinPhone("");
                }}
                className="w-full py-2.5 border border-[#E2E8F0] text-slate-700 bg-white hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors"
              >
                Start New Sale
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
