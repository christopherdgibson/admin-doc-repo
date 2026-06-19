/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit() {

	const [authed, setAuthed] = useState(false);

	useEffect(() => {
		// Check if already authenticated via existing session
		api.listFiles()
			.then(() => setAuthed(true))
			.catch(() => setAuthed(false));
	}, []);
	
	const api = {
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
	
	function SortIcon({ col, sortBy, sortDir }) {
		if (sortBy !== col) return <span style={{ color: '#ccc', marginLeft: 4 }}>↕</span>;
		return <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
	}
	
	function LoginForm({ onLogin }) {
		const [password, setPassword] = useState('');
		const [error, setError]       = useState('');
		const [loading, setLoading]   = useState(false);
	
		async function handleSubmit(e) {
			e.preventDefault();
			setLoading(true);
			setError('');
			try {
				await api.login(password);
				onLogin();
			} catch {
				setError('Incorrect password.');
			} finally {
				setLoading(false);
			}
		}
	
		return (
			<div className="sfm-login">
				<h2>Document Repository</h2>
				{error && <p className="sfm-error">{error}</p>}
				<form onSubmit={handleSubmit}>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						autoFocus
					/>
					<button type="submit" className="sfm-btn sfm-btn-primary" style={{ width: '100%' }} disabled={loading}>
						{loading ? 'Checking...' : 'Enter'}
					</button>
				</form>
			</div>
		);
	}
	
	function FileRow({ file, onChanged }) {
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
	
	function FileManager() {
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
	
	return (
		<p { ...useBlockProps() }>
			<div>Hello from SFM</div>
			{/* {authed
				? <FileManager />
				: <LoginForm onLogin={() => setAuthed(true)} />
			} */}
		</p>
	);
}
