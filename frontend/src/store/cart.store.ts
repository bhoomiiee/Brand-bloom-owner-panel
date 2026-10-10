import { create } from 'zustand';

export interface CartItem {
  variantId: string;
  title: string;
  priceCents: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  totalCents: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    set((state) => {
      const idx = state.items.findIndex(i => i.variantId === item.variantId);
      if (idx >= 0) {
        const copy = [...state.items];
        copy[idx].quantity += item.quantity;
        return { items: copy };
      }
      return { items: [...state.items, item] };
    });
  },
  removeItem: (variantId) => {
    set((state) => ({ items: state.items.filter(i => i.variantId !== variantId) }));
  },
  clearCart: () => set({ items: [] }),
  totalCents: () => get().items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)
}));
