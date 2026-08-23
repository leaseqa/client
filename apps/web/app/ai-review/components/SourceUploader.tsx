import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { Shield } from "lucide-react";

import AceternityFileUpload from "@/components/ui/AceternityFileUpload";
import AceternityStatefulButton from "@/components/ui/AceternityStatefulButton";
import { CHAT_UPLOAD_ACCEPT, CHAT_UPLOAD_MAX_MB } from "../view-model";
import styles from "../ai-review.module.css";
import SourceModeTabs, { SourceMode } from "./SourceModeTabs";

type SourceUploaderProps = {
  sourceText: string;
  selectedFile: File | null;
  uploadResetKey: number;
  creatingSession: boolean;
  pendingDraftSource: boolean;
  hasActiveSession: boolean;
  isGuest: boolean;
  onSourceTextChange: (value: string) => void;
  onFilesChange: (files: File[]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function SourceUploader({
  sourceText,
  selectedFile,
  uploadResetKey,
  creatingSession,
  pendingDraftSource,
  hasActiveSession,
  isGuest,
  onSourceTextChange,
  onFilesChange,
  onSubmit,
}: SourceUploaderProps) {
  const [mode, setMode] = useState<SourceMode>(
    sourceText.trim() ? "paste" : "upload",
  );
  const [userToggledOpenKey, setUserToggledOpenKey] = useState<number | null>(null);
  const expanded = !hasActiveSession || userToggledOpenKey === uploadResetKey;

  const handleModeChange = (nextMode: SourceMode) => {
    if ( nextMode === mode ) {
      return;
    }
    if ( nextMode === "paste" ) {
      onFilesChange([]);
    } else {
      onSourceTextChange("");
    }
    setMode(nextMode);
  };

  return (
    <section
      className={styles.sourceSection}
      aria-label="Lease source"
      data-expanded={expanded}
      data-has-session={hasActiveSession}
    >
      <button
        type="button"
        className={styles.mobileSourceSummary}
        aria-label="Change Source"
        aria-expanded={expanded}
        onClick={() =>
          setUserToggledOpenKey(expanded ? null : uploadResetKey)
        }
      >
        <span>Source Added</span>
        <span>Change Source</span>
      </button>

      <div className={styles.sourceFormWrap}>
        <div className={styles.sectionLabel}>Source</div>
        <SourceModeTabs mode={mode} onModeChange={handleModeChange}/>

        <Form onSubmit={onSubmit} className={`review-upload-stack ${styles.sourceForm}`}>
          {mode === "upload" ? (
            <div
              id="source-panel-upload"
              role="tabpanel"
              aria-labelledby="source-tab-upload"
            >
              <AceternityFileUpload
                key={uploadResetKey}
                name="file"
                accept={CHAT_UPLOAD_ACCEPT}
                maxSizeMb={CHAT_UPLOAD_MAX_MB}
                onFilesChangeAction={onFilesChange}
              />
            </div>
          ) : (
            <div
              id="source-panel-paste"
              role="tabpanel"
              aria-labelledby="source-tab-paste"
            >
              <Form.Group>
                <Form.Label className="visually-hidden" htmlFor="lease-source-text">
                  Lease clause or housing text
                </Form.Label>
                <Form.Control
                  id="lease-source-text"
                  as="textarea"
                  name="sourceText"
                  value={sourceText}
                  onChange={(event) => onSourceTextChange(event.target.value)}
                  rows={7}
                  placeholder="Paste a lease clause, notice, or other housing text."
                  className="review-textarea"
                />
              </Form.Group>
            </div>
          )}

          <AceternityStatefulButton
            type="submit"
            status={creatingSession ? "loading" : "idle"}
            className={`btn-unified btn-unified-primary btn-unified-md ${styles.startReviewButton}`}
            disabled={
              creatingSession ||
              (mode === "upload" ? !selectedFile : !sourceText.trim())
            }
          >
            {creatingSession
              ? pendingDraftSource
                ? "Analyzing Clause"
                : "Loading Source"
              : "Start Review"}
          </AceternityStatefulButton>

          <div className={styles.sourceNote}>
            <Shield size={13}/>
            <span>
              {isGuest
                ? "Guest reviews stay in this browser session."
                : "Legal information, not legal advice."}
            </span>
          </div>
        </Form>
      </div>
    </section>
  );
}
