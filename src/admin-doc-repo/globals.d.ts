declare global {
    interface Window {
        SFM: {
            apiBase: string;
            nonce: string;
            categories: string[];
            submissions: string[];
        };
    }
}

export {};