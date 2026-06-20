import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';

import type { EditProps } from '@block-root/types';

export default function Edit({ attributes, setAttributes }: EditProps) {
    const { categories } = attributes;
    const [newCategory, setNewCategory] = useState('');

    function addCategory() {
        if (newCategory.trim()) {
            setAttributes({ categories: [...categories, newCategory.trim()] });
            setNewCategory('');
        }
    }

    function removeCategory(index: number) {
        setAttributes({ categories: categories.filter((_, i) => i !== index) });
    }

    return (
        <>
            <InspectorControls>
                <PanelBody title="Categories">
                    {categories.map((cat, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>{cat}</span>
                            <Button isDestructive isSmall onClick={() => removeCategory(i)}>Remove</Button>
                        </div>
                    ))}
                    <TextControl
                        label="New category"
                        value={newCategory}
                        onChange={setNewCategory}
                    />
                    <Button isPrimary onClick={addCategory}>Add</Button>
                </PanelBody>
            </InspectorControls>

            <div {...useBlockProps()}>
                Document Repository
            </div>
        </>
    );
}