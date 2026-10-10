import { create } from 'zustand';

export interface CustomerAddress {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface CustomerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: CustomerAddress[];
  marketingConsent: {
    emailOptIn: boolean;
    optInSource?: string;
    optInTimestamp?: string;
  };
  totalOrdersCount: number;
  totalSpendCents: number;
  lastOrderAt?: string;
}

interface CustomerAuthState {
  customer: CustomerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (customer: CustomerUser, token: string) => void;
  updateCustomer: (customer: CustomerUser) => void;
  logout: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set) => {
  const token = localStorage.getItem('sop_customer_token');
  const storedUser = localStorage.getItem('sop_customer_user');
  let customer: CustomerUser | null = null;
  if (storedUser) {
    try {
      customer = JSON.parse(storedUser);
    } catch {}
  }

  return {
    customer,
    token,
    isAuthenticated: Boolean(token && customer),
    setAuth: (customer, token) => {
      localStorage.setItem('sop_customer_token', token);
      localStorage.setItem('sop_customer_user', JSON.stringify(customer));
      set({ customer, token, isAuthenticated: true });
    },
    updateCustomer: (customer) => {
      localStorage.setItem('sop_customer_user', JSON.stringify(customer));
      set({ customer });
    },
    logout: () => {
      localStorage.removeItem('sop_customer_token');
      localStorage.removeItem('sop_customer_user');
      set({ customer: null, token: null, isAuthenticated: false });
    }
  };
});
