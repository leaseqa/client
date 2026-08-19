import { Form } from "react-bootstrap";
import { Shield } from "lucide-react";

import AceternityFileUpload from "@/components/ui/AceternityFileUpload";
import AceternityStatefulButton from "@/components/ui/AceternityStatefulButton";
import { CHAT_UPLOAD_ACCEPT, CHAT_UPLOAD_MAX_MB } from "../view-model";

type SourceUploaderProps = {
  sourceText: string;
  selectedFile: File | null;
  uploadResetKey: number;
  creatingSession: boolean;
  pendingDraftSource: boolean;
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
  isGuest,
  onSourceTextChange,
  onFilesChange,
  onSubmit,
}: SourceUploaderProps) {
  return (
    <section className="review-input-section">
      <Form onSubmit={onSubmit} className="review-upload-stack">
        <AceternityFileUpload
          key={uploadResetKey}
          name="file"
          accept={CHAT_UPLOAD_ACCEPT}
          maxSizeMb={CHAT_UPLOAD_MAX_MB}
          onFilesChangeAction={onFilesChange}
        />

        <div className="review-divider">or paste text</div>

        <Form.Group>
          <Form.Control
            as="textarea"
            name="sourceText"
            value={sourceText}
            onChange={(event) => onSourceTextChange(event.target.value)}
            rows={6}
            placeholder="Paste the lease clause, notice, or housing text you want to ask about."
            className="review-textarea"
          />
        </Form.Group>

        <div className="review-form-footer">
          <div className="review-note">
            <Shield size={14}/>
            <span>
              {isGuest
                ? "Guest chats stay in this browser session."
                : "Not legal advice."}
            </span>
          </div>
          <AceternityStatefulButton
            type="submit"
            status={creatingSession ? "loading" : "idle"}
            className="btn-unified btn-unified-primary btn-unified-md"
          >
            {creatingSession
              ? pendingDraftSource
                ? "Analyzing clause"
                : "Loading source"
              : selectedFile
                ? "Start chat"
                : sourceText.trim()
                  ? "Analyze clause"
                  : "Start chat"}
          </AceternityStatefulButton>
        </div>
      </Form>
    </section>
  );
}
