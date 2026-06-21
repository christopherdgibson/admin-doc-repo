import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import type { Dispatch, SetStateAction } from "react";

import type { BlockAttributes, EditProps } from '@block-root/types';

export default function Edit({ attributes, setAttributes }: EditProps) {
    const { categories, submissions } = attributes;
    const [newCategory, setNewCategory] = useState('');
    const [newSubmittedBy, setNewSubmittedBy] = useState('');

    type ArrayKeys<T> = {
        [K in keyof T]: T[K] extends any[] ? K : never;
    }[keyof T];

    function addOption(attribute: ArrayKeys<BlockAttributes>, newOption: string, setNewOption: Dispatch<SetStateAction<string>>) {
        if (newOption.trim()) {
            const options = attributes[attribute] as string[];
            const newOptions = [...options, newOption.trim()];
            setAttributes({ [attribute]: newOptions } as Partial<BlockAttributes>);
            setNewOption('');
        }
    }

    function removeOption(attribute: ArrayKeys<BlockAttributes>, index: number) {
        const options = attributes[attribute] as string[];
        setAttributes({ [attribute]: options.filter((_, i) => i !== index) } as Partial<BlockAttributes>);
    }

    return (
        <>
            <InspectorControls>
                <PanelBody title="Categories">
                    {categories.map((cat, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>{cat}</span>
                            <Button isDestructive isSmall onClick={() => removeOption('categories', i)}>Remove</Button>
                        </div>
                    ))}
                    <TextControl
                        label="New category"
                        value={newCategory}
                        onChange={setNewCategory}
                    />
                    <Button isPrimary onClick={() => addOption('categories', newCategory, setNewCategory)}>Add</Button>
                </PanelBody>
                <PanelBody title="Submitted By">
                    {submissions.map((sub, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>{sub}</span>
                            <Button isDestructive isSmall onClick={() => removeOption('submissions', i)}>Remove</Button>
                        </div>
                    ))}
                    <TextControl
                        label="New submittor"
                        value={newSubmittedBy}
                        onChange={setNewSubmittedBy}
                    />
                    <Button isPrimary onClick={() => addOption('submissions', newSubmittedBy, setNewSubmittedBy)}>Add</Button>
                </PanelBody>
            </InspectorControls>

            <div {...useBlockProps()}>
                Document Repository
            </div>
        </>
    );
}