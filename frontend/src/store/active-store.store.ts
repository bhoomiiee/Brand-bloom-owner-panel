import { create } from 'zustand';

export interface Store {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  currency?: string;
  businessType?: string;
  address?: any;
  settings?: any;
  membership?: {
    id: string;
    role: string;
    status: string;
  };
}

interface ActiveStoreState {
  activeStore: Store | null;
  setActiveStore: (store: Store | null) => void;
}

export const useActiveStoreStore = create<ActiveStoreState>((set) => ({
  activeStore: (() => {
    try {
      const stored = localStorage.getItem('sop_active_store');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  setActiveStore: (store) => {
    if (store) {
      localStorage.setItem('sop_active_store', JSON.stringify(store));
      localStorage.setItem('sop_active_store_id', store._id || store.id || '');
    } else {
      localStorage.removeItem('sop_active_store');
      localStorage.removeItem('sop_active_store_id');
    }
    set({ activeStore: store });
  }
}));
