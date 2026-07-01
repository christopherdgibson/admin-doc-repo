import type { AccessSetting, VisibilitySetting } from '@block-root/types';

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
            permissions: {
                rename: VisibilitySetting;
                delete: VisibilitySetting;
                trash: VisibilitySetting;
                restore: VisibilitySetting;
                purge: VisibilitySetting;
            }
        };
    }
}

export {};