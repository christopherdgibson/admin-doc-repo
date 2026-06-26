import { Button, Modal } from "@wordpress/components";
import { useState } from "@wordpress/element";

import type { SetAttributesProps } from "@block-root/types";
import constants from "@block-root/constants";

const DEFAULT_BASE_COLOR = constants.themePresets.default.baseColor;
const DEFAULT_TEXT_COLOR = constants.themePresets.default.headerTextColor;
const DEFAULT_BORDER_COLOR = constants.themePresets.default.borderColor;
const DEFAULT_BTN_COLOR = constants.themePresets.default.btnPrimaryColor;

export default function RestoreToDefaults({setAttributes}: SetAttributesProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
      <div style={{ marginTop: "1em", textAlign: "center" }}>
        <Button
          variant="primary"
          onClickCapture={() => setIsModalOpen(true)}
        >
          Restore to defaults
        </Button>
        {isModalOpen && (
          <Modal
            title="Restore Defaults"
            onRequestClose={() => setIsModalOpen(false)}
          >
            <p>Are you sure you want to restore the default colors?</p>
            <Button
              variant="primary"
              onClick={() => {
                setAttributes({
                  baseColor: DEFAULT_BASE_COLOR,
                  headerTextColor: DEFAULT_TEXT_COLOR,
                  borderColor: DEFAULT_BORDER_COLOR,
                  btnPrimaryColor: DEFAULT_BTN_COLOR,
                });
                setIsModalOpen(false);
              }}
            >
              Yes, restore.
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              style={{ marginLeft: "1em" }}
            >
              Cancel
            </Button>
          </Modal>
        )}
      </div>
    );
}
