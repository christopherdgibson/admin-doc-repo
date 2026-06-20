import { useState } from '@wordpress/element';

import type { ApiProps } from '@block-root/types';

interface LoginFormProps {
    api: ApiProps;
    onLogin: () => void;
}

export default function LoginForm({ api, onLogin }: LoginFormProps) {
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
