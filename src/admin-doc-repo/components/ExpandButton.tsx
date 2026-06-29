import {Dispatch, SetStateAction} from 'react';

interface ExpandButtonProps {
    displayText: string;
    className?: string;
    tooltipText?: string;
    expanded: boolean;
    setExpanded: Dispatch<SetStateAction<boolean>>;
}

export default function ExpandButton({displayText, className, tooltipText, expanded, setExpanded}: ExpandButtonProps) {
    const showTooltip = tooltipText !== undefined;
    tooltipText = showTooltip ? ' ' + tooltipText?.trim().toLowerCase() : '';
    return(
        <>
            <button
                className={'sfm-expand-btn-container'}
                onClick={() => setExpanded(prev => !prev)}
                aria-expanded={expanded}
                aria-label={expanded ? `Collapse${tooltipText}` : `Expand${tooltipText}`}
            >
                {showTooltip && (
                    <span className={`tooltip`}>
                        <span className="tooltip-inner">
                            {`Click to ${expanded ? 'collapse' : 'expand'}${tooltipText}.`}
                        </span>
                    </span>
                )}
                <span className={className ? className : 'label-text'}>{displayText}</span>
                <svg className={`sfm-expand-btn${expanded ? ' sfm-expanded' : ''}`} width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
                    <path d="M6 10L12 15L18 10" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </button>
        </>
    )
}