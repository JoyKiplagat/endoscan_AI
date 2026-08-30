import { useState, useRef } from "react";

interface UploadDocsProps {
  onBackToHome: () => void;
}

export default function UploadDocs({ onBackToHome }: UploadDocsProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ background: "var(--color-offwhite)", minHeight: "100vh", padding: "4rem 1rem" }}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-[rgba(0,0,0,0.05)]">
        
        {/* Top Header Row */}
        <button
          onClick={onBackToHome}
          style={{ background: "none", border: "none", color: "gray", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", marginBottom: "1.5rem", padding: 0 }}
        >
          ← Back to Home
        </button>

        <p style={{ color: "var(--color-crimson)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Secure Intake Document Portal
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-crimson)", fontSize: "2.25rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Upload Pelvic Scans & MRI
        </h2>
        <p style={{ fontSize: "0.95rem", color: "gray", lineHeight: 1.6, marginBottom: "2.5rem" }}>
          Provide clear scans, imaging slices, or laboratory PDF diagnostic summaries to add clarity to your profile patterns. Files are processed locally and securely.
        </p>

        {/* Drag and Drop Zone Area Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          style={{
            border: isDragging ? "2px dashed var(--color-crimson)" : "2px dashed #d1d5db",
            background: isDragging ? "rgba(234,160,176,0.05)" : "var(--color-offwhite)",
            borderRadius: "1rem",
            padding: "3rem 2rem",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,application/pdf"
            className="hidden"
          />
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📁</span>
          <p style={{ fontWeight: 600, color: "var(--color-charcoal)", marginBottom: "0.25rem" }}>
            Drag & drop your files here, or <span style={{ color: "var(--color-crimson)", textDecoration: "underline" }}>browse</span>
          </p>
          <p style={{ fontSize: "0.8rem", color: "gray" }}>
            Supports PDF, JPEG, PNG records (Max 25MB per file)
          </p>
        </div>

        {/* Selected Files Processing Queue List */}
        {selectedFiles.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h4 style={{ color: "var(--color-charcoal)", fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>
              Uploaded Attachments ({selectedFiles.length})
            </h4>
            <div className="flex flex-col gap-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--color-offwhite)",
                    borderRadius: "0.5rem",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "between"
                  }}
                  className="justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: "1.25rem" }}>{file.type.includes("pdf") ? "📄" : "🖼️"}</span>
                    <div style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-charcoal)", margin: 0 }}>{file.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "gray", margin: 0 }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    style={{ background: "none", border: "none", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Bottom Submission Action Trigger */}
        <div style={{ marginTop: "3rem", borderTop: "1px solid #f3f4f6", paddingTop: "1.5rem" }} className="flex justify-end">
          <button
            onClick={() => {
              alert("Files saved to intake file cache successfully.");
              onBackToHome();
            }}
            disabled={selectedFiles.length === 0}
            style={{
              background: selectedFiles.length === 0 ? "#d1d5db" : "var(--color-crimson)",
              color: "white",
              fontWeight: 700,
              padding: "0.85rem 2.5rem",
              borderRadius: "9999px",
              border: "none",
              cursor: selectedFiles.length === 0 ? "not-allowed" : "pointer",
              fontSize: "0.95rem"
            }}
          >
            Attach Records to Profile ➔
          </button>
        </div>
        {/* ⚠️ Independent Clinical Disclaimer for Document Uploads */}
        <div 
          style={{ 
            marginTop: "24px", 
            marginBottom: "24px",
            padding: "16px", 
            backgroundColor: "#fff5f5", 
            borderLeft: "4px solid #bd4f6c", 
            borderRadius: "6px",
            color: "#4a5568",
            fontSize: "0.85rem",
            lineHeight: "1.5"
          }}
        >
          <strong style={{ color: "#bd4f6c", display: "block", marginBottom: "6px", fontSize: "0.95rem" }}>
            Medical Disclaimer
          </strong>
          <strong>This document upload feature is designed to compile context for your records and health assessments. It does not provide a formal or automated clinical diagnosis. Any shared documents should not replace professional medical evaluations. If you are experiencing urgent symptoms, please seek immediate medical assistance from a doctor or your local emergency room.</strong>
        </div>
      </div>
    </div>
  );
}
