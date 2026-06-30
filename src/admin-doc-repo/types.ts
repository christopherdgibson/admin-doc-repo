export interface SfmMetaRowData {
    category: string;
    submittedBy: string;
    date: string;
    amount: string;
}

export interface SfmMetaRow extends SfmMetaRowData {
    _key: string;
}

const FILE_SORT_KEYS = ['filename', 'size', 'uploaded'] as const;
type FileSortKey = typeof FILE_SORT_KEYS[number];

export type SmfFileSortKeys = {
    [K in FileSortKey]: K extends 'size' | 'uploaded' ? number : string;
};

export interface SfmFile extends SmfFileSortKeys {
    url: string;
    meta: SfmMetaRow[];
}

export type SortKey = FileSortKey | 'total' | keyof SfmMetaRowData;

function isFileSortKey(key: SortKey): key is FileSortKey {
    return (FILE_SORT_KEYS as readonly string[]).includes(key);
}

export function getSortValue(file: SfmFile, key: SortKey): string | number {
    if (key === 'total') {
        return file.meta.reduce((sum, row) => sum + parseFloat(row.amount || '0'), 0);
    }
    if (isFileSortKey(key)) {
        return file[key] ?? '';
    }
    // For meta keys, aggregate across all rows for sorting purposes
    // e.g. sort by the first row's value, or empty string if no rows
    const firstRow = file.meta[0];
    if (!firstRow) return '';
    return firstRow[key as keyof SfmMetaRowData] ?? '';
}

export interface SfmTrashedFile {
    original_filename: string;
    trash_filename: string;
    deleted_at: number;
    meta: SfmMetaRowData[];
}

export type AccessLevel = 'Full' | 'Restricted';

export interface ApiResponse {
    success: boolean;
}

export interface FileResponse extends ApiResponse {
    filename: string;
}

export interface ApiProps {
    call(endpoint: string, options?: RequestInit): Promise<any>;
    login: (password: string) => Promise<{ success: boolean; access: AccessLevel }>;
    logout: () => Promise<ApiResponse>;
    session: () => Promise<{ access: AccessLevel | null }>
    listFiles: () => Promise<SfmFile[]>;
    upload: (file: File) => Promise<FileResponse>;
    rename: (old_filename: string, new_filename: string) => Promise<ApiResponse>;
    delete: (filename: string) => Promise<ApiResponse>;
    purge: (trash_filename: string) => Promise<ApiResponse>;
    listTrash: () => Promise<SfmTrashedFile[]>;
    restore: (trash_filename: string) => Promise<FileResponse>;
    saveMeta: (filename: string, rows: SfmMetaRowData[]) => Promise<ApiResponse>;
}

export type VisibilitySetting = 'Show' | 'Hide';
export type AccessSetting = 'Read / write' | 'Read only' | 'Hide';
export type PermissionSetting = AccessSetting | VisibilitySetting;

export interface PermissionProps {
    rename: AccessSetting;
    remove: AccessSetting;
    trash: VisibilitySetting;
    restore: AccessSetting;
    delete: AccessSetting;
}

export interface FilePermissionProps {
    rename: boolean;
    remove: boolean;
}

export interface TrashPermissionProps {
    trash: boolean;
    restore: boolean;
    delete: boolean;
}

export interface BlockAttributes {
    align: string;
    categories: string[];
    submissions: string[];
    baseColor: string;
    headerTextColor: string;
    borderColor: string;
    btnPrimaryColor: string;
    permissions: PermissionProps;
}

export interface SetAttributesProps {
    setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

export interface EditProps extends SetAttributesProps {
    attributes: BlockAttributes;
}

export type ArrayKeys<T> = {
    [K in keyof T]: T[K] extends any[] ? K : never;
} [keyof T];

export type OnClick = () => void;

export type OnChange = (value: string) => void;

export interface ThemeStyles extends React.CSSProperties {
    "--base-color"?: string;
    "--header-text-color"?: string;
    "--border-color"?: string;
    "--btn-primary-color"?: string;
}

// // select onChange
// (e: React.ChangeEvent<HTMLSelectElement>)

// // button onClick
// (e: React.MouseEvent<HTMLButtonElement>)
