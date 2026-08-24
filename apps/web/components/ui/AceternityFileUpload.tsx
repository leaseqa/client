"use client";

import React from "react";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileText, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

type AceternityFileUploadProps = {
  name: string;
  accept?: string;
  maxSizeMb?: number;
  onFilesChangeAction?: (files: File[]) => void;
};

function toInputAcceptMap(accept?: string) {
  if ( !accept ) {
    return undefined;
  }

  return accept.split(",").reduce<Record<string, string[]>>((result, type) => {
    const trimmed = type.trim();
    if ( !trimmed ) {
      return result;
    }
    if ( trimmed === ".docx" ) {
      result["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = [trimmed];
      return result;
    }
    result[trimmed] = [];
    return result;
  }, {});
}

export default function AceternityFileUpload({
                                               name,
                                               accept = "application/pdf",
                                               maxSizeMb = 8,
                                               onFilesChangeAction,
                                             }: AceternityFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const acceptMap = useMemo(() => toInputAcceptMap(accept), [accept]);
  const pdfOnly = useMemo(
    () => accept.replace(/\s+/g, "") === "application/pdf",
    [accept],
  );
  const pdfAndDocxOnly = useMemo(
    () =>
      accept.replace(/\s+/g, "") ===
      "application/pdf,.docx",
    [accept],
  );

  const syncFiles = (nextFiles: File[]) => {
    setFiles(nextFiles);
    onFilesChangeAction?.(nextFiles);

    if ( !inputRef.current ) {
      return;
    }

    const dataTransfer = new DataTransfer();
    nextFiles.forEach((file) => dataTransfer.items.add(file));
    inputRef.current.files = dataTransfer.files;
  };

  const handleFiles = (nextFiles: File[]) => {
    syncFiles(nextFiles.slice(0, 1));
  };

  const { getRootProps, isDragActive } = useDropzone({
    accept: acceptMap,
    maxFiles: 1,
    maxSize: maxSizeMb * 1024 * 1024,
    noClick: true,
    onDrop: handleFiles,
  });

  const activeFile = files[0];

  return (
    <div className="acet-file-upload" {...getRootProps()}>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        className="d-none"
        onChange={(event) => handleFiles(Array.from(event.target.files || []))}
      />

      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.995 }}
        className={`acet-file-upload-surface ${isDragActive ? "is-active" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        <div className="acet-file-upload-copy">
          <div className="acet-file-upload-icon">
            <Upload size={18}/>
          </div>
          <div>
            <div className="acet-file-upload-title">
              {activeFile
                ? activeFile.name
                : pdfOnly
                  ? "Upload a lease PDF"
                  : pdfAndDocxOnly
                    ? "Choose a lease file"
                    : "Upload a lease file"}
            </div>
            <div className="acet-file-upload-note">
              {isDragActive
                ? "Drop the file here"
                : `${pdfOnly ? "PDF" : pdfAndDocxOnly ? "PDF or Word" : "PDF, Word, or text"}, up to ${maxSizeMb}MB`}
            </div>
          </div>
          <span className="acet-file-upload-action">
                        {activeFile ? "Change file" : "Choose file"}
                    </span>
        </div>

        <AnimatePresence initial={false}>
          {activeFile ? (
            <motion.div
              key={activeFile.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="acet-file-upload-card"
            >
              <div className="acet-file-upload-card-main">
                <FileText size={16}/>
                <div>
                  <div className="acet-file-upload-card-title">{activeFile.name}</div>
                  <div className="acet-file-upload-card-note">
                    {(activeFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <div className="acet-file-upload-card-type">
                {activeFile.type || (pdfAndDocxOnly ? "PDF/DOCX" : "PDF")}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
