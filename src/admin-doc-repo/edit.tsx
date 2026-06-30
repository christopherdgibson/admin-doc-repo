import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';

import ExpandButton from '@components/ExpandButton';

import type { AccessLevel, AccessSetting, EditProps, PermissionProps, PermissionSetting, SfmFile, SfmMetaRow, SfmTrashedFile, ThemeStyles, VisibilitySetting } from '@block-root/types';

import OptionsPanel from '@components/ui-panels/OptionsPanel';
import FileManager from "@components/FileManager";
import ColorPanelDashboard from "@components/ui-panels/ColorPanelDashboard";
import UploadDropdown from '@components/dropdowns/UploadDropdown';

export default function Edit({ attributes, setAttributes }: EditProps) {
    const { categories, submissions, baseColor, headerTextColor, borderColor, btnPrimaryColor } = attributes;
    const blockProps = useBlockProps({ className: "sfm-edit-container" });
    const [expanded, setExpanded] = useState(false);
    const [expandPermissions, setExpandPermissions] = useState(false);
    const [permissions, setPermissions] = useState<PermissionProps>(attributes.permissions);
    const [accessView, setAccessView] = useState<AccessLevel>('Full');

    const readWrite: AccessSetting[] = ['Read / write', 'Read only', 'Hide'];
    const showHide: VisibilitySetting[] = ['Show', 'Hide'];
    const accessLevels: AccessLevel[] = ['Full', 'Restricted'];

    const currentSeconds = Date.now() / 1000;
    const yesterdaySeconds = currentSeconds - 60 * 60 * 24;

    // useEffect(() => { setPermissions(attributes.permissions); }, []);
    const sampleRow = {
        _key: crypto.randomUUID(),
        category: '',
        submittedBy: '',
        date: '',
        amount: '12.34'
    } as SfmMetaRow;

    const sampleFile = {
        filename: 'sample-file.pdf',
        size: 0,
        uploaded: currentSeconds,
        url: '',
        meta: [sampleRow]
    } as SfmFile;

    const sampleTrashedFile = {
        original_filename: 'sample-file-trashed.pdf',
        trash_filename: 'sample-file-trashed.pdf',
        deleted_at: yesterdaySeconds,
        meta: [sampleRow]
    } as SfmTrashedFile;

    function ProperCase(input: string) {
        return input.slice(0,1).toUpperCase() + input.slice(1).toLowerCase();
    }

    function updatePermissions(key: keyof PermissionProps, value: PermissionSetting) {
        const newPermissions =  {...permissions, [key]: value};
        setPermissions(newPermissions);
        setAttributes({permissions: newPermissions});
    }

    return (
        <>
            <InspectorControls>
                <ColorPanelDashboard attributes={attributes} setAttributes={setAttributes} />
            </InspectorControls>
            <div {...blockProps}
                style={{
                    "--base-color": baseColor,
                    "--header-text-color": headerTextColor,
                    "--border-color": borderColor,
                    "--btn-primary-color": btnPrimaryColor,
                } as ThemeStyles}
            >
                <p>Document Repository</p>
                <div>
                    Use the expandable sections below to
                    <ul>
                        <li>Preview the Admin Document Repository (note that file access is disabled for the editing preview).</li>
                        <li>Add / remove expense categories</li>
                        <li>Add / remove names or descriptions of submittors</li>
                    </ul>

                </div>
                <div className={'edit-panel'}>
                    <ExpandButton
                        displayText={'Document repository preview'}
                        className={'edit-panel-title'}
                        tooltipText={'repository'}
                        expanded={expanded}
                        setExpanded={setExpanded}
                    />
                    {expanded && (
                        <div className={'edit-panel-body'}>
                            <FileManager
                                access={accessView}
                                categories={categories}
                                submissions={submissions}
                                permissions={permissions}
                                filesInput={[sampleFile]}
                                trashInput={[sampleTrashedFile]}
                            />
                        </div>
                    )}
                </div>
                <div className={'edit-panel'}>
                    <ExpandButton
                        displayText={'Permissions'}
                        className={'edit-panel-title'}
                        tooltipText={'permissions'}
                        expanded={expandPermissions}
                        setExpanded={setExpandPermissions}
                    />
                    {expandPermissions && (
                        <div className={'edit-panel-body'}>
                            <div className="sfm-upload-group">
                                <UploadDropdown title='Rename'
                                    value={permissions.rename}
                                    onChange={e => updatePermissions('rename', e.target.value as AccessSetting)}
                                    options={readWrite}
                                    emptyOption={false}
                                />
                                <UploadDropdown title='Remove'
                                    value={permissions.remove}
                                    onChange={e => updatePermissions('remove', e.target.value as AccessSetting)}
                                    options={readWrite}
                                    emptyOption={false}
                                />
                                <UploadDropdown title='Trash'
                                    value={permissions.trash}
                                    onChange={e => updatePermissions('trash', e.target.value as VisibilitySetting)}
                                    options={showHide}
                                    emptyOption={false}
                                />
                                <UploadDropdown title='Restore'
                                    value={permissions.restore}
                                    onChange={e => updatePermissions('restore', e.target.value as AccessSetting)}
                                    options={readWrite}
                                    emptyOption={false}
                                    disabled={permissions.trash === 'Hide'}
                                />
                                <UploadDropdown title='Delete permanently'
                                    value={permissions.delete}
                                    onChange={e => updatePermissions('delete', e.target.value as AccessSetting)}
                                    options={readWrite}
                                    emptyOption={false}
                                    disabled={permissions.trash === 'Hide'}
                                />
                                <div className="sfm-toolbar-right">
                                    <UploadDropdown title='Access (for preview only)'
                                        value={accessView}
                                        onChange={e => setAccessView(e.target.value as AccessLevel)}
                                        options={accessLevels}
                                        emptyOption={false}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <OptionsPanel title="Categories"
                    label="New category"
                    attributeKey={'categories'}
                    attributes={attributes}
                    setAttributes={setAttributes}
                />
                <OptionsPanel title="Submitted By"
                    label="New submittor"
                    attributeKey={'submissions'}
                    attributes={attributes}
                    setAttributes={setAttributes}
                />
            </div>
        </>
    );
}
