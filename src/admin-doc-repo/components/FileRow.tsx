import { useEffect, useState } from '@wordpress/element';
import type { Dispatch, SetStateAction } from "react";

import type { ApiProps, SfmFile, SfmMetaRow } from '@block-root/types'

import ExpenseRow from '@components/ExpenseRow';
import ExpandButton from '@components/ExpandButton';

interface FileRowProps {
    api: ApiProps,
    file: SfmFile,
    onChanged: () => Promise<void>;
    setMessage: Dispatch<SetStateAction<string>>;
    setIsError: Dispatch<SetStateAction<boolean>>;
}

export default function FileRow({ api, file, onChanged, setMessage, setIsError }: FileRowProps) {
    const [rows, setRows] = useState<SfmMetaRow[]>(file.meta);
    const [rowExpanded, setRowExpanded] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [newName, setNewName] = useState(file.filename);

    const [localMessage, setLocalMessage] = useState('');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (!localMessage) return;
        const timer = setTimeout(() => setLocalMessage(''), 4000);
        return () => clearTimeout(timer);
    }, [localMessage]);

    function addRow() {
        saveEdit([...rows, { category: '', submittedBy: '', date: '', amount: '' }]);
    }

    function removeRow(index: number) {
        saveEdit(rows.filter((_, i) => i !== index));
    }

    function updateRow(index: number, updated: SfmMetaRow) {
        saveEdit(rows.map((row, i) => i === index ? updated : row));
    }

    async function saveEdit(newRows: SfmMetaRow[]) {
        try {
            await api.saveMeta(file.filename, newRows);
            setRows(newRows);
            await onChanged();
            setLocalMessage('Saved.');
        } catch (e: any) {
            setLocalError(e.message);
        }
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

    function getFileSummary(meta: SfmMetaRow[]) {
        const total = meta.reduce((sum, row) => sum + parseFloat(row.amount || '0'), 0);
        return `€ ${total.toFixed(2)}`;
    }

    const fileSummary = getFileSummary(rows);

    const expensesText = `${rows.length} expense${rows.length !== 1 ? 's' : ''}`;

    const sizeLabel = file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    const uploadedLabel = new Date(file.uploaded * 1000).toLocaleDateString();

    return (
        <>
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
                <td className={'sfm-expenses'}>
                    {fileSummary}
                    <ExpandButton text={expensesText} rowExpanded={rowExpanded} setRowExpanded={setRowExpanded}/>
                </td>
                <td className={'label-text'}>{sizeLabel}</td>
                <td className={'label-text'}>{uploadedLabel}</td>
                <td>
                    <div className="sfm-actions">
                        {renaming ? (
                            <>
                                <button className="sfm-btn sfm-btn-primary" onClick={saveRename}>Save</button>
                                <button className="sfm-btn" onClick={cancelRename}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <button className="sfm-btn" onClick={() => setRenaming(true)}>Rename</button>
                                <button className="sfm-btn sfm-btn-danger" onClick={handleDelete}>Delete</button>
                            </>
                        )}
                    </div>
                </td>
            </tr>
            {rowExpanded && (
                <tr>
                    <td colSpan={5}>
                        <table className="sfm-table sfm-table-expenses">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Submitted By</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => (
                                    <ExpenseRow
                                        key={i}
                                        row={row}
                                        onChange={updated => updateRow(i, updated)}
                                        onRemove={() => removeRow(i)}
                                    />
                                ))}
                            </tbody>
                        </table>
                        <button style={{marginTop: '10px'}} className="sfm-upload-label" onClick={addRow}>+ Add Expense</button>
                    </td>
                </tr>
            )}
        </>
    );
}
