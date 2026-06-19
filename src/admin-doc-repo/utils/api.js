export const api = {
    async call(endpoint, options = {}) {
        const res = await fetch(`${SFM.apiBase}${endpoint}`, {
            ...options,
            headers: {
                'X-WP-Nonce': SFM.nonce,
                ...options.headers,
            },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
    },

    login: (password) => api.call('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    }),

    logout: () => api.call('/logout', { method: 'POST' }),

    listFiles: () => api.call('/files'),

    upload: (file) => {
        const form = new FormData();
        form.append('sfm_file', file);
        return api.call('/upload', { method: 'POST', body: form });
    },

    delete: (filename) => api.call('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
    }),

    rename: (old_filename, new_filename) => api.call('/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_filename, new_filename }),
    }),

    saveMeta: (filename, category, date) => api.call('/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, category, date }),
    }),
};