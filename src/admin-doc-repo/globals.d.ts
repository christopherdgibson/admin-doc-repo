declare global {
    interface Window {
        SFM: {
            apiBase: string;
            nonce: string;
            categories: string[];
            submissions: string[];
            colors: {
                baseColor: string;
                headerTextColor: string;
                borderColor: string;
                btnPrimaryColor: string;
            };
        };
    }
}

export {};