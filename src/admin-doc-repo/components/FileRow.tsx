import { useEffect, useState } from '@wordpress/element';
import type { Dispatch, SetStateAction } from "react";

import type { ApiProps, SfmFile, SfmMetaRow } from '@block-root/types'

import {ExpenseRowEdit} from '@components/ExpenseRow';
import ExpandButton from '@components/ExpandButton';

interface FileRowProps {
    api?: ApiProps,
    file: SfmFile,
    categories: string[],
    submissions: string[],
    onChanged: () => Promise<void>;
    setMessage: Dispatch<SetStateAction<string>>;
    setIsError: Dispatch<SetStateAction<boolean>>;
}

export default function FileRow({ api, file, categories, submissions, onChanged, setMessage, setIsError }: FileRowProps) {
    const [rows, setRows] = useState<SfmMetaRow[]>(
        file.meta.map(row => ({ ...row, _key: crypto.randomUUID() }))
    );
    const [expanded, setExpanded] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [newName, setNewName] = useState(file.filename);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const [fileMessage, setFileMessage] = useState('');
    const [fileError, setFileError] = useState('');
    const [expenseMessage, setExpenseMessage] = useState('');
    const [expenseError, setExpenseError] = useState('');

    useEffect(() => {
        if (!fileMessage) return;
        const timer = setTimeout(() => setFileMessage(''), 4000);
        return () => clearTimeout(timer);
    }, [fileMessage]);

    useEffect(() => {
        if (!expenseMessage) return;
        const timer = setTimeout(() => setExpenseMessage(''), 4000);
        return () => clearTimeout(timer);
    }, [expenseMessage]);

    function addRow() {
        setEditIndex(rows.length);
        const newRow = {
            _key: crypto.randomUUID(),
            category: '',
            submittedBy: '',
            date: '',
            amount: ''
        };
        saveEdit([...rows, newRow], "Row successfully added.");
    }

    function removeRow(index: number) {
        saveEdit(rows.filter((_, i) => i !== index), "Row successfully deleted.");
    }

    function updateRow(index: number, updated: SfmMetaRow) {
        saveEdit(rows.map((row, i) => i === index ? updated : row), "Row successfully updated.");
    }

    async function saveEdit(newRows: SfmMetaRow[], successMessage: string) {
        if (api === undefined){
            setIsError(false);
            setMessage('In configuration mode, no file access.')
            return;
        }
        const oldRows = rows;
        try {
            setRows(newRows);
            const rowsData = newRows.map(({ _key, ...rest }) => rest);
            await api.saveMeta(file.filename, rowsData);
            setEditIndex(null);
            await onChanged();
            setExpenseMessage(successMessage);
        } catch (e: any) {
            // Revert to old rows on api failure
            setRows(oldRows);
            setEditIndex(null);
            setExpenseMessage('');
            setExpenseError(e.message);
        }
    }

    async function saveRename() {
        if (api === undefined){
            setIsError(false);
            setMessage('In configuration mode, no file access.')
            return;
        }
        try {
            await api.rename(file.filename, newName);
            setRenaming(false);
            await onChanged();
            setFileError('');
            setFileMessage(`Renamed ${file.filename}.`);
        } catch (e: any) {
            setFileMessage('');
            setFileError(e.message);
        }
    }

    function cancelRename() {
        setNewName(file.filename);
        setRenaming(false);
        setFileError('');
    }

    async function handleDelete() {
        if (!confirm(`Delete ${file.filename}?`)) return;
        if (api === undefined){
            setIsError(false);
            setMessage('In configuration mode, no file access.')
            return;
        }
        try {
            await api.delete(file.filename);
            await onChanged();
            setIsError(false);
            setMessage(`Deleted: ${file.filename}`);
        } catch (e: any) {
            setFileError(e.message);
        }
    }

    function AddExpense({}) {
        return(
            <button className="sfm-upload-label"
                onClick={() => {
                    addRow();
                    setExpanded(true);
                }}>+ Add Expense</button>
        )
    }

    function getTotalAmount(meta: SfmMetaRow[]) {
        const total = meta.reduce((sum, row) => sum + parseFloat(row.amount || '0'), 0);
        return `€ ${total.toFixed(2)}`;
    }

    const totalAmount = getTotalAmount(rows);

    const expensesCount = rows.length;

    const expensesText = `${expensesCount} expense${expensesCount !== 1 ? 's' : ''}`;

    const sizeLabel = file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    const uploadedLabel = new Date(file.uploaded * 1000).toLocaleDateString();

    return (
        <>
            <tr className={expanded ? 'sfm-row-expanded' : ''}>
                <td>
                    <div className={'file-rename-row'}>
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
                        {fileMessage && <span className="sfm-success">{fileMessage}</span>}
                        {fileError && <span className="sfm-error">{fileError}</span>}
                    </div>
                </td>
                <td>
                    <div className={'sfm-expenses'}>
                        {totalAmount}
                        {expensesCount === 0 ? <AddExpense /> : <ExpandButton text={expensesText} expanded={expanded} setExpanded={setExpanded}/>}
                    </div>
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
            {expanded && (
                <tr className={expanded ? 'sfm-expense-row-expanded' : ''}>
                    <td colSpan={5}>
                        <table className="sfm-expense-table">
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
                                    <ExpenseRowEdit
                                        key={row._key}
                                        row={row}
                                        categories={categories}
                                        submissions={submissions}
                                        onChange={updated => updateRow(i, updated)}
                                        onRemove={() => removeRow(i)}
                                        setToEdit={i===editIndex}
                                    />
                                ))}
                            </tbody>
                        </table>
                        <div className={'expense-upload-row'}>
                            <button className="sfm-upload-label" onClick={addRow}>+ Add Expense</button>
                            {expenseMessage && <span className="sfm-success">{expenseMessage}</span>}
                            {expenseError && <span className="sfm-error">{expenseError}</span>}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
