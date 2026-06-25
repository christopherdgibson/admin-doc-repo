interface SfmMetaRowData {
    category: string;
    submittedBy: string;
    date: string;
    amount: string;
}

export interface SfmMetaRow extends SfmMetaRowData {
    _key: string;
}

export interface SfmFile {
    filename: string;
    size: number;
    uploaded: number;
    url: string;
    meta: SfmMetaRow[];
}

export type SortKey = 'filename' | 'size' | 'uploaded' | keyof SfmMetaRow;

// export function getSortValue(file: SfmFile, key: SortKey) {
//     if (key in file.meta) {
//         return file.meta[key as keyof SfmMetaRow[]];
//     }
    
//     return file[key as keyof Omit<SfmFile, 'meta'>];
// }

export function getSortValue(file: SfmFile, key: SortKey): string | number {
    if (key === 'filename' || key === 'size' || key === 'uploaded') {
        return file[key];
    }
    // For meta keys, aggregate across all rows for sorting purposes
    // e.g. sort by the first row's value, or empty string if no rows
    const firstRow = file.meta[0];
    if (!firstRow) return '';
    return firstRow[key as keyof SfmMetaRow] ?? '';
}

export interface ApiResponse {
    success: boolean;
}

export interface UploadResponse extends ApiResponse {
    filename: string;
}

export interface ApiProps {
    call(endpoint: string, options?: RequestInit): Promise<any>;
    login: (password: string) => Promise<ApiResponse>;
    logout: () => Promise<ApiResponse>;
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


// // select onChange
// (e: React.ChangeEvent<HTMLSelectElement>)

// // button onClick
// (e: React.MouseEvent<HTMLButtonElement>)
