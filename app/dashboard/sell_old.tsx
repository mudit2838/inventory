"use client";

import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type Product = {
  _id: string;
  name: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  shelf: string;
  stockStatus: 'low' | 'ok';
};

type SaleItem = { productId: string; name: string; quantity: number; sellingPrice: number; purchasePrice: number; };

type Customer = { _id: string; name: string };

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalSales: 0, totalProfit: 0 });
  const [dailySummary, setDailySummary] = useState<Array<{ _id: string; totalAmount: number; totalProfit: number; count: number }>>([]);
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', stock: 0, purchasePrice: 0, sellingPrice: 0, shelf: '' });

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [reportLoading, setReportLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'purchasePrice' | 'sellingPrice' | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) query.set('search', search);
      if (statusFilter) query.set('status', statusFilter);

      const res = await fetch(`/api/products?${query.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Unable to load products');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  async function loadSummary() {
    setReportLoading(true);
    try {
      const res = await fetch('/api/sales');
      if (!res.ok) {
        throw new Error('Failed');
      }
      const data = await res.json();
      setStats({ totalSales: data.stats?.totalSales || 0, totalProfit: data.stats?.totalProfit || 0 });
      setDailySummary(data.dailySummary || []);
    } catch {
      toast.error('Unable to load dashboard stats');
    } finally {
      setReportLoading(false);
    }
  }

  async function loadCustomers() {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCustomers(data);
    } catch {
      toast.error('Unable to load customers');
    }
  }

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadSummary();
    loadCustomers();
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
  }, [cart]);

  const canCheckout = cart.length > 0;

  async function addProduct() {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, stock: Number(newProduct.stock), purchasePrice: Number(newProduct.purchasePrice), sellingPrice: Number(newProduct.sellingPrice) }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || 'Failed adding product');
        return;
      }
      toast.success('Product added');
      setAddProductOpen(false);
      setNewProduct({ name: '', stock: 0, purchasePrice: 0, sellingPrice: 0, shelf: '' });
      await loadProducts();
    } catch {
      toast.error('Error adding product');
    }
  }

  const searchAvailableProducts = useCallback(async () => {
    const param = new URLSearchParams({ page: '1', limit: '20', search: productSearchTerm });
    const res = await fetch(`/api/products?${param.toString()}`);
    if (!res.ok) return;
    const data = await res.json();
    setAvailableProducts(data.products || []);
  }, [productSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAvailableProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchAvailableProducts]);

  function addToCart(product: Product) {
    const existing = cart.find((c) => c.productId === product._id);
    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        toast.error('Not enough stock');
        return;
      }
      setCart((prev) => prev.map((item) => item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (product.stock <= 0) {
        toast.error('Out of stock');
        return;
      }
      setCart((prev) => [...prev, { productId: product._id, name: product.name, quantity: 1, sellingPrice: product.sellingPrice, purchasePrice: product.purchasePrice }]);
    }
  }

  function updateCartQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    const product = products.find((p) => p._id === productId) || availableProducts.find((p) => p._id === productId);
    if (!product) return;
    if (quantity > product.stock) {
      toast.error('Not enough stock');
      return;
    }
    setCart((prev) => prev.map((item) => item.productId === productId ? { ...item, quantity } : item));
  }

  async function checkout() {
    try {
      if (!canCheckout) {
        toast.error('Cart empty');
        return;
      }
      const payload = {
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        customerId: selectedCustomer || undefined,
      };
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || 'Checkout failed');
        return;
      }
      toast.success('Sale completed');
      setCart([]);
      await loadProducts();
      await loadSummary();
    } catch {
      toast.error('Checkout error');
    }
  }

  async function createCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Customer name needed');
      return;
    }
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customerName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not add customer');
        return;
      }
      setCustomers((prev) => [data, ...prev]);
      setSelectedCustomer(data._id);
      setCustomerName('');
      toast.success('Customer created');
    } catch {
      toast.error('Customer creation error');
    }
  }

  async function savePrice(productId: string, field: 'purchasePrice' | 'sellingPrice', value: string) {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: Number(value) }),
      });
      if (!res.ok) {
        toast.error('Failed to update price');
        return;
      }
      toast.success('Price updated');
      await loadProducts();
    } catch {
      toast.error('Error updating price');
    }
    setEditingId(null);
    setEditingField(null);
  }

  function startEditing(productId: string, field: 'purchasePrice' | 'sellingPrice', currentValue: number) {
    setEditingId(productId);
    setEditingField(field);
    setEditingValue(String(currentValue));
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-zinc-50 p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-zinc-600">Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Total Sales</p>
          <p className="mt-2 text-2xl font-bold">₨ {stats.totalSales.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Total Profit</p>
          <p className="mt-2 text-2xl font-bold">₨ {stats.totalProfit.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Sales last 7 days</p>
          <p className="mt-2 text-2xl font-bold">{dailySummary.reduce((sum, row) => sum + row.count, 0)}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAddProductOpen((v) => !v)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            >
              Add Product
            </button>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="rounded-lg border border-zinc-300 px-3 py-2 focus:border-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="">Any stock</option>
              <option value="low">Low stock</option>
              <option value="in">Available</option>
            </select>
          </div>

          {isAddProductOpen && (
            <div className="mb-4 rounded-lg bg-zinc-50 p-3">
              <h3 className="font-semibold">New product</h3>
              <div className="grid gap-2 md:grid-cols-2">
                <input value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="rounded border p-2" />
                <input value={newProduct.stock} type="number" onChange={(e) => setNewProduct((p) => ({ ...p, stock: Number(e.target.value) }))} placeholder="Stock" className="rounded border p-2" />
                <input value={newProduct.purchasePrice} type="number" onChange={(e) => setNewProduct((p) => ({ ...p, purchasePrice: Number(e.target.value) }))} placeholder="Purchase" className="rounded border p-2" />
                <input value={newProduct.sellingPrice} type="number" onChange={(e) => setNewProduct((p) => ({ ...p, sellingPrice: Number(e.target.value) }))} placeholder="Selling" className="rounded border p-2" />
                <input value={newProduct.shelf} onChange={(e) => setNewProduct((p) => ({ ...p, shelf: e.target.value }))} placeholder="Shelf" className="rounded border p-2 md:col-span-2" />
              </div>
              <button onClick={addProduct} className="mt-2 rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700">Save Product</button>
            </div>
          )}

          {loading ? (
            <div className="p-4">Loading products …</div>
          ) : (
            <div className="space-y-3">
              {products.length === 0 ? (
                <p className="p-4 text-zinc-500">No product found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-2 py-2 text-left">Name</th>
                        <th className="px-2 py-2 text-right">Stock</th>
                        <th className="px-2 py-2 text-right">CP</th>
                        <th className="px-2 py-2 text-right">SP</th>
                        <th className="px-2 py-2 text-right">Status</th>
                        <th className="px-2 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td className="px-2 py-2">{product.name}</td>
                          <td className="px-2 py-2 text-right">{product.stock}</td>
                          <td
                            className="px-2 py-2 text-right cursor-pointer hover:bg-blue-50"
                            onClick={() => startEditing(product._id, 'purchasePrice', product.purchasePrice)}
                          >
                            {editingId === product._id && editingField === 'purchasePrice' ? (
                              <input
                                autoFocus
                                type="number"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => savePrice(product._id, 'purchasePrice', editingValue)}
                                onKeyDown={(e) => e.key === 'Enter' && savePrice(product._id, 'purchasePrice', editingValue)}
                                className="w-full rounded border border-blue-400 px-1 py-0 text-right"
                              />
                            ) : (
                              product.purchasePrice
                            )}
                          </td>
                          <td
                            className="px-2 py-2 text-right cursor-pointer hover:bg-blue-50"
                            onClick={() => startEditing(product._id, 'sellingPrice', product.sellingPrice)}
                          >
                            {editingId === product._id && editingField === 'sellingPrice' ? (
                              <input
                                autoFocus
                                type="number"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => savePrice(product._id, 'sellingPrice', editingValue)}
                                onKeyDown={(e) => e.key === 'Enter' && savePrice(product._id, 'sellingPrice', editingValue)}
                                className="w-full rounded border border-blue-400 px-1 py-0 text-right"
                              />
                            ) : (
                              product.sellingPrice
                            )}
                          </td>
                          <td className={`px-2 py-2 text-right font-semibold ${product.stockStatus === 'low' ? 'text-orange-600' : 'text-green-600'}`}>
                            {product.stockStatus}
                          </td>
                          <td className="px-2 py-2 text-right">
                            <button onClick={() => addToCart(product)} className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600">
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded bg-zinc-100 px-2 py-1 disabled:opacity-50">
              Prev
            </button>
            <span>{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded bg-zinc-100 px-2 py-1 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>

        <aside className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Sell Products</h2>

          <div className="mt-3 space-y-2">
            <input
              placeholder="Search products to add"
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="w-full rounded border border-zinc-300 px-3 py-2"
            />
            {availableProducts.slice(0, 6).map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded border border-zinc-200 p-2">
                <div className="truncate">{p.name}</div>
                <button onClick={() => addToCart(p)} className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">Add</button>
              </div>
            ))}
          </div>

          <form onSubmit={createCustomer} className="mt-4 flex gap-2">
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="New customer" className="flex-1 rounded border border-zinc-300 px-2 py-1" />
            <button type="submit" className="rounded bg-indigo-600 px-2 py-1 text-white">Add</button>
          </form>

          <label className="mt-3 block text-sm text-zinc-600">Customer (optional)</label>
          <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="mt-1 w-full rounded border border-zinc-300 px-3 py-2">
            <option value="">Walk-in</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <div className="mt-4 space-y-2">
            {cart.length === 0 ? <p className="text-sm text-zinc-500">Cart is empty</p> : (
              cart.map((item) => (
                <div key={item.productId} className="rounded border border-zinc-200 p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <button onClick={() => updateCartQuantity(item.productId, 0)} className="text-xs text-red-600">Remove</button>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="rounded border px-2">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="rounded border px-2">+</button>
                    <span className="ml-auto">₨ {(item.quantity * item.sellingPrice).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 rounded-lg border border-zinc-200 p-3">
            <div className="flex justify-between"><span>Total:</span><strong>₨ {cartTotal.toFixed(2)}</strong></div>
            <button onClick={checkout} disabled={!canCheckout} className="mt-2 w-full rounded bg-emerald-600 px-3 py-2 text-white disabled:opacity-50">
              Checkout
            </button>
          </div>
        </aside>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Daily Summary</h2>
        {reportLoading ? <p>Loading summary...</p> : (
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {dailySummary.map((day) => (
              <div key={day._id} className="rounded border p-2">
                <div className="text-xs text-zinc-500">{day._id}</div>
                <div className="text-sm">Sales: ₨ {day.totalAmount.toFixed(2)}</div>
                <div className="text-sm">Profit: ₨ {day.totalProfit.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
