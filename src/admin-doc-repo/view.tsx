import { useState, useEffect } from '@wordpress/element';
import { createRoot } from "react-dom/client";

import FileManager from "@components/FileManager";
import LoginForm from "@components/LoginForm";
import {api} from "@admin-doc-repo/utils/api";

export default function App() {
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        // Check if already authenticated via existing session
        api.listFiles()
            .then(() => setAuthed(true))
            .catch(() => setAuthed(false));
    }, []);

    return (
        <>
            {authed
                ? <FileManager api={api} />
                : <LoginForm api={api}
                    onLogin={() => setAuthed(true)} />
            }
        </>
    );
}

// Mount
const container = document.getElementById('sfm-app');
if (container) {
    createRoot(container).render(<App />);
}
