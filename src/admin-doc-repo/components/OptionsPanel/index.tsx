
import { TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';

import type { ArrayKeys, BlockAttributes, SetAttributesProps } from '@block-root/types';

import './styles.css';

interface OptionsPanelProps extends SetAttributesProps {
    title: string;
    label: string;
    attributeKey: ArrayKeys<BlockAttributes>;
    attributes: BlockAttributes;
}

export default function OptionsPanel({ title, label, attributeKey, attributes, setAttributes }: OptionsPanelProps) {
    const options = attributes[attributeKey] as string[];
    const [newOption, setNewOption] = useState('');

    type ArrayKeys<T> = {
        [K in keyof T]: T[K] extends any[] ? K : never;
    }[keyof T];

    function addOption(attribute: ArrayKeys<BlockAttributes>) {
        if (newOption.trim()) {
            const newOptions = [...options, newOption.trim()];
            setAttributes({ [attribute]: newOptions } as Partial<BlockAttributes>);
            setNewOption('');
        }
    }

    function removeOption(attribute: ArrayKeys<BlockAttributes>, index: number) {
        setAttributes({ [attribute]: options.filter((_, i) => i !== index) } as Partial<BlockAttributes>);
    }

    return (
        <div className={'panel-body'}>
            <span className={'panel-title'}>{title}</span>
            {options.map((op, i) => (
                <div key={i} className={'panel-row'}>
                    <span>{op}</span>
                    <button className={'sfm-btn sfm-btn-danger'} onClick={() => removeOption(attributeKey, i)}>Remove</button>
                </div>
            ))}
            <div className={'panel-row'}>
                <TextControl className={'text-input'}
                    label={label}
                    value={newOption}
                    onChange={setNewOption}
                />
                <button className={'sfm-btn sfm-btn-primary'} onClick={() => addOption(attributeKey)}>Add option</button>
            </div>
        </div>
    );
}