import type { EditProps } from "@block-root/types";

import { ButtonGroup, PanelBody } from "@wordpress/components";
import { useState } from "@wordpress/element";

import "./styles.css";

import TabButton from "@components/ui-panels/TabButton";
import CustomColorsPanel from "@components/ui-panels/CustomColorsPanel";
import RestoreToDefaults from "@components/ui-panels/RestoreToDefaults";

export default function ColorPanelDashboard({attributes, setAttributes}: EditProps) {
    
const [activeTab, setActiveTab] = useState("custom");
  return (
    <PanelBody title="Card Design">
      <ButtonGroup>
        <TabButton
          tabName="custom"
          tabText="Custom"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <TabButton
          tabName="defaults"
          tabText="Defaults"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </ButtonGroup>
      {activeTab === "custom" && (
        <CustomColorsPanel
            attributes={attributes}
            setAttributes={setAttributes}
        />
      )}
      {activeTab === "defaults" && (
        <RestoreToDefaults setAttributes={setAttributes} />
      )}
    </PanelBody>
  );
}
