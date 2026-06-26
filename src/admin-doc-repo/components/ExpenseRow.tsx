import { useState } from '@wordpress/element';

import type { SfmMetaRow } from '@block-root/types'

interface ExpenseRowProps {
    row: SfmMetaRow;
    categories: string[],
    submissions: string[],
    onChange: (updated: SfmMetaRow) => void;
    onRemove: () => void;
    setToEdit?: boolean;
}

export default function ExpenseRow({ row, categories, submissions, onChange, onRemove, setToEdit = false }: ExpenseRowProps) {
    const [editing, setEditing] = useState(setToEdit);
    const [newRow, setNewRow] = useState(row);

    function saveExpense() {
        onChange(newRow);
        setEditing(false);
    }

    function cancelEdit() {
        setNewRow(row);
        setEditing(false);
        //setLocalError('');
    }

    return (
        <tr>
            <td>
                {editing ? (
                    <select
                        className="sfm-inline-select"
                        value={newRow.category}
                        onChange={e => setNewRow({ ...newRow, category: e.target.value })}
                    >
                        <option value="">— None —</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                ) : (
                    row.category || <span style={{ color: '#aaa' }}>—</span>
                )}
            </td>
            <td>
                {editing ? (
                    <select
                        className="sfm-inline-select"
                        value={newRow.submittedBy}
                        onChange={e => setNewRow({ ...newRow, submittedBy: e.target.value })}
                    >
                        <option value="">— None —</option>
                        {submissions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                ) : (
                    row.submittedBy || <span style={{ color: '#aaa' }}>—</span>
                )}
            </td>
            <td>
                {editing ? (
                    <input
                        className="sfm-date-input"
                        type="date"
                        value={newRow.date}
                        onChange={e => setNewRow({ ...newRow, date: e.target.value })}
                    />
                ) : (
                    row.date || <span style={{ color: '#aaa' }}>—</span>
                )}
            </td>
            <td>
                {editing ? (
                    <input
                        className="sfm-amount-input"
                        type="number"
                        step="0.01"
                        size={6}
                        value={newRow.amount}
                        onChange={e => setNewRow({ ...newRow, amount: e.target.value })}
                    />
                ) : (
                    row.amount || <span style={{ color: '#aaa' }}>—</span>
                )}
            </td>
            <td>
                <div className="sfm-actions">
                    {editing ? (
                        <>
                            <button className="sfm-btn sfm-btn-primary"
                            onClick={saveExpense}>Save</button>
                            <button className="sfm-btn" onClick={cancelEdit}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button className="sfm-btn" onClick={() => setEditing(true)}>Edit</button>
                            <button className="sfm-btn sfm-btn-danger" onClick={onRemove}>Remove</button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}