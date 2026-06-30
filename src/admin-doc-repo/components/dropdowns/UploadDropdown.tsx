interface UploadDropdownProps {
    title: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    options: string[];
    disabled?: boolean;
    emptyOption?: boolean
}

export default function UploadDropdown({title, value, onChange, options, disabled = false, emptyOption = true}: UploadDropdownProps) {
    return(
        <div className="sfm-upload-input-group">
            <div className="sfm-upload-input">
                <span>{title}</span> 
                <select
                    className="sfm-inline-select"
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                >
                    {emptyOption && <option value="">— None —</option>}
                    {options.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>
    )
}