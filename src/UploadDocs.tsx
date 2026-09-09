import { useState, useRef } from "react";

interface UploadDocsProps {
  onBackToHome: () => void;
}

interface AnalysisResult {
  modality: string;
  scan_note: string;
}

export default function UploadDocs({ onBackToHome }: UploadDocsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAnalysisResult(null);
      setErrorMessage("");
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setAnalysisResult(null);
      setErrorMessage("");
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAnonymousUpload = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage("");
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("scan_file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/scans/anonymous-analyze/", {
        method: "POST",
        body: formData, // No Authorization headers required
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysisResult({
          modality: data.modality,
          scan_note: data.scan_note,
        });
      } else {
        setErrorMessage(data.error || "Analysis failed. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the backend ML server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ background: "var(--color-offwhite)", minHeight: "100vh", padding: "4rem 1rem" }}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-[rgba(0,0,0,0.05)]">
        
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          style={{ background: "none", border: "none", color: "gray", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", marginBottom: "1.5rem", padding: 0 }}
        >
          ← Back to Home
        </button>

        <p style={{ color: "var(--color-crimson)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Anonymous Imaging Assessment
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-crimson)", fontSize: "2.25rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Upload Pelvic Scan
        </h2>
        <p style={{ fontSize: "0.95rem", color: "gray", lineHeight: 1.6, marginBottom: "2.5rem" }}>
          Upload an MRI slice or Laparoscopy frame for instant ML modality routing and explanation. No account required—your image is processed transiently and not retained.
        </p>

        {/* Upload Drop Zone */}
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
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
          />
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🖼️</span>
          <p style={{ fontWeight: 600, color: "var(--color-charcoal)", marginBottom: "0.25rem" }}>
            Drag & drop your scan image here, or <span style={{ color: "var(--color-crimson)", textDecoration: "underline" }}>browse</span>
          </p>
          <p style={{ fontSize: "0.8rem", color: "gray" }}>
            Supports PNG and JPEG pelvic image files
          </p>
        </div>

        {/* File Selection Status */}
        {selectedFile && (
          <div style={{ marginTop: "1.5rem", background: "var(--color-offwhite)", padding: "1rem", borderRadius: "0.5rem" }} className="flex justify-between items-center">
            <div>
              <p style={{ fontSize: "0.9rem", fontWeight: 600, margin: 0 }}>{selectedFile.name}</p>
              <p style={{ fontSize: "0.75rem", color: "gray", margin: 0 }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button onClick={() => { setSelectedFile(null); setAnalysisResult(null); }} style={{ background: "none", border: "none", color: "#ef4444", fontWeight: 700, cursor: "pointer" }}>
              Remove
            </button>
          </div>
        )}

        {/* Action Button */}
        <div style={{ marginTop: "2rem" }}>
          <button
            onClick={handleAnonymousUpload}
            disabled={!selectedFile || isAnalyzing}
            style={{
              width: "100%",
              background: !selectedFile || isAnalyzing ? "#d1d5db" : "var(--color-crimson)",
              color: "white",
              fontWeight: 700,
              padding: "0.85rem",
              borderRadius: "9999px",
              border: "none",
              cursor: !selectedFile || isAnalyzing ? "not-allowed" : "pointer",
              fontSize: "0.95rem"
            }}
          >
            {isAnalyzing ? "Processing AI Analysis..." : "Analyze Scan Anonymously ➔"}
          </button>
        </div>

        {/* Error Output */}
        {errorMessage && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "0.5rem", fontSize: "0.85rem", border: "1px solid #fecaca" }}>
            {errorMessage}
          </div>
        )}

        {/* Analysis Output Section */}
        {analysisResult && (
          <div style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#f8fafc", borderRadius: "1rem", border: "1px solid #e2e8f0" }}>
            <div className="flex justify-between items-center" style={{ marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--color-crimson)", letterSpacing: "0.05em" }}>
                Modality Detected: {analysisResult.modality}
              </span>
            </div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#1e293b" }}>ML Diagnostic Explanation</h4>
            <div style={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.6, whitespace: "pre-line" }}>
              {analysisResult.scan_note}
            </div>
          </div>
        )}

        {/* Medical Disclaimer */}
        <div 
          style={{ 
            marginTop: "24px", 
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
          This document upload feature is designed to compile context for your records and health assessments. It does not provide a formal or automated clinical diagnosis. Any shared documents should not replace professional medical evaluations. If you are experiencing urgent symptoms, please seek immediate medical assistance from a doctor or your local emergency room.
        </div>

      </div>
    </div>
  );
}