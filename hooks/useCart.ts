import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  stockStatus: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updatePrice: (productId: string, price: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product._id);
          if (existing) {
            if (existing.quantity >= product.stock) return state; // Block adding past stock
            return {
              items: state.items.map((i) =>
                i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          if (product.stock <= 0) return state; // Block out of stock
          return {
            items: [
              ...state.items,
              {
                productId: product._id,
                name: product.name,
                quantity: 1,
                purchasePrice: product.purchasePrice,
                sellingPrice: product.sellingPrice,
                stock: product.stock,
                stockStatus: product.stockStatus,
              },
            ],
          };
        });
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) => {
              if (i.productId === productId) {
                // Ensure cannot exceed stock
                const cappedQty = Math.min(quantity, i.stock);
                return { ...i, quantity: cappedQty };
              }
              return i;
            }),
          };
        }),
      updatePrice: (productId, price) =>
        set((state) => ({
          items: state.items.map((i) => 
            i.productId === productId ? { ...i, sellingPrice: Math.max(0, price) } : i
          )
        })),
      clearCart: () => set({ items: [] }),
      cartTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity * item.sellingPrice, 0);
      },
    }),
    {
      name: 'pos-cart-storage',
    }
  )
);
