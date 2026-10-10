import { apiClient } from '../../../lib/api-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const importsApi = {
  getTemplateUrl: () => `${BASE_URL}/imports/template`,

  upload: async (file: File) => {
    const storeId = localStorage.getItem('sop_active_store_id');
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (storeId) {
      headers['x-store-id'] = storeId;
    }

    const res = await fetch(`${BASE_URL}/imports/upload`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData
    });

    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload.error?.message || `Upload failed with status ${res.status}`);
    }
    return payload.data;
  },

  preview: (jobId: string, mapping?: any) =>
    apiClient<{ previewRows: any[]; totalRows: number; validationErrors: any[] }>('/imports/preview', {
      method: 'POST',
      body: JSON.stringify({ jobId, mapping })
    }),

  commit: (jobId: string, mapping?: any) =>
    apiClient<{ jobId: string; totalRows: number; importedCount: number; failedCount: number; rowErrors: any[] }>('/imports/commit', {
      method: 'POST',
      body: JSON.stringify({ jobId, mapping })
    }),

  listJobs: () => apiClient<any[]>('/imports/jobs')
};
