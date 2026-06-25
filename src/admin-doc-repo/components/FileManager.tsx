import { useState, useEffect } from '@wordpress/element';

import FileRow from "@components/FileRow";
import SortIcon from "@components/SortIcon";

import type { ApiProps, SfmFile, SfmMetaRowData, SortKey } from '@block-root/types';
import { getSortValue } from '@block-root/types';

export default function FileManager({api}: {api: ApiProps}) {
    const [sortBy, setSortBy] = useState<SortKey>('filename');
    const [files, setFiles]       = useState<SfmFile[]>([]);
    const [sortAsc, setSortAsc]   = useState<boolean>(true);
    const [filterCat, setFilter]  = useState<string>('');
    const [message, setMessage]   = useState<string>('');
    const [isError, setIsError]   = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [category, setCategory] = useState('');
    const [submittedBy, setSubmittedBy] = useState('');
    const [date, setDate]         = useState('');
    const [amount, setAmount] = useState('');

    async function loadFiles() {
        try {
            const data = await api.listFiles();
            setFiles(data);
            setMessage('');   // clear any stale message once data refreshes
        } catch (e: any) {
            setIsError(true);
            setMessage(e.message);
        }
    }

    useEffect(() => { loadFiles(); }, []);

    useEffect(() => {
        if (!message || isError) return;
        const timer = setTimeout(() => setMessage(''), 4000);
        return () => clearTimeout(timer);
    }, [message]);

    function handleSort(col: SortKey) {
        if (sortBy === col) {
            setSortAsc(prev => !prev);
        } else {
            setSortBy(col);
            setSortAsc(true);
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        setSelectedFile(file ?? null);
    }

    async function handleUpload() {
        if (!selectedFile) return;
        setUploading(true);
        setMessage('');
        setIsError(false);
        try {
            const res = await api.upload(selectedFile);
            if ([category, submittedBy, date, amount].some(v => v !== '')) {
                const meta = [{category, submittedBy, date, amount}] as SfmMetaRowData[];
                await api.saveMeta(res.filename, meta);
            }
            await loadFiles();
            clearStates();
            setMessage(`Uploaded: ${res.filename}`);
        } catch (e: any) {
            setIsError(true);
            setMessage(e.message);
        } finally {
            setUploading(false);
        }
    }

    function clearStates() {
        setSelectedFile(null);
        setCategory('');
        setDate('');
        setAmount('');
        setMessage('');
        setIsError(false);
    }

    async function handleLogout() {
        await api.logout();
        window.location.reload();
    }

    const sorted = [...files]
    .filter(f => !filterCat || f.meta.some(row => row.category === filterCat))
    .sort((a, b) => {
        const av = getSortValue(a, sortBy);
        const bv = getSortValue(b, sortBy);
        const dir = sortAsc ? 1 : -1;
        return av > bv ? dir : av < bv ? -dir : 0;
    });
    
    return (
        <div>
            <div className="sfm-toolbar">
                <select
                    className="sfm-select"
                    value={filterCat}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="">All categories</option>
                    {window.SFM.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="sfm-toolbar-right">
                    <button className="sfm-logout" onClick={handleLogout}>Log out</button>
                </div>
            </div>
            <div className="sfm-upload-group">
                <div className="sfm-upload-input-group">
                    <div className="sfm-upload-input">
                        <span>File</span>
                        <label className="sfm-upload-label">
                            Browse
                            <input type="file" onChange={handleFileSelect} disabled={uploading} />
                        </label>
                    </div>
                    {selectedFile && (
                        <div className="sfm-upload-input">
                            <span>File name</span>
                            <div className="sfm-selected-filename">{selectedFile.name}</div>
                        </div>
                    )}
                        
                    <div className="sfm-upload-input">
                        <span>Category</span> 
                        <select
                            className="sfm-inline-select"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="">— None —</option>
                            {window.SFM.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="sfm-upload-input">
                        <span>Submitted By</span> 
                        <select
                            className="sfm-inline-select"
                            value={submittedBy}
                            onChange={e => setSubmittedBy(e.target.value)}
                        >
                            <option value="">— None —</option>
                            {window.SFM.submissions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="sfm-upload-input">
                        <span>Date</span> 
                        <input
                            type="date"
                            className="sfm-date-input"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                    <div className="sfm-upload-input">
                    <span>Amount</span> 
                        <input
                            type="number"
                            step="0.01"
                            size={6}
                            className="sfm-amount-input"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                </div>
                <div className="sfm-toolbar-right">
                    {selectedFile && (
                        <button
                            className="sfm-btn sfm-btn-primary"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    )}
                    {selectedFile && !uploading && (
                        <button className="sfm-btn" onClick={clearStates}>
                            Clear
                        </button>
                    )}
                </div>
            </div>
            {message && <div className={`file-upload-row ${isError ? 'sfm-error ': 'sfm-success'}`}>{message}</div>}
            {sorted.length === 0 ? (
                <div className="sfm-empty">
                    {files.length === 0 ? 'No files uploaded yet.' : 'No files match the selected category.'}
                </div>
            ) : (
                <table className="sfm-table">
                    <thead>
                        <tr>
                            {([
                                { col: 'filename', label: 'Filename' },
                                { col: 'total',  label: 'Expenses Total' },   // computed, consider sorting logic
                                { col: 'size',     label: 'Size' },
                                { col: 'uploaded', label: 'Uploaded' },
                            ] as { col: SortKey; label: string }[]).map(({ col, label }) => (
                                <th key={col} className="sortable" onClick={() => handleSort(col)}>
                                    {label}
                                    <SortIcon col={col} sortBy={sortBy} sortAsc={sortAsc} />
                                </th>
                            ))}
                            <th>File management</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(file => (
                            <FileRow
                                key={file.uploaded}
                                api={api}
                                file={file}
                                onChanged={loadFiles}
                                setMessage={setMessage}
                                setIsError={setIsError}
                            />
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
