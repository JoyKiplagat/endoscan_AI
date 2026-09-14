import { useState, useRef } from "react";

interface UploadDocsProps {
  onBackToHome: () => void;
}

interface AnalysisResult {
  detected_modality: string;
  probability: number;
  confidence_percentage: number;
  neg_confidence_percentage?: number;
  detected: boolean;
  summary: string;
  heatmap_overlay?: string;
  disclaimer?: string;
}

export default function UploadDocs({ onBackToHome }: UploadDocsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setErrorMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setAnalysisResult(null);
  };

  // Strips legacy markdown symbols and cleans text formatting
  const formatScanNote = (note: string) => {
    if (!note) return "";
    return note
      .replace(/\*\*\*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "•")
      .replace(/###\s?/g, "")
      .replace(/---\s?/g, "")
      .replace(/\n\s*\n/g, "\n");
  };

  const handleAnonymousUpload = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage("");
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("scan_file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-scan/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysisResult({
          detected_modality: data.detected_modality,
          probability: data.probability,
          confidence_percentage: data.confidence_percentage,
          neg_confidence_percentage: data.neg_confidence_percentage ?? (100 - data.confidence_percentage),
          detected: data.detected,
          summary: data.summary,
          heatmap_overlay: data.heatmap_overlay,
          disclaimer: data.disclaimer,
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
    <div style={{ background: "var(--color-offwhite, #f8fafc)", minHeight: "100vh", padding: "2rem 1rem" }}>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
        
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          style={{ background: "none", border: "none", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", marginBottom: "1rem", padding: 0 }}
        >
          ← Back to Home
        </button>

        <p style={{ color: "#bd4f6c", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
          Anonymous Imaging Assessment
        </p>
        <h2 style={{ color: "#1e293b", fontSize: "1.875rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Upload Pelvic Scan
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.5, marginBottom: "1.5rem" }}>
          Upload an MRI slice or Laparoscopy frame for instant ML modality routing and explanation. No account required—your image is processed transiently and not retained.
        </p>

        {/* Upload Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          style={{
            border: isDragging ? "2px dashed #bd4f6c" : "2px dashed #cbd5e1",
            background: isDragging ? "#fdf2f8" : "#f8fafc",
            borderRadius: "0.75rem",
            padding: "2.5rem 1.5rem",
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
          <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>🖼️</span>
          <p style={{ fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
            Drag & drop your scan image here, or <span style={{ color: "#bd4f6c", textDecoration: "underline" }}>browse</span>
          </p>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Supports PNG and JPEG pelvic image files
          </p>
        </div>

        {/* File Selection Status */}
        {selectedFile && (
          <div style={{ marginTop: "1rem", background: "#f1f5f9", padding: "0.75rem 1rem", borderRadius: "0.5rem" }} className="flex justify-between items-center">
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", margin: 0 }}>{selectedFile.name}</p>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button onClick={clearSelectedFile} style={{ background: "none", border: "none", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
              Remove File
            </button>
          </div>
        )}

        {/* Action Button */}
        <div style={{ marginTop: "1.25rem" }}>
          <button
            onClick={handleAnonymousUpload}
            disabled={!selectedFile || isAnalyzing}
            style={{
              width: "100%",
              background: !selectedFile || isAnalyzing ? "#cbd5e1" : "#bd4f6c",
              color: "white",
              fontWeight: 700,
              padding: "0.85rem",
              borderRadius: "9999px",
              border: "none",
              cursor: !selectedFile || isAnalyzing ? "not-allowed" : "pointer",
              fontSize: "0.95rem",
              boxShadow: !selectedFile || isAnalyzing ? "none" : "0 4px 12px rgba(189, 79, 108, 0.25)"
            }}
          >
            {isAnalyzing ? "Processing AI Analysis..." : "Analyze Scan Anonymously ➔"}
          </button>
        </div>

        {/* Error Output */}
        {errorMessage && (
          <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "0.5rem", fontSize: "0.85rem", border: "1px solid #fecaca" }}>
            {errorMessage}
          </div>
        )}

        {/* Analysis Output Section */}
        {analysisResult && (
          <div style={{ marginTop: "1.5rem", padding: "1.5rem", backgroundColor: "#f8fafc", borderRadius: "1rem", border: "1px solid #e2e8f0" }}>
            
            {/* Header Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "#bd4f6c", letterSpacing: "0.08em" }}>
                  Detected Modality
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {analysisResult.detected_modality} Scan
                </h3>
              </div>
              <span style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                backgroundColor: analysisResult.detected ? "#fef3c7" : "#dcfce7",
                color: analysisResult.detected ? "#92400e" : "#166534",
                border: analysisResult.detected ? "1px solid #fde68a" : "1px solid #bbf7d0"
              }}>
                {analysisResult.detected ? "Potential Indicators Detected" : "Unremarkable Scan"}
              </span>
            </div>

            {/* Probability Breakdown Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ backgroundColor: "#ffffff", padding: "0.85rem 1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Endometriosis Likelihood
                </span>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#d97706", margin: "0.25rem 0 0 0" }}>
                  {analysisResult.confidence_percentage}%
                </p>
              </div>
              <div style={{ backgroundColor: "#ffffff", padding: "0.85rem 1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Unremarkable Likelihood
                </span>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16a34a", margin: "0.25rem 0 0 0" }}>
                  {analysisResult.neg_confidence_percentage}%
                </p>
              </div>
            </div>

            {/* Visual Images Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
              {filePreviewUrl && (
                <div style={{ backgroundColor: "#ffffff", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "0.5rem" }}>
                    Original Scan Frame
                  </span>
                  <img src={filePreviewUrl} alt="Original Scan" style={{ width: "100%", height: "auto", borderRadius: "0.375rem" }} />
                </div>
              )}
              {analysisResult.heatmap_overlay && (
                <div style={{ backgroundColor: "#ffffff", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "0.5rem" }}>
                    Grad-CAM Focus Heatmap
                  </span>
                  <img src={analysisResult.heatmap_overlay} alt="AI Heatmap Overlay" style={{ width: "100%", height: "auto", borderRadius: "0.375rem" }} />
                </div>
              )}
            </div>

            {/* Gemini Dynamic Explainer Summary */}
            <div style={{ backgroundColor: "#ffffff", padding: "1rem 1.25rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", color: "#475569", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                AI Clinical Explanation
              </h4>
              <p style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.6, margin: 0 }}>
                {formatScanNote(analysisResult.summary)}
              </p>
            </div>

          </div>
        )}

        {/* Medical Disclaimer */}
        <div 
          style={{ 
            marginTop: "1.5rem", 
            padding: "0.85rem 1rem", 
            backgroundColor: "#fff5f5", 
            borderLeft: "4px solid #bd4f6c", 
            borderRadius: "4px",
            color: "#4a5568",
            fontSize: "0.8rem",
            lineHeight: "1.4"
          }}
        >
          <strong style={{ color: "#bd4f6c", display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>
            Medical Disclaimer
          </strong>
          {analysisResult?.disclaimer || "This document upload feature is designed to compile context for your records and health assessments. It does not provide a formal or automated clinical diagnosis. Any shared documents should not replace professional medical evaluations. If you are experiencing urgent symptoms, please seek immediate medical assistance from a doctor or your local emergency room."}
        </div>

      </div>
    </div>
  );
}