export interface SfmFile {
    filename: string;
    size: number;
    uploaded: number;
    url: string;
    category: string;
    date: string;
}

export interface SfmMeta {
    category: string;
    date: string;
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
    saveMeta: (filename: string, category: string, date: string, amount: string) => Promise<ApiResponse>;
}

export interface BlockAttributes {
    align: string;
    categories: string[];
}

export interface SetAttributesProps {
    setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

export interface EditProps extends SetAttributesProps {
    attributes: BlockAttributes;
}

// interface EditButtonsProps<T = void> {
//     onClickDelete: (arg?: T) => void;
//     onClickSplit: () => void;
//     isSubMeeting: boolean;
// }

export interface SelectedCard {
    index: number | null;
    subIndex: number | null;
}

export type OnClick = () => void;

export type OnChange = (value: string) => void;

export interface ThemeStyles extends React.CSSProperties {
    "--base-bg"?: string;
    "--font-selected"?: string;
    "--accent-primary"?: string;
    "--accent-secondary"?: string;
}