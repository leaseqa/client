import React from "react";

import styles from "../ai-review.module.css";

export type SourceMode = "upload" | "paste";

type SourceModeTabsProps = {
  mode: SourceMode;
  onModeChange: (mode: SourceMode) => void;
};

export default function SourceModeTabs({
  mode,
  onModeChange,
}: SourceModeTabsProps) {
  return (
    <div className={styles.sourceTabs} role="tablist" aria-label="Source type">
      <button
        id="source-tab-upload"
        type="button"
        role="tab"
        aria-selected={mode === "upload"}
        aria-controls="source-panel-upload"
        className={styles.sourceTab}
        onClick={() => onModeChange("upload")}
      >
        Upload File
      </button>
      <button
        id="source-tab-paste"
        type="button"
        role="tab"
        aria-selected={mode === "paste"}
        aria-controls="source-panel-paste"
        className={styles.sourceTab}
        onClick={() => onModeChange("paste")}
      >
        Paste Text
      </button>
    </div>
  );
}
