import { useEffect, useState } from '@wordpress/element';
import type { Dispatch, SetStateAction } from "react";

import type { ApiProps } from '@block-root/types'

interface FileRowProps {
    api: ApiProps,
    file: any,
    onChanged: () => Promise<void>;
    setMessage: Dispatch<SetStateAction<string>>;
    setIsError: Dispatch<SetStateAction<boolean>>;
}

export default function FileRow({ api, file, onChanged, setMessage, setIsError }: FileRowProps) {
    const [editing, setEditing]   = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [category, setCategory] = useState(file.category);
    const [submittedBy, setSubmittedBy] = useState(file.submittedBy);
    const [date, setDate]         = useState(file.date);
    const [amount, setAmount] = useState(file.amount);
    const [newName, setNewName]   = useState(file.filename);

    const [localMessage, setLocalMessage] = useState('');
    const [localError, setLocalError]     = useState('');

    useEffect(() => {
        if (!localMessage) return;
        const timer = setTimeout(() => setLocalMessage(''), 4000);
        return () => clearTimeout(timer);
    }, [localMessage]);

    async function saveMeta() {
        try {
            await api.saveMeta(file.filename, category, submittedBy, date, amount);
            setEditing(false);
            await onChanged();
        } catch (e: any) {
            setLocalError(e.message);
        }
    }

    function cancelEdit() {
        setCategory(file.category);
        setSubmittedBy(file.submittedBy);
        setDate(file.date);
        setAmount(file.Amount);
        setEditing(false);
        setLocalError('');
    }

    async function saveRename() {
        try {
            await api.rename(file.filename, newName);
            setRenaming(false);
            await onChanged();
            setLocalError('');
            setLocalMessage(`Renamed ${file.filename}.`);
        } catch (e: any) {
            setLocalError(e.message);
        }
    }

    function cancelRename() {
        setNewName(file.filename);
        setRenaming(false);
        setLocalError('');
    }

    async function handleDelete() {
        if (!confirm(`Delete ${file.filename}?`)) return;
        try {
            await api.delete(file.filename);
            await onChanged();
            setIsError(false);
            setMessage(`Deleted: ${file.filename}`);
        } catch (e: any) {
            setLocalError(e.message);
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
                {localMessage && <span className="sfm-success" style={{ display: 'block', marginTop: 4 }}>{localMessage}</span>}
                {localError && <span className="sfm-error" style={{ display: 'block', marginTop: 4 }}>{localError}</span>}
            </td>
            <td>
                {editing ? (
                    <select
                        className="sfm-inline-select"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="">— None —</option>
                        {window.SFM.categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                ) : (
                    file.category || <span style={{ color: '#aaa' }}>—</span>
                )}
            </td>
            <td>
                {editing ? (
                    <select
                        className="sfm-inline-select"
                        value={submittedBy}
                        onChange={e => setSubmittedBy(e.target.value)}
                    >
                        <option value="">— None —</option>
                        {window.SFM.submissions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                ) : (
                    file.submittedBy || <span style={{ color: '#aaa' }}>—</span>
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
            <td>
                {editing ? (
                    <input
                        type="number"
                        step="0.01"
                        size={6}
                        className="sfm-amount-input"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                ) : (
                    file.amount || <span style={{ color: '#aaa' }}>—</span>
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
