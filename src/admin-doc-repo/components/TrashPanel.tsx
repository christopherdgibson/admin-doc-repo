import { useState, useEffect } from '@wordpress/element';
import type { ApiProps, SfmTrashedFile, SfmMetaRowData, AccessLevel } from '@block-root/types';

import {ExpenseRow} from '@components/ExpenseRow';
import ExpandButton from '@components/ExpandButton';

function TrashedFileRow({ file, api, onAction }: {
    file: SfmTrashedFile;
    api: ApiProps;
    onAction: () => Promise<void>;
}) {
    const [expanded, setExpanded] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [purging, setPurging] = useState(false);
    const [error, setError] = useState('');

    const deletedLabel = new Date(file.deleted_at * 1000).toLocaleDateString();

    const expensesCount = file.meta.length;
    const expensesText = `${expensesCount} expense${expensesCount !== 1 ? 's' : ''}`;

    const total = file.meta.reduce((sum, row) => sum + parseFloat(row.amount || '0'), 0);
    const totalAmount = `€${total.toFixed(2)}`;

    async function handleRestore() {
        if (!confirm(`Restore ${file.original_filename}?`)) return;
        setRestoring(true);
        setError('');
        try {
            await api.restore(file.trash_filename);
            await onAction();
        } catch (e: any) {
            setError(e.message);
        }
        finally {
            setRestoring(false);
        }
    }

    async function handlePurge() {
        if (!confirm(`Delete ${file.original_filename}?`)) return;
        setPurging(true);
        setError('');
        try {
            await api.purge(file.trash_filename);
            await onAction();
        } catch (e: any) {
            setError(e.message);
        }
        finally {
            setPurging(false);
        }
    }

    return (
        <>
            <tr className={expanded ? 'sfm-row-expanded' : ''}>
                <td>{file.original_filename}</td>
                <td style={{ color: 'var(--label-text-color)' }}>
                    <div className={'sfm-expenses'}>
                        {totalAmount}
                        <ExpandButton text={expensesText} expanded={expanded} setExpanded={setExpanded}/>
                    </div>
                </td>
                <td style={{ color: 'var(--label-text-color)' }}>{deletedLabel}</td>
                <td>
                    <div className="sfm-actions">
                        <button
                            className="sfm-btn sfm-btn-primary"
                            onClick={handleRestore}
                            disabled={restoring || purging}
                        >
                            {restoring ? 'Restoring...' : 'Restore'}
                        </button>
                        <button
                            className="sfm-btn sfm-btn-danger"
                            onClick={handlePurge}
                            disabled={restoring || purging}
                        >
                            {purging ? 'Purging...' : 'Purge'}
                        </button>
                    </div>
                    {error && <div className="sfm-error">{error}</div>}
                </td>
            </tr>

            {expanded && (
                <tr className="sfm-expense-row-expanded">
                    <td colSpan={5} >
                            {expensesCount === 0 ? (
                                <p style={{ color: 'var(--label-text-color)', margin: 0 }}>No expense records.</p>
                            ) : (
                                <table className="sfm-expense-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Submitted By</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {file.meta.map((row: SfmMetaRowData, i: number) => (
                                            <ExpenseRow 
                                                row={{ _key: i.toString(),
                                                        category: row.category,
                                                        submittedBy: row.submittedBy,
                                                        date: row.date,
                                                        amount: row.amount
                                                    }}
                                                editing={false}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                    </td>
                </tr>
            )}
        </>
    );
}

export default function TrashPanel({ api, onAction }: {
    api: ApiProps;
    onAction: () => Promise<void>;
}) {
    const [trash, setTrash]       = useState<SfmTrashedFile[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    const trashCount = trash.length;

    async function loadTrash() {
        try {
            const data = await api.listTrash();
            setTrash(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadTrash(); }, [trashCount]);

    async function handleAction() {
        await onAction();  // reload main file table
        await loadTrash();   // reload trash list
    }

    if (loading) return <p style={{ color: 'var(--label-text-color)' }}>Loading trash...</p>;
    if (error)   return <p className="sfm-error">{error}</p>;

    return (
        <div className="sfm-trash-panel">
            <h3 style={{ marginTop: 0 }}>Deleted Files</h3>
            {trashCount === 0 ? (
                <div className="sfm-empty">No deleted files.</div>
            ) : (
                <table className="sfm-table">
                    <thead>
                        <tr>
                            <th>Filename</th>
                            <th>Expenses Total</th>
                            <th>Deleted</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trash.map(file => (
                            <TrashedFileRow
                                key={file.trash_filename}
                                file={file}
                                api={api}
                                onAction={handleAction}
                            />
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}