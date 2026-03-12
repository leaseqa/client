"use client";

import {useMemo, useRef, useState} from "react";
import {AnimatePresence, motion} from "motion/react";
import {Upload, FileText} from "lucide-react";
import {useDropzone} from "react-dropzone";

type AceternityFileUploadProps = {
    name: string;
    accept?: string;
    maxSizeMb?: number;
    onFilesChangeAction?: (files: File[]) => void;
};

function toInputAcceptMap(accept?: string) {
    if (!accept) {
        return undefined;
    }

    return accept.split(",").reduce<Record<string, string[]>>((result, type) => {
        const trimmed = type.trim();
        if (!trimmed) {
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

        if (!inputRef.current) {
            return;
        }

        const dataTransfer = new DataTransfer();
        nextFiles.forEach((file) => dataTransfer.items.add(file));
        inputRef.current.files = dataTransfer.files;
    };

    const handleFiles = (nextFiles: File[]) => {
        syncFiles(nextFiles.slice(0, 1));
    };

    const {getRootProps, isDragActive, open} = useDropzone({
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
                whileHover={{y: -1}}
                whileTap={{scale: 0.995}}
                className={`acet-file-upload-surface ${isDragActive ? "is-active" : ""}`}
                onClick={open}
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
                                        ? "Upload a lease PDF or Word file"
                                        : "Upload a lease file"}
                        </div>
                        <div className="acet-file-upload-note">
                            {isDragActive
                                ? "Drop the file here"
                                : `Drag a file here or click to browse. Max ${maxSizeMb}MB.`}
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
                            initial={{opacity: 0, y: 14}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -8}}
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
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{opacity: 0.65}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0}}
                            className="acet-file-upload-empty"
                        >
                            <div className="acet-file-upload-empty-line">
                                {pdfOnly
                                    ? "PDF only."
                                    : pdfAndDocxOnly
                                        ? "PDF or Word (.docx) only."
                                        : "PDF, DOCX, TXT, or Markdown."} One file at a time.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
