import { InspectorControls, useBlockProps } from '@wordpress/block-editor';

import type { EditProps, SfmFile, SfmMetaRow, ThemeStyles } from '@block-root/types';

import OptionsPanel from '@components/OptionsPanel';
import FileManager from "@components/FileManager";
import ColorPanelDashboard from "@components/ui-panels/ColorPanelDashboard";



export default function Edit({ attributes, setAttributes }: EditProps) {
    const { categories, submissions, baseColor, headerTextColor, borderColor, btnPrimaryColor } = attributes;
    const blockProps = useBlockProps({ className: "sfm-edit-container" });

    const sampleRow = {
        _key: crypto.randomUUID(),
        category: '',
        submittedBy: '',
        date: '',
        amount: ''
    } as SfmMetaRow;

    const sampleFile = {
        filename: '',
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
                <FileManager categories={categories} submissions={submissions} filesInput={[sampleFile]}/>
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
