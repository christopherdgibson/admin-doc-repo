import { useState, useEffect } from '@wordpress/element';

import FileRow from "./FileRow.jsx";
import SortIcon from "./SortIcon.jsx";

export default function FileManager({api}) {
    const [files, setFiles]       = useState([]);
    const [sortBy, setSortBy]     = useState('filename');
    const [sortDir, setSortDir]   = useState('asc');
    const [filterCat, setFilter]  = useState('');
    const [message, setMessage]   = useState('');
    const [error, setError]       = useState('');
    const [uploading, setUploading] = useState(false);

    async function loadFiles() {
        try {
            const data = await api.listFiles();
            setFiles(data);
        } catch (e) {
            setError(e.message);
        }
    }

    useEffect(() => { loadFiles(); }, []);

    function handleSort(col) {
        if (sortBy === col) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(col);
            setSortDir('asc');
        }
    }

    async function handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setMessage('');
        setError('');
        try {
            const res = await api.upload(file);
            setMessage(`Uploaded: ${res.filename}`);
            loadFiles();
        } catch (e) {
            setError(e.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    async function handleLogout() {
        await api.logout();
        window.location.reload();
    }

    const sorted = [...files]
        .filter(f => !filterCat || f.category === filterCat)
        .sort((a, b) => {
            const av = a[sortBy] ?? '';
            const bv = b[sortBy] ?? '';
            const dir = sortDir === 'asc' ? 1 : -1;
            return av > bv ? dir : av < bv ? -dir : 0;
        });

    return (
        <div>
            {message && <p className="sfm-success">{message}</p>}
            {error   && <p className="sfm-error">{error}</p>}

            <div className="sfm-toolbar">
                <label className="sfm-upload-label">
                    {uploading ? '↑ Uploading...' : '↑ Upload File'}
                    <input type="file" onChange={handleUpload} disabled={uploading} />
                </label>

                <select
                    className="sfm-select"
                    value={filterCat}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="">All categories</option>
                    {SFM.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="sfm-toolbar-right">
                    <button className="sfm-logout" onClick={handleLogout}>Log out</button>
                </div>
            </div>

            {sorted.length === 0 ? (
                <div className="sfm-empty">
                    {files.length === 0 ? 'No files uploaded yet.' : 'No files match the selected category.'}
                </div>
            ) : (
                <table className="sfm-table">
                    <thead>
                        <tr>
                            {[
                                { col: 'filename', label: 'Filename' },
                                { col: 'category', label: 'Category' },
                                { col: 'date',     label: 'Date' },
                                { col: 'size',     label: 'Size' },
                                { col: 'uploaded', label: 'Uploaded' },
                            ].map(({ col, label }) => (
                                <th
                                    key={col}
                                    className="sortable"
                                    onClick={() => handleSort(col)}
                                >
                                    {label}
                                    <SortIcon col={col} sortBy={sortBy} sortDir={sortDir} />
                                </th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(file => (
                            <FileRow
                                key={file.filename}
                                api={api}
                                file={file}
                                onChanged={loadFiles}
                            />
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
