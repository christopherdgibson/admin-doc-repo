import type { SfmMetaRowData } from '@block-root/types'

export const api = {
    async call(endpoint: string, options: RequestInit = {}) {
        const res = await fetch(`${window.SFM.apiBase}${endpoint}`, {
            ...options,
            headers: {
                'X-WP-Nonce': window.SFM.nonce,
                ...(options.headers as Record<string, string>),
            },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
    },

    login: (password: string) => api.call('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    }),

    logout: () => api.call('/logout', { method: 'POST' }),

    listFiles: () => api.call('/files'),

    upload: (file: File) => {
        const form = new FormData();
        form.append('sfm_file', file);
        return api.call('/upload', { method: 'POST', body: form });
    },

    delete: (filename: string) => api.call('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
    }),

    rename: (old_filename: string, new_filename: string) => api.call('/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_filename, new_filename }),
    }),

    saveMeta: (filename: string, rows: SfmMetaRowData[]) => api.call('/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, rows }),
    }),
};