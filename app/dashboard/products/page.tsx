"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, AlertCircle, Edit2, X, PackageOpen, PlusCircle, ChevronDown, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStockLevel: number; // Added this line
  category: string;
  shelfNo?: string;
  stockStatus: "ok" | "low";
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(["General"]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    purchasePrice: "",
    sellingPrice: "",
    stock: "",
    minStockLevel: "5", // Added this line
    category: "General",
    shelfNo: ""
  });

  const generateSKU = (name: string) => {
    if (!name) return;
    const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD');
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    setFormData(prev => ({ ...prev, sku: `${prefix}-${timestamp}-${random}` }));
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${search}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProducts(data.products || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingId; // Added this line
      const url = isEdit ? `/api/products/${editingId}` : "/api/products"; // Added this line
      const method = isEdit ? "PATCH" : "POST"; // Added this line

      const payload = {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        stock: Number(formData.stock),
        minStockLevel: Number(formData.minStockLevel)
      };

      const res = await fetch(url, { // Modified this line
        method, // Modified this line
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success(isEdit ? "Product updated successfully" : "Product added successfully"); // Modified this line
      setIsPanelOpen(false);
      setEditingId(null);
      setFormData({ name: "", sku: "", purchasePrice: "", sellingPrice: "", stock: "", minStockLevel: "5", category: "General", shelfNo: "" });
      setIsAddingNewCategory(false);
      setNewCategoryName("");
      fetchProducts();
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-4 bg-white border-b border-[#E2E8F0] gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage your inventory catalog</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", sku: "", purchasePrice: "", sellingPrice: "", stock: "", minStockLevel: "5", category: "General", shelfNo: "" });
            setIsPanelOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#714B67] hover:bg-[#5C3D54] text-white px-4 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Search Bar */}
        <div className="bg-white p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border border-[#E2E8F0] rounded-t-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border-none rounded-md text-sm focus:ring-0 outline-none"
            />
          </div>
          <button className="px-3 py-2 text-sm text-slate-600 font-medium hover:bg-slate-50 rounded-md border border-[#E2E8F0] sm:border-none">
            Filter
          </button>
        </div>

        {/* List View (Table on desktop, Cards on mobile) */}
        <div className="bg-white border-x border-b border-[#E2E8F0] rounded-b-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-slate-500 text-sm">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-center px-4">
              <PackageOpen className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-medium text-slate-900">No products found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Get started by adding your first product to your inventory catalog.</p>
              <button
                onClick={() => setIsPanelOpen(true)}
                className="mt-4 text-[#714B67] hover:text-[#5C3D54] text-sm font-medium transition-colors"
              >
                + Add Product
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#F8FAFC] text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0] w-16 text-center">Sr. No.</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Product Info</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Category</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0]">Shelf</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0] text-right">Price</th>
                      <th className="px-6 py-3 font-semibold border-b border-[#E2E8F0] text-right">Stock</th>
                      <th className="px-6 py-3 border-b border-[#E2E8F0] w-[80px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {products.map((p, index) => (
                      <tr key={p._id} className="hover:bg-slate-50 group transition-colors">
                        <td className="px-6 py-3 text-center">
                          <span className="text-xs font-semibold text-slate-500">{index + 1}</span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="font-medium text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{p.sku}</div>
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium inline-block">{p.category}</span>
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {p.shelfNo ? (
                            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-200">
                              {p.shelfNo}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="font-medium text-slate-900">₹{p.sellingPrice.toFixed(2)}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">CP: ₹{p.purchasePrice.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className={`font-medium ${p.stockStatus === 'low' ? 'text-red-600' : 'text-slate-900'}`}>
                            {p.stock} units
                          </div>
                          {p.stockStatus === 'low' && (
                            <div className="flex items-center justify-end gap-1 text-[11px] text-red-600 mt-0.5">
                              <AlertCircle className="w-3 h-3" /> Low Stock
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => {
                              setEditingId(p._id);
                              setFormData({
                                name: p.name,
                                sku: p.sku,
                                purchasePrice: p.purchasePrice.toString(),
                                sellingPrice: p.sellingPrice.toString(),
                                stock: p.stock.toString(),
                                minStockLevel: p.minStockLevel.toString(),
                                category: p.category || "General",
                                shelfNo: p.shelfNo || ""
                              });
                              setIsPanelOpen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 bg-slate-100 hover:bg-slate-200 text-[#714B67] rounded transition-all"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-[#E2E8F0]">
                {products.map((p) => (
                  <div key={p._id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">{p.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{p.sku}</div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingId(p._id);
                          setFormData({
                            name: p.name,
                            sku: p.sku,
                            purchasePrice: p.purchasePrice.toString(),
                            sellingPrice: p.sellingPrice.toString(),
                            stock: p.stock.toString(),
                            minStockLevel: p.minStockLevel.toString(),
                            category: p.category || "General",
                            shelfNo: p.shelfNo || ""
                          });
                          setIsPanelOpen(true);
                        }}
                        className="p-2 bg-slate-100 text-[#714B67] rounded-md"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[13px]">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Category</div>
                        <div className="text-slate-600">{p.category}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Shelf</div>
                        <div className="text-slate-600">{p.shelfNo || '-'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Price</div>
                        <div className="font-semibold text-slate-900">₹{p.sellingPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Stock</div>
                        <div className={`font-semibold ${p.stockStatus === 'low' ? 'text-red-600' : 'text-slate-900'}`}>
                          {p.stock} units
                          {p.stockStatus === 'low' && ' (Low)'}
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

      {/* Slide-over Panel for New Product */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsPanelOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform border-l border-[#E2E8F0]"> {/* Modified this line */}
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]"> {/* Modified this line */}
              <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit Product" : "Add New Product"}</h2> {/* Modified this line */}
              <button onClick={() => setIsPanelOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700">Product Name</label>
                  <input
                    type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={() => !formData.sku && generateSKU(formData.name)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all"
                    placeholder="e.g. Wireless Mouse"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">SKU</label>
                    <button type="button" onClick={() => generateSKU(formData.name)} className="text-[11px] text-[#714B67] font-medium hover:underline">
                      Auto-generate
                    </button>
                  </div>
                  <input
                    type="text" required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                  />
                </div>

                <div className={`grid gap-4 ${isAddingNewCategory ? "grid-cols-1" : "grid-cols-2"}`}>
                  <div className="grid gap-2 relative">
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    {!isAddingNewCategory ? (
                      <div className="relative">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                              setCategorySearch("");
                            }}
                            className="flex-1 px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-sm focus:outline-none ring-offset-white cursor-pointer flex items-center justify-between group hover:border-[#714B67] transition-all text-left"
                          >
                            <span className={formData.category ? "text-slate-900" : "text-slate-400"}>
                              {formData.category || "Select Category"}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewCategory(true);
                              setCategorySearch("");
                            }}
                            className="p-2 border border-[#E2E8F0] rounded-md text-[#714B67] hover:bg-slate-50 transition-colors shrink-0"
                            title="Add New Category"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Custom Dropdown Menu */}
                        {isCategoryDropdownOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-[60]" 
                              onClick={() => setIsCategoryDropdownOpen(false)}
                            />
                            <div className="absolute top-full left-0 mt-1 w-[calc(100%-48px)] bg-white border border-[#E2E8F0] rounded-lg shadow-xl z-[70] overflow-hidden animate-in fade-in zoom-in duration-200 border-b-2 border-b-[#714B67]/10">
                              <div className="p-2 bg-slate-50 border-b border-[#E2E8F0]">
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                  <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-md text-xs focus:outline-none focus:border-[#714B67] transition-all"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="max-h-52 overflow-auto py-1 custom-scrollbar">
                                {categories.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase())).length > 0 ? (
                                  categories
                                    .filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()))
                                    .map((cat) => (
                                      <div
                                        key={cat}
                                        onClick={() => {
                                          setFormData({ ...formData, category: cat });
                                          setIsCategoryDropdownOpen(false);
                                        }}
                                        className="px-3 py-2 text-sm text-slate-700 hover:bg-[#714B67]/5 hover:text-[#714B67] cursor-pointer flex items-center justify-between group/item"
                                      >
                                        <span>{cat}</span>
                                        {formData.category === cat ? (
                                          <Check className="w-3.5 h-3.5 text-[#714B67]" />
                                        ) : (
                                          <div className="w-3.5 h-3.5 rounded-full border border-slate-200 group-hover/item:border-[#714B67]/30" />
                                        )}
                                      </div>
                                    ))
                                ) : (
                                  <div className="px-3 py-4 text-center">
                                    <p className="text-xs text-slate-400">No categories found</p>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        setIsAddingNewCategory(true);
                                        setNewCategoryName(categorySearch);
                                        setFormData({ ...formData, category: categorySearch });
                                        setIsCategoryDropdownOpen(false);
                                      }}
                                      className="mt-2 text-xs font-semibold text-[#714B67] hover:underline"
                                    >
                                      + Add "{categorySearch}"
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="border-t border-[#E2E8F0] p-2 bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAddingNewCategory(true);
                                    setIsCategoryDropdownOpen(false);
                                  }}
                                  className="w-full py-1.5 text-xs font-semibold text-[#714B67] hover:bg-[#714B67]/10 rounded transition-all border border-dashed border-[#714B67]/30"
                                >
                                  + Create New Category
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => {
                            setNewCategoryName(e.target.value);
                            setFormData({ ...formData, category: e.target.value });
                          }}
                          autoFocus
                          placeholder="Category name"
                          className="flex-1 px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewCategory(false);
                            setNewCategoryName("");
                            setFormData({ ...formData, category: categories[0] || "General" });
                          }}
                          className="px-4 py-2 border border-[#E2E8F0] rounded-md text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Shelf No.</label>
                    <input
                      type="text"
                      value={formData.shelfNo}
                      onChange={(e) => setFormData({ ...formData, shelfNo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                      placeholder="e.g. A-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Purchase Price (₹)</label>
                    <input
                      type="number" required min="0" step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Selling Price (₹)</label>
                    <input
                      type="number" required min="0" step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Initial Stock</label>
                    <input
                      type="number" required min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Low Stock Alert At</label>
                    <input
                      type="number" required min="0"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E2E8F0] mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPanelOpen(false);
                    setEditingId(null); // Added this line
                  }}
                  className="flex-1 px-4 py-2 border border-[#E2E8F0] text-slate-700 bg-white rounded-md font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#714B67] text-white rounded-md font-medium text-sm hover:bg-[#5C3D54] shadow-sm transition-colors"
                >
                  {editingId ? "Save Changes" : "Save Product"} {/* Modified this line */}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
