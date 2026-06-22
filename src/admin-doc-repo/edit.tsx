import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import type { Dispatch, SetStateAction } from "react";

import type { ArrayKeys, BlockAttributes, EditProps } from '@block-root/types';

import OptionsPanel from '@components/OptionsPanel';



export default function Edit({ attributes, setAttributes }: EditProps) {
    const blockProps = useBlockProps({ className: "sfm-edit-container" });
    //const { categories, submissions } = attributes;

//     function updateOptions(attribute: ArrayKeys<BlockAttributes>, newOptions: string[]) {
//     setAttributes({ [attribute]: newOptions } as Partial<BlockAttributes>);
// }

    return (
        <>
            <div {...blockProps}>
                Document Repository
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
        </>
    );
}