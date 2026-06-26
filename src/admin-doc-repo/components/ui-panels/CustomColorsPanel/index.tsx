import type { EditProps } from "@block-root/types";
import { useState } from "@wordpress/element";

import { ButtonGroup, ColorPicker } from "@wordpress/components";

import TabButton from "@components/ui-panels/TabButton";

import "./styles.css";

export default function CustomColorsPanel({ attributes, setAttributes }: EditProps) {
  const { baseColor, headerTextColor, borderColor, btnPrimaryColor } =
    attributes;
  const [activeSubTab, setActiveSubTab] = useState<string>("base");
  return (
    <>
      <ButtonGroup>
        <TabButton
          tabName="base"
          tabText="Base"
          activeTab={activeSubTab}
          setActiveTab={setActiveSubTab}
        />
        <TabButton
          tabName="text"
          tabText="Text"
          activeTab={activeSubTab}
          setActiveTab={setActiveSubTab}
        />
        <TabButton
          tabName="border"
          tabText="Border"
          activeTab={activeSubTab}
          setActiveTab={setActiveSubTab}
        />
        <TabButton
          tabName="btnPrimary"
          tabText="Button"
          activeTab={activeSubTab}
          setActiveTab={setActiveSubTab}
        />
      </ButtonGroup>
      {activeSubTab === "base" && (
        <ColorPicker
          color={baseColor}
          onChange={(hex: string) =>
            setAttributes({ baseColor: hex })
          }
          enableAlpha={false}
        />
      )}
      {activeSubTab === "text" && (
        <ColorPicker
          color={headerTextColor}
          onChange={(hex: string) =>
            setAttributes({ headerTextColor: hex })
          }
          enableAlpha={false}
        />
      )}
      {activeSubTab === "border" && (
        <ColorPicker
          color={borderColor}
          onChange={(hex: string) =>
            setAttributes({ borderColor: hex })
          }
          enableAlpha={false}
        />
      )}
      {activeSubTab === "btnPrimary" && (
        <ColorPicker
            color={btnPrimaryColor}
            onChange={(hex: string) =>
                setAttributes({ btnPrimaryColor: hex })
            }
            enableAlpha={false}
        />
      )}
    </>
  );
}
