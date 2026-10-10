const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export interface ApiClientError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const storeId = localStorage.getItem('sop_active_store_id');
  const customerToken = localStorage.getItem('sop_customer_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (customerToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${customerToken}`;
  }

  if (storeId && !headers['x-store-id']) {
    headers['x-store-id'] = storeId;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Ensures HttpOnly session cookies are transmitted on all cross-origin & same-origin requests
      headers
    });
  } catch (err: any) {
    const error: ApiClientError = new Error(
      err?.message === 'Failed to fetch'
        ? `Unable to connect to the backend server (${BASE_URL}). Please verify that the backend is running.`
        : err?.message || 'Network request failed'
    );
    error.code = 'NETWORK_ERROR';
    throw error;
  }

  let payload: any = {};
  try {
    payload = await res.json();
  } catch {
    // Non-JSON response
  }

  if (!res.ok) {
    const error: ApiClientError = new Error(payload.error?.message || `Request failed with status ${res.status}`);
    error.code = payload.error?.code;
    error.status = res.status;
    error.details = payload.error?.details;
    throw error;
  }

  return payload.data as T;
}
