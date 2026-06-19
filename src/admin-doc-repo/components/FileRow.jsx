import { useState } from '@wordpress/element';

export default function FileRow({ api, file, onChanged }) {
    const [editing, setEditing]   = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [category, setCategory] = useState(file.category);
    const [date, setDate]         = useState(file.date);
    const [newName, setNewName]   = useState(file.filename);
    const [error, setError]       = useState('');

    async function saveMeta() {
        try {
            await api.saveMeta(file.filename, category, date);
            setEditing(false);
            onChanged();
        } catch (e) {
            setError(e.message);
        }
    }

    function cancelEdit() {
        setCategory(file.category);
        setDate(file.date);
        setEditing(false);
        setError('');
    }

    async function saveRename() {
        try {
            await api.rename(file.filename, newName);
            setRenaming(false);
            onChanged();
        } catch (e) {
            setError(e.message);
        }
    }

    function cancelRename() {
        setNewName(file.filename);
        setRenaming(false);
        setError('');
    }

    async function handleDelete() {
        if (!confirm(`Delete ${file.filename}?`)) return;
        try {
            await api.delete(file.filename);
            onChanged();
        } catch (e) {
            setError(e.message);
        }
    }

    const sizeLabel = file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    const uploadedLabel = new Date(file.uploaded * 1000).toLocaleDateString();

    return (
        <tr>
            <td>
                {renaming ? (
                    <input
                        className="sfm-rename-input"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        autoFocus
                    />
                ) : (
                    <a href={file.url} download className="sfm-btn-link">{file.filename}</a>
                )}
                {error && <span className="sfm-error" style={{ display: 'block', marginTop: 4 }}>{error}</span>}
            </td>
            <td>
                {editing ? (
                    <select
                        className="sfm-inline-select"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="">— None —</option>
                        {SFM.categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                ) : (
                    file.category || <span style={{ color: '#aaa' }}>—</span>
                )}
            </td>
            <td>
                {editing ? (
                    <input
                        type="date"
                        className="sfm-date-input"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                ) : (
                    file.date || <span style={{ color: '#aaa' }}>—</span>
                )}
            </td>
            <td style={{ color: '#888' }}>{sizeLabel}</td>
            <td style={{ color: '#888' }}>{uploadedLabel}</td>
            <td>
                <div className="sfm-actions">
                    {renaming ? (
                        <>
                            <button className="sfm-btn sfm-btn-primary" onClick={saveRename}>Save</button>
                            <button className="sfm-btn" onClick={cancelRename}>Cancel</button>
                        </>
                    ) : editing ? (
                        <>
                            <button className="sfm-btn sfm-btn-primary" onClick={saveMeta}>Save</button>
                            <button className="sfm-btn" onClick={cancelEdit}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button className="sfm-btn" onClick={() => setRenaming(true)}>Rename</button>
                            <button className="sfm-btn" onClick={() => setEditing(true)}>Edit</button>
                            <button className="sfm-btn sfm-btn-danger" onClick={handleDelete}>Delete</button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}
