export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF'
} as const;

export const PERMISSIONS = {
  MANAGE_STORE: 'manage:store',
  MANAGE_MEMBERS: 'manage:members',
  MANAGE_PRODUCTS: 'manage:products',
  MANAGE_INVENTORY: 'manage:inventory',
  MANAGE_ORDERS: 'manage:orders',
  VIEW_ANALYTICS: 'view:analytics',
  USE_ASSISTANT: 'use:assistant',
  MANAGE_THEMES: 'manage:themes'
} as const;

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  FULFILLED: 'FULFILLED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
} as const;
