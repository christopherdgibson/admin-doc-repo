import { useState } from "@wordpress/element";
import { ButtonGroup } from "@wordpress/components";
import type { Dispatch, SetStateAction } from "react";

import type { SetAttributesProps } from "@block-root/types";
import constants from "@block-root/constants";

import "./styles.css";

const THEME_PRESETS = constants.themePresets;

type ThemeKey = keyof typeof THEME_PRESETS;

interface ThemeButtonProps extends SetAttributesProps {
    themeName: ThemeKey;
    themeText: string;
    activeTheme: string;
    setActiveTheme: Dispatch<SetStateAction<ThemeKey>>;
}

export default function PresetColorsPanel({setAttributes} : SetAttributesProps) {
    const [activeTheme, setActiveTheme] = useState<keyof typeof THEME_PRESETS>("default");

    return (
        <ButtonGroup className="btn-grid">
            <ThemeButton themeName="blue" themeText="Blue theme" activeTheme={activeTheme} setActiveTheme={setActiveTheme} setAttributes={setAttributes} />
            <ThemeButton themeName="orange" themeText="Orange theme" activeTheme={activeTheme} setActiveTheme={setActiveTheme} setAttributes={setAttributes} />
            <ThemeButton themeName="lavendar" themeText="Lavendar theme" activeTheme={activeTheme} setActiveTheme={setActiveTheme} setAttributes={setAttributes} />
            <ThemeButton themeName="forest" themeText="Forest theme" activeTheme={activeTheme} setActiveTheme={setActiveTheme} setAttributes={setAttributes} />
        </ButtonGroup>
    );
}

function ThemeButton({ themeName, themeText, activeTheme, setActiveTheme, setAttributes }: ThemeButtonProps) {
    return (
        <button
            style={{background: THEME_PRESETS[themeName].baseColor,
                color: THEME_PRESETS[themeName].headerTextColor,
                outline: `solid ${activeTheme === themeName ? "2px" : "1px"} ${THEME_PRESETS[themeName].borderColor}`,
                borderColor: THEME_PRESETS[themeName].borderColor,
                boxShadow: 'none',
            }}
            className={`btn-theme-color ${activeTheme === themeName ? " selected" : ""}`}
            onClick={() => {
                setActiveTheme(themeName);
                setAttributes({ ...THEME_PRESETS[themeName] });
            }}
        >
            {themeText}
        </button>
    );
}
