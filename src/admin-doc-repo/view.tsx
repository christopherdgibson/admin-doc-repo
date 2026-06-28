import { useState, useEffect } from '@wordpress/element';
import { createRoot } from "react-dom/client";

import type { AccessLevel } from './types'

import FileManager from "@components/FileManager";
import LoginForm from "@components/LoginForm";
import {api} from "@admin-doc-repo/utils/api";

export default function App() {
    const [authed, setAuthed] = useState(false);
    const [access, setAccess] = useState<AccessLevel| null>(null);

    useEffect(() => {
        // Check if already authenticated via existing session
        api.session()
            .then(res => {
                if (res.access) {
                    setAuthed(true);
                    setAccess(res.access);
                }
            })
            .catch(() => {
                setAuthed(false);
                setAccess(null);
            });
    }, []);

    return (
        <>
            {authed
                ? <FileManager api={api} access={access} />
                : <LoginForm api={api}
                    onLogin={(access) => {
                        setAuthed(true);
                        setAccess(access);
                    }} />
            }
        </>
    );
}

// Mount
const container = document.getElementById('sfm-app');
if (container) {
    const colors = window.SFM.colors;
    if (colors.baseColor)       container.style.setProperty('--base-color', colors.baseColor);
    if (colors.headerTextColor) container.style.setProperty('--header-text-color', colors.headerTextColor);
    if (colors.borderColor)     container.style.setProperty('--border-color', colors.borderColor);
    if (colors.btnPrimaryColor) container.style.setProperty('--btn-primary-color', colors.btnPrimaryColor);

    createRoot(container).render(<App />);
}
