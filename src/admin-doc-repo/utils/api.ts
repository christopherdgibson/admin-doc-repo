import type { AccessLevel, ApiResponse, FileResponse, SfmFile, SfmMetaRowData, SfmTrashedFile } from '@block-root/types'

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

    login: (password: string): Promise<{ success: boolean; access: AccessLevel }> =>
        api.call('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        }),

    logout: (): Promise<ApiResponse> =>
        api.call('/logout', { method: 'POST' }),

    session: (): Promise<{ access: AccessLevel | null }> =>
        api.call('/session'),

    listFiles: (): Promise<SfmFile[]> =>
        api.call('/files'),

    upload: (file: File): Promise<FileResponse> => {
        const form = new FormData();
        form.append('sfm_file', file);
        return api.call('/upload', { method: 'POST', body: form });
    },

    delete: (filename: string): Promise<ApiResponse> =>
        api.call('/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename }),
        }),

    purge: (trash_filename: string): Promise<ApiResponse> =>
        api.call('/purge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trash_filename }),
        }),

    listTrash: (): Promise<SfmTrashedFile[]> =>
        api.call('/trash'),

    restore: (trash_filename: string): Promise<FileResponse> =>
        api.call('/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trash_filename }),
        }),

    rename: (old_filename: string, new_filename: string): Promise<ApiResponse> =>
        api.call('/rename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ old_filename, new_filename }),
        }),

    saveMeta: (filename: string, rows: SfmMetaRowData[]): Promise<ApiResponse> =>
        api.call('/meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, rows }),
        }),
};