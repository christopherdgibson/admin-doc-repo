// editorApi.ts
import apiFetch from '@wordpress/api-fetch';
import type { EditorApiProps, PermissionProps, ApiResponse } from '@block-root/types';

export const editorApi: EditorApiProps = {
    savePermissions: (permissions: PermissionProps): Promise<ApiResponse> =>
        apiFetch({
            path: '/sfm/v1/permissions',
            method: 'POST',
            data: { permissions },
        }),
};
