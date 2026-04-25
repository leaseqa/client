"use client";

import React from "react";
import dynamic from "next/dynamic";
import { FaPaperclip, FaTimes } from "react-icons/fa";
import { Scale } from "lucide-react";

import { ComposeState } from "../constants";
import { Folder } from "../types";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type ComposeFormProps = {
  composeState: ComposeState;
  folders: Folder[];
  prefillSource?: string;
  posting: boolean;
  postError: string;
  onUpdateAction: (updates: Partial<ComposeState>) => void;
  onSubmitAction: () => void;
  onCancelAction: () => void;
};

export default function ComposeForm({
                                      composeState,
                                      folders,
                                      prefillSource,
                                      posting,
                                      postError,
                                      onUpdateAction,
                                      onSubmitAction,
                                      onCancelAction,
                                    }: ComposeFormProps) {
  const isAiReviewDraft = prefillSource === "ai-review";

  const handleAddFolder = (value: string) => {
    if ( !value || composeState.folders.includes(value) ) {
      return;
    }
    onUpdateAction({ folders: [...composeState.folders, value] });
  };

  const handleRemoveFolder = (folder: string) => {
    onUpdateAction({ folders: composeState.folders.filter((currentFolder) => currentFolder !== folder) });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onUpdateAction({ files });
  };

  const getFolderLabel = (name: string) => {
    const folder = folders.find((currentFolder) => currentFolder.name === name);
    return folder?.displayName || name;
  };

  return (
    <div className={`compose-form ${isAiReviewDraft ? "compose-form-draft" : ""}`}>
      <div className="compose-form-header">
        <div>
          <h3 className="compose-form-title">
            {isAiReviewDraft ? "Edit your draft" : "Write your question"}
          </h3>
          <p className="compose-form-subtitle">
            {isAiReviewDraft
              ? "Check the wording, then post it to the right section."
              : "Write a short question and choose the right section."}
          </p>
        </div>
        <button
          type="button"
          className="compose-form-close"
          onClick={onCancelAction}
          disabled={posting}
        >
          <FaTimes size={16}/>
        </button>
      </div>

      {isAiReviewDraft && (
        <div className="compose-form-banner">
          <Scale size={16}/>
          <span>Your review summary, sections, and urgency are already filled in.</span>
        </div>
      )}

      <div className="compose-form-layout">
        <div className="compose-form-main">
          <div className="compose-form-group">
            <label className="compose-form-label">Sections</label>
            <p className="compose-form-hint">Choose the closest topic.</p>
            <select
              className="compose-form-select"
              value=""
              onChange={(event) => handleAddFolder(event.target.value)}
            >
              <option value="">Select section...</option>
              {folders.map((folder) => (
                <option key={folder.name} value={folder.name}>
                  {folder.displayName}
                </option>
              ))}
            </select>
            {composeState.folders.length > 0 && (
              <div className="compose-form-tags">
                {composeState.folders.map((folder) => (
                  <span key={folder} className="compose-form-tag">
                                        {getFolderLabel(folder)}
                    <button type="button" onClick={() => handleRemoveFolder(folder)}>
                                            <FaTimes size={10}/>
                                        </button>
                                    </span>
                ))}
              </div>
            )}
          </div>

          <div className="compose-form-group">
            <label className="compose-form-label">
              Title
              <span className="compose-form-count">{composeState.summary.length}/100</span>
            </label>
            <input
              type="text"
              className="compose-form-input"
              placeholder='Short question, for example: "Is this deposit clause normal?"'
              value={composeState.summary}
              onChange={(event) => onUpdateAction({ summary: event.target.value.slice(0, 100) })}
              maxLength={100}
            />
          </div>

          <div className="compose-form-group">
            <label className="compose-form-label">Details</label>
            <p className="compose-form-hint">Add the clause, timeline, or detail you want explained.</p>
            <div className="compose-form-editor">
              <ReactQuill
                theme="snow"
                value={composeState.details}
                onChange={(value) => onUpdateAction({ details: value })}
              />
            </div>
          </div>

          <div className="compose-form-group">
            <label className="compose-form-label">
              <FaPaperclip size={12}/>
              <span>Attachments</span>
            </label>
            <input
              type="file"
              className="compose-form-file"
              multiple
              onChange={handleFileChange}
            />
            {composeState.files.length > 0 && (
              <div className="compose-form-file-count">
                {composeState.files.length} file(s) selected
              </div>
            )}
          </div>

          {postError && (
            <div className="compose-form-error">{postError}</div>
          )}
        </div>

        <aside className="compose-form-sidebar">
          <div className="compose-form-meta-card">
            <div className="compose-form-meta-title">Options</div>

            <div className="compose-form-row">
              <span className="compose-form-label">Urgency</span>
              <div className="compose-form-options">
                {(["low", "medium", "high"] as const).map((level) => (
                  <label key={level} className={`compose-form-radio urgency-${level}`}>
                    <input
                      type="radio"
                      name="urgency"
                      checked={composeState.urgency === level}
                      onChange={() => onUpdateAction({ urgency: level })}
                    />
                    <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="compose-form-row">
              <span className="compose-form-label">Identity</span>
              <label className="compose-form-checkbox">
                <input
                  type="checkbox"
                  checked={composeState.isAnonymous}
                  onChange={(event) => onUpdateAction({ isAnonymous: event.target.checked })}
                />
                <span>Post anonymously</span>
              </label>
            </div>
          </div>

          <div className="compose-form-meta-card">
            <div className="compose-form-meta-title">Who replies here</div>
            <p className="compose-form-hint mb-0">
              Community replies live here. Attorney answers are marked <Scale size={14} className="d-inline"/>.
            </p>
          </div>
        </aside>
      </div>

      <div className="compose-form-footer">
        <button
          type="button"
          className="compose-form-btn secondary"
          onClick={onCancelAction}
          disabled={posting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="compose-form-btn primary"
          onClick={onSubmitAction}
          disabled={posting}
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
