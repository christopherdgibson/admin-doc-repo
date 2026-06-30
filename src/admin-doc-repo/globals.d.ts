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
                rename: AccessSetting;
                remove: AccessSetting;
                trash: VisibilitySetting;
                restore: AccessSetting;
                delete: AccessSetting;
            }
        };
    }
}

export {};