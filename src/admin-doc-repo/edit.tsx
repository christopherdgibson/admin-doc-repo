import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';

import ExpandButton from '@components/ExpandButton';

import type { EditProps, SfmFile, SfmMetaRow, ThemeStyles } from '@block-root/types';

import OptionsPanel from '@components/ui-panels/OptionsPanel';
import FileManager from "@components/FileManager";
import ColorPanelDashboard from "@components/ui-panels/ColorPanelDashboard";

export default function Edit({ attributes, setAttributes }: EditProps) {
    const { categories, submissions, baseColor, headerTextColor, borderColor, btnPrimaryColor } = attributes;
    const blockProps = useBlockProps({ className: "sfm-edit-container" });
    const [expanded, setExpanded] = useState(false);

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
        uploaded: 0,
        url: '',
        meta: [sampleRow]
    } as SfmFile;

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
                <div className={'edit-panel'}>
                <ExpandButton displayText={'Document repository preview'} className={'edit-panel-title'} tooltipText={'repository'} expanded={expanded} setExpanded={setExpanded}/>
                {expanded && (
                    <div className={'edit-panel-body'}>
                        <FileManager categories={categories} submissions={submissions} filesInput={[sampleFile]}/>
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
