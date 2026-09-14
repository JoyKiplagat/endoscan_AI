import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SymptomLog {
  id?: number;
  date: string;
  pain_level: number;
  bleeding: string;
  fatigue: string;
  notes: string;
  questionnaire_summary?: string;
}

interface QuestionnaireSubmission {
  id: number;
  submitted_at: string;
  status?: string;
  raw_responses: Record<string, any>;
  model_output: {
    explanation?: string;
    esi_result?: {
      tier?: string;
      score?: number;
      adjusted_endo_score?: number;
      systems_affected?: string[];
      organ_systems_flagged?: string[];
      [key: string]: any;
    };
    clinical_perspectives?: {
      endo_possibility?: string;
      differential_considerations?: string;
      recommendations?: string;
    };
    matched_symptoms?: string[];
    organ_systems_flagged?: string[];
    systems_affected?: string[];
    risk_level?: string;
    summary?: string;
    confidence_score?: number;
    [key: string]: any;
  } | null;
}

interface ScanRecord {
  id?: number;
  scan_file: string;
  scan_note?: string; 
  uploaded_at?: string;
  detected_modality?: string;
  confidence_percentage?: number;
  neg_confidence_percentage?: number;
  heatmap_overlay?: string;
  analysis_details?: {
    detected_modality?: string;
    confidence_percentage?: number;
    neg_confidence_percentage?: number;
    heatmap_overlay?: string;
    summary?: string;
  };
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const currentPatientId = localStorage.getItem("patientId") || "1";
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem("patientName") || "Anonymous",
    endometriosisStage: localStorage.getItem("patientStage") || "Moderate Symptoms",
    location: localStorage.getItem("patientLocation") || "Nairobi, Kenya",
    diagnosisDate: localStorage.getItem("patientDiagnosisDate") || "N/A"
  });

  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [newLog, setNewLog] = useState({ painLevel: 5, bleeding: "None", fatigue: "Moderate", notes: "" });
  const [questionnaireSubmissions, setQuestionnaireSubmissions] = useState<QuestionnaireSubmission[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const getAuthHeaders = (isMultipart = false) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("userToken");
    if (!token) return null;

    const isJwt = token.includes(".");
    const authPrefix = isJwt ? "Bearer" : "Token";

    const headers: Record<string, string> = {
      "Authorization": `${authPrefix} ${token}`
    };

    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  const handleAuthError = (response: Response) => {
    if (response.status === 401 || response.status === 403) {
      alert("Authentication failed or session expired. Please log in again.");
      localStorage.clear();
      navigate("/auth");
      return true;
    }
    return false;
  };

  useEffect(() => {
    const fetchDashboardMetadata = async () => {
      const headers = getAuthHeaders();
      if (!headers) return;

      try {
        const profileRes = await fetch(`http://127.0.0.1:8000/api/patients/profile/${currentPatientId}/`, { headers });
        if (handleAuthError(profileRes)) return;
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setProfileData({
            name: profile.name,
            endometriosisStage: profile.endometriosis_stage,
            location: profile.location,
            diagnosisDate: profile.diagnosis_date
          });
        }

        const logsResponse = await fetch(`http://127.0.0.1:8000/api/patients/logs/?patient=${currentPatientId}`, { headers });
        if (handleAuthError(logsResponse)) return;
        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          setSymptomLogs(logsData);
        }

        const questionnaireRes = await fetch(`http://127.0.0.1:8000/api/patients/questionnaire/?patient=${currentPatientId}`, { headers });
        if (handleAuthError(questionnaireRes)) return;
        if (questionnaireRes.ok) {
          const submissionsData = await questionnaireRes.json();
          setQuestionnaireSubmissions(submissionsData);
        }

        const scansResponse = await fetch(`http://127.0.0.1:8000/api/patients/scans/?patient=${currentPatientId}`, { headers });
        if (handleAuthError(scansResponse)) return;
        if (scansResponse.ok) {
          const scansData = await scansResponse.json();
          setScans(scansData);
        }
      } catch (error) {
        console.error("Dashboard component retrieval failure:", error);
      }
    };

    fetchDashboardMetadata();
  }, [currentPatientId, navigate]);

  useEffect(() => {
    const activeSubmissions = questionnaireSubmissions.filter(
      (sub) => sub.status === 'PENDING' || sub.status === 'PROCESSING'
    );

    if (activeSubmissions.length === 0) return;

    const intervalId = setInterval(async () => {
      const headers = getAuthHeaders();
      if (!headers) return;

      for (const sub of activeSubmissions) {
        try {
          const res = await fetch(`http://127.0.0.1:8000/api/patients/questionnaire/status/${sub.id}/`, { headers });
          if (res.ok) {
            const updatedJob = await res.json();
            if (updatedJob.status === 'COMPLETED' || updatedJob.status === 'FAILED') {
              setQuestionnaireSubmissions((prev) =>
                prev.map((item) =>
                  item.id === updatedJob.id
                    ? { ...item, status: updatedJob.status, model_output: updatedJob.model_output }
                    : item
                )
              );
            }
          }
        } catch (err) {
          console.error("Polling error for job", sub.id, err);
        }
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [questionnaireSubmissions]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/patients/profile/${currentPatientId}/`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name: profileData.name,
          endometriosis_stage: profileData.endometriosisStage,
          location: profileData.location,
          diagnosis_date: profileData.diagnosisDate
        }),
      });

      if (handleAuthError(response)) return;

      if (response.ok) {
        const updatedData = await response.json();
        localStorage.setItem("patientName", updatedData.name);
        localStorage.setItem("patientStage", updatedData.endometriosis_stage);
        localStorage.setItem("patientLocation", updatedData.location);
        localStorage.setItem("patientDiagnosisDate", updatedData.diagnosis_date);
        
        setProfileData({
          name: updatedData.name,
          endometriosisStage: updatedData.endometriosis_stage,
          location: updatedData.location,
          diagnosisDate: updatedData.diagnosis_date
        });
        setIsEditingProfile(false);
        alert("Patient profile updated successfully!");
      } else {
        alert("Failed to update profile parameters on the server.");
      }
    } catch (error) {
      console.error("Profile sync exception:", error);
      alert("Error reaching backend application layer.");
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/patients/logs/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          patient: parseInt(currentPatientId),
          pain_level: newLog.painLevel,
          bleeding: newLog.bleeding,
          fatigue: newLog.fatigue,
          notes: newLog.notes,
        }),
      });

      if (handleAuthError(response)) return;

      if (response.ok) {
        const savedLogFromDB = await response.json();
        setSymptomLogs([savedLogFromDB, ...symptomLogs]);
        setNewLog({ painLevel: 5, bleeding: "None", fatigue: "Moderate", notes: "" });
        alert("Progress logged and synchronized!");
      } else {
        alert("Failed to commit tracking unit to the database.");
      }
    } catch (error) {
      console.error("Transmission Error:", error);
      alert("Error reaching backend application layer.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files);
      setUploadStatus(`Ready to upload: ${e.target.files[0].name}`);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || selectedFile.length === 0) {
      setUploadStatus("Please choose a file first.");
      return;
    }
    
    const headers = getAuthHeaders(true);
    if (!headers) return;

    setUploadStatus("Uploading scan file & generating AI summary...");
    try {
      const uploadPayload = new FormData();
      uploadPayload.append("patient", currentPatientId);
      uploadPayload.append("scan_file", selectedFile[0]);

      const response = await fetch("http://127.0.0.1:8000/api/patients/scans/", {
        method: "POST",
        headers,
        body: uploadPayload
      });

      if (handleAuthError(response)) return;

      if (response.ok) {
        const newScanRecord: ScanRecord = await response.json();
        setScans((prevScans) => [newScanRecord, ...prevScans]);
        setUploadStatus("Scan uploaded and analyzed successfully!");
        setSelectedFile(null);
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData) {
          const formattedError = Object.entries(errorData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
            .join(" | ");
          setUploadStatus(`Upload failed: ${formattedError}`);
        } else {
          setUploadStatus(`Upload failed with status code ${response.status}.`);
        }
      }
    } catch (error) {
      console.error("File upload infrastructure failure:", error);
      setUploadStatus("Error routing file stream array to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbfb] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)] gap-4">
          <div>
            <h1 className="text-3xl font-extrabold uppercase text-slate-900 tracking-tight">{profileData.name}</h1>
            <p className="text-gray-500 text-sm font-medium">Isolate medical tracking variables natively</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="bg-red-50 text-[#9b1c31] border border-red-100 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider">{profileData.endometriosisStage}</span>
            <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="text-xs font-bold text-gray-400 hover:text-[#9b1c31] transition-colors cursor-pointer">Sign Out</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col justify-center bg-gray-900 rounded-3xl p-8 md:p-12 shadow-md relative overflow-hidden z-10 min-h-full">
            <p style={{ color: "#f59e0b", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Clinical Screening Element</p>
            <h1 style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 2.5vw, 3.5rem)", lineHeight: 1.1, color: "white", marginBottom: "1.5rem", textTransform: "uppercase" }}>Am I Safe, Or Should I <br /><span style={{ color: "#f472b6" }}>See a Doctor?</span></h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.05rem", lineHeight: 1.8, maxWidth: "580px", marginBottom: "1.25rem" }}>Endometriosis symptoms vary drastically from person to person, causing diagnosis to take an average of <strong style={{ color: "#f59e0b" }}>7–10 years</strong>. Recognizing your patterns early saves years of silent frustration.</p>
            <div><button onClick={() => navigate("/questionnaire1")} style={{ background: "#f59e0b", color: "#6b0219", fontWeight: 600, fontSize: "1rem", padding: "1.1rem 1.8rem", borderRadius: "9999px", border: "none", cursor: "pointer", display: "inline-block" }}>Start screening questionnaire →</button></div>
          </div>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)] w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Patient Profile</h2>
              {!isEditingProfile && <button onClick={() => setIsEditingProfile(true)} className="text-xs font-bold text-[#9b1c31] hover:underline cursor-pointer">Modify</button>}
            </div>

            {!isEditingProfile ? (
              <div className="space-y-4">
                <div className="border-b border-gray-50 pb-2"><span className="block text-[0.65rem] font-black uppercase tracking-wider text-gray-400">Names</span><p className="text-sm font-bold text-gray-800">{profileData.name}</p></div>
                <div className="border-b border-gray-50 pb-2"><span className="block text-[0.65rem] font-black uppercase tracking-wider text-gray-400">Status</span><p className="text-sm font-bold text-gray-800">{profileData.endometriosisStage}</p></div>
                <div className="border-b border-gray-50 pb-2"><span className="block text-[0.65rem] font-black uppercase tracking-wider text-gray-400">Demographic Node</span><p className="text-sm font-semibold text-gray-700">{profileData.location}</p></div>
                <div><span className="block text-[0.65rem] font-black uppercase tracking-wider text-gray-400">Initial Clinical Diagnosis</span><p className="text-sm font-semibold text-gray-700">{profileData.diagnosisDate}</p></div>
              </div>
            ) : (
              <form onSubmit={saveProfile} className="space-y-3 flex flex-col">
                <div className="flex flex-col gap-1"><label className="text-[0.7rem] font-bold text-gray-400 uppercase">Update Name</label><input type="text" name="name" value={profileData.name} onChange={handleProfileChange} required className="rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:border-gray-400" /></div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-bold text-gray-400 uppercase">Endometriosis Stage</label>
                  <select name="endometriosisStage" value={profileData.endometriosisStage} onChange={handleProfileChange} required className="rounded-lg border border-gray-200 bg-white p-2 text-sm focus:outline-none focus:border-gray-400">
                    <option value="Not Diagnosed / Unsure">Not Diagnosed / Unsure</option>
                    <option value="Mild Management">Mild Management</option>
                    <option value="Moderate Symptoms">Moderate Symptoms</option>
                    <option value="Advanced / Severe">Advanced / Severe</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1"><label className="text-[0.7rem] font-bold text-gray-400 uppercase">Demographic Location</label><input type="text" name="location" value={profileData.location} onChange={handleProfileChange} required className="rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:border-gray-400" /></div>
                <div className="flex flex-col gap-1"><label className="text-[0.7rem] font-bold text-gray-400 uppercase">Diagnosis Boundary Date</label><input type="text" name="diagnosisDate" value={profileData.diagnosisDate} onChange={handleProfileChange} required className="rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:border-gray-400" /></div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-[#9b1c31] text-white text-xs font-bold uppercase tracking-wider py-2 rounded-lg hover:opacity-95">Save Nodes</button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider py-2 rounded-lg hover:bg-gray-200">Cancel</button>
                </div>
              </form>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)] w-full">
            <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">
              Assessment History & Insights
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Persisted evaluation results captured and stored from your symptom submissions.
            </p>
            
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {questionnaireSubmissions.length === 0 ? (
                <p className="text-xs font-semibold text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                  No questionnaire assessments completed yet.
                </p>
              ) : (
                questionnaireSubmissions.map((submission) => {
                  const isProcessing = submission.status === 'PENDING' || submission.status === 'PROCESSING';
                  const isFailed = submission.status === 'FAILED';
                  const output = submission.model_output;
                  
                  const esiTier = output?.esi_result?.tier || output?.risk_level || (isProcessing ? "Processing..." : "MODERATE TIER");
                  const adjustedScore = output?.esi_result?.adjusted_endo_score || output?.esi_result?.score || output?.adjusted_score || "N/A";
                  
                  const rawPresentation = output?.clinical_perspectives?.endo_possibility || output?.explanation || output?.summary || "";

                  const simplifyMedicalText = (text: string) => {
                    if (!text) return "";
                    return text
                      .replace(/dyschezia/gi, "painful bowel movements")
                      .replace(/dyspareunia/gi, "painful intercourse")
                      .replace(/catamenial/gi, "period-related")
                      .replace(/etiology/gi, "cause")
                      .replace(/deep infiltrating endometriosis/gi, "deep tissue pelvic inflammation")
                      .replace(/Minimally Invasive Gynecologic Surgeon \(MIGS\)/gi, "pelvic health specialist");
                  };

                  const simplifySymptomTag = (tag: string) => {
                    const map: Record<string, string> = {
                      "period pain": "Period pain",
                      "dyschezia": "Painful bowel movements",
                      "dyspareunia": "Painful intercourse",
                      "flooding": "Heavy period bleeding",
                      "catamenial pain": "Period-related nerve pain"
                    };
                    return map[tag.toLowerCase()] || tag;
                  };

                  const simplifySystemTag = (system: string) => {
                    const clean = system.toLowerCase().trim();
                    const map: Record<string, string> = {
                      "gastrointestinal": "Digestive System",
                      "gi": "Digestive System",
                      "reproductive": "Reproductive System",
                      "urinary": "Bladder & Urinary Tract",
                      "urological": "Bladder & Urinary Tract",
                      "neurological": "Nerve Health",
                      "musculoskeletal": "Musculoskeletal System"
                    };
                    return map[clean] || system;
                  };

                  const presentationText = simplifyMedicalText(rawPresentation) || 
                    "Your symptoms show patterns commonly linked with pelvic health conditions like endometriosis.";

                  const rawMatched = output?.matched_symptoms || output?.esi_result?.matched_symptoms || [];
                  const rawSystems = output?.organ_systems_flagged || output?.esi_result?.organ_systems_flagged || output?.esi_result?.systems_affected || output?.systems_affected || [];

                  const matchedSymptoms = rawMatched.map(simplifySymptomTag);
                  const organSystems = rawSystems.map(simplifySystemTag);

                  return (
                    <div key={submission.id} className="bg-red-50/40 border-l-4 border-[#9b1c31] p-5 rounded-r-xl border border-red-100/60 flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-100 pb-3">
                        <div>
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">
                            Submission #{submission.id} &bull; {submission.submitted_at ? submission.submitted_at.split('T')[0] : 'Recent'}
                          </span>
                          <h3 className="text-base font-extrabold text-[#9b1c31] mt-0.5 uppercase">
                            {isFailed ? "PROCESSING ERROR" : esiTier.replace("TIER", "").trim()}
                          </h3>
                        </div>
                        {!isProcessing && !isFailed && (
                          <div className="sm:text-right">
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Score</span>
                            <div className="text-base font-bold text-gray-800">{adjustedScore} / 100</div>
                          </div>
                        )}
                      </div>

                      {isProcessing ? (
                        <p className="text-xs text-amber-700 font-medium italic animate-pulse py-2">
                          Analyzing symptoms and evaluating your responses...
                        </p>
                      ) : isFailed ? (
                        <p className="text-xs text-red-600 font-medium py-2">
                          An error occurred while evaluating this submission. Please submit a new assessment.
                        </p>
                      ) : (
                        <div className="space-y-3 bg-white p-4 rounded-xl border border-red-100/80 text-xs">
                          <div>
                            <h4 className="font-bold text-gray-800 mb-0.5">Symptom Overview:</h4>
                            <p className="text-gray-600 leading-relaxed">{presentationText}</p>
                          </div>

                          <div className="pt-2 flex flex-col gap-2">
                            {matchedSymptoms.length > 0 && (
                              <div>
                                <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                  Matched Symptoms:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {matchedSymptoms.map((symptom: string, idx: number) => (
                                    <span key={idx} className="bg-slate-100 text-slate-700 text-[0.7rem] px-2 py-0.5 rounded font-medium">
                                      {symptom}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {organSystems.length > 0 && (
                              <div>
                                <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                  Body Systems Involved:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {organSystems.map((system: string, idx: number) => (
                                    <span key={idx} className="bg-slate-100 text-slate-700 text-[0.7rem] px-2 py-0.5 rounded font-medium">
                                      {system}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)] w-full">
            <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">Pelvic Imaging Diagnostic Log</h2>
            <p className="text-xs text-gray-500 mb-4">Maintain an uncompromised chain of history records for clinical reference.</p>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gray-400 transition-colors bg-gray-50/50">
                <input type="file" id="scan-file-node" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                <label htmlFor="scan-file-node" className="cursor-pointer text-[#9b1c31] font-bold text-sm hover:underline">Append scan file array</label>
                <p className="text-[0.7rem] text-gray-400 mt-1">Accepts MRI or Laparoscopy images</p>
              </div>
              {uploadStatus && <p className="text-xs font-semibold text-[#9b1c31] bg-red-50 p-2 rounded-lg text-center border border-red-100">{uploadStatus}</p>}
              <button type="submit" className="w-full bg-gray-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-gray-900 transition-colors">Confirm Document Chain Addition</button>
            </form>
            
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stored Imaging Repository</h4>
              {scans.length === 0 ? (
                <p className="text-[0.7rem] text-gray-400 italic">No diagnostic file vectors committed.</p>
              ) : (
                scans.map((scan, i) => {
                  const fileName = scan.scan_file ? scan.scan_file.split('/').pop() : `Scan_Record_${scan.id}`;
                  const fileUrl = scan.scan_file?.startsWith("http") ? scan.scan_file : `http://127.0.0.1:8000${scan.scan_file}`;
                  
                  const modality = scan.detected_modality || scan.analysis_details?.detected_modality;
                  const posPct = scan.confidence_percentage ?? scan.analysis_details?.confidence_percentage;
                  const negPct = scan.neg_confidence_percentage ?? scan.analysis_details?.neg_confidence_percentage;
                  const overlayImage = scan.heatmap_overlay || scan.analysis_details?.heatmap_overlay;
                  const summaryText = scan.scan_note || scan.analysis_details?.summary;

                  return (
                    <div key={scan.id || i} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 max-w-[70%] truncate">
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#9b1c31] hover:underline truncate">{fileName}</a>
                          {modality && (
                            <span className="bg-slate-200 text-slate-700 text-[0.6rem] font-bold px-1.5 py-0.5 rounded uppercase">
                              {modality}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400 text-[0.65rem] font-bold">{scan.uploaded_at ? scan.uploaded_at.split('T')[0] : "Uploaded"}</span>
                      </div>

                      {/* Display Heatmap Overlay if available */}
                      {overlayImage && (
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200 bg-black">
                          <img src={overlayImage} alt="AI Heatmap Analysis" className="w-full h-full object-contain" />
                        </div>
                      )}

                      {/* Probabilities Badges */}
                      {(posPct !== undefined || negPct !== undefined) && (
                        <div className="flex gap-2">
                          {posPct !== undefined && (
                            <span className="bg-red-100 text-[#9b1c31] text-[0.65rem] font-bold px-2 py-0.5 rounded">
                              Likelihood: {posPct}%
                            </span>
                          )}
                          {negPct !== undefined && (
                            <span className="bg-emerald-100 text-emerald-800 text-[0.65rem] font-bold px-2 py-0.5 rounded">
                              Clear: {negPct}%
                            </span>
                          )}
                        </div>
                      )}

                      {/* Summary Text Note */}
                      {summaryText && (
                        <div className="bg-white p-3 rounded-lg border border-gray-100 text-xs space-y-1">
                          <span className="block text-[0.65rem] font-bold text-[#9b1c31] uppercase tracking-wider">Diagnostic AI Summary:</span>
                          <p className="text-gray-600 font-medium leading-relaxed">{summaryText}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)] w-full">
            <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">Log Daily Progress</h2>
            <form onSubmit={handleAddLog} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-bold text-gray-500 uppercase">Pain Intensity ({newLog.painLevel}/10)</label>
                <input type="range" min="0" max="10" value={newLog.painLevel} onChange={(e) => setNewLog({...newLog, painLevel: parseInt(e.target.value)})} className="w-full accent-[#9b1c31] h-2 bg-gray-200 rounded-lg cursor-pointer mt-2" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-bold text-gray-500 uppercase">Cycle Bleeding</label>
                <select value={newLog.bleeding} onChange={(e) => setNewLog({...newLog, bleeding: e.target.value})} className="rounded-lg border border-gray-200 bg-white p-2 text-sm focus:outline-none focus:border-gray-400"><option value="None">None</option><option value="Spotting">Spotting</option><option value="Light">Light</option><option value="Moderate">Moderate</option><option value="Heavy">Heavy</option></select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-bold text-gray-500 uppercase">Fatigue Severity</label>
                <select value={newLog.fatigue} onChange={(e) => setNewLog({...newLog, fatigue: e.target.value})} className="rounded-lg border border-gray-200 bg-white p-2 text-sm focus:outline-none focus:border-gray-400"><option value="Low">Low Fatigue</option><option value="Moderate">Moderate Fatigue</option><option value="Severe">Severe Fatigue</option></select>
              </div>
              <div className="md:col-span-3 flex flex-col gap-1">
                <label className="text-[0.75rem] font-bold text-gray-500 uppercase">Track Progress Notes & Symptoms</label>
                <input type="text" value={newLog.notes} onChange={(e) => setNewLog({...newLog, notes: e.target.value})} placeholder="E.g., tracking pain spikes post meals, specific flares..." className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
              </div>
              <div className="md:col-span-3"><button type="submit" className="w-full bg-[#9b1c31] text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg hover:opacity-95 transition-opacity">Commit Tracking Unit</button></div>
            </form>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)] w-full">
            <h2 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wide">Historical Timeline Logs</h2>
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
              {symptomLogs.length === 0 ? (
                <p className="text-xs font-semibold text-gray-400 text-center py-6">No historical entries.</p>
              ) : (
                symptomLogs.map((log, index) => (
                  <div key={log.id || index} className="border-l-4 border-[#9b1c31] bg-gray-50/50 p-4 rounded-r-xl border border-gray-100 flex flex-col md:flex-row justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3"><span className="text-xs font-bold text-gray-400">{log.date}</span><span className="bg-red-100 text-[#9b1c31] text-[0.65rem] px-2 py-0.5 rounded font-black">PAIN: {log.pain_level}/10</span></div>
                      <p className="text-sm text-gray-700 font-medium">{log.notes || "No extra commentary recorded."}</p>
                    </div>
                    <div className="flex md:flex-col gap-2 items-start md:items-end justify-start text-[0.7rem] font-bold text-gray-400 uppercase">
                      <span>Flow: <strong className="text-gray-700">{log.bleeding}</strong></span>
                      <span>Energy: <strong className="text-gray-700">{log.fatigue}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}