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

export interface ApiResponse {
    success: boolean;
}

export interface UploadResponse extends ApiResponse {
    filename: string;
}

export type AccessLevel = 'full' | 'restricted';

export interface ApiProps {
    call(endpoint: string, options?: RequestInit): Promise<any>;
    login: (password: string) => Promise<{ success: boolean; access: AccessLevel }>;
    logout: () => Promise<ApiResponse>;
    session: () => Promise<{ access: AccessLevel | null }>
    listFiles: () => Promise<SfmFile[]>;
    upload: (file: File) => Promise<UploadResponse>;
    delete: (filename: string) => Promise<ApiResponse>;
    rename: (old_filename: string, new_filename: string) => Promise<ApiResponse>;
    saveMeta: (filename: string, rows: SfmMetaRowData[]) => Promise<ApiResponse>;
}

export interface BlockAttributes {
    align: string;
    categories: string[];
    submissions: string[];
    baseColor: string;
    headerTextColor: string;
    borderColor: string;
    btnPrimaryColor: string;
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
