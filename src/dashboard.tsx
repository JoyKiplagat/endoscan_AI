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
  raw_responses: Record<string, any>;
  model_output: {
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
    const token = localStorage.getItem("userToken");
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
        // 1. Fetch Patient Profile
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

        // 2. Fetch Symptom Logs
        const logsResponse = await fetch(`http://127.0.0.1:8000/api/patients/logs/?patient=${currentPatientId}`, { headers });
        if (handleAuthError(logsResponse)) return;
        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          setSymptomLogs(logsData);
        }

        // 3. Fetch Questionnaire Submissions (Raw Responses + Model Output)
        const questionnaireRes = await fetch(`http://127.0.0.1:8000/api/patients/questionnaire/?patient=${currentPatientId}`, { headers });
        if (handleAuthError(questionnaireRes)) return;
        if (questionnaireRes.ok) {
          const submissionsData = await questionnaireRes.json();
          setQuestionnaireSubmissions(submissionsData);
        }

        // 4. Fetch Diagnostic Scans (Scan File + Scan Note Model Output)
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
        alert("Progress logged and synchronized.!");
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

    setUploadStatus("Uploading report & analyzing scan file...");
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
        // Response contains both saved scan_file path AND generated scan_note output
        const newScanRecord: ScanRecord = await response.json();
        setScans((prevScans) => [newScanRecord, ...prevScans]);
        setUploadStatus("Scan uploaded and analyzed successfully!");
        setSelectedFile(null);
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Django API Error Details:", errorData);

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
    <div className="min-h-screen bg-[var(--color-offwhite)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)] gap-4">
          <div>
            <h1 className="font-[var(--font-display)] text-3xl font-extrabold uppercase text-[var(--color-charcoal)]">{profileData.name}</h1>
            <p className="text-gray-500 text-sm font-medium">Isolate medical tracking variables natively</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="bg-red-50 text-[var(--color-crimson)] border border-red-100 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider">{profileData.endometriosisStage}</span>
            <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="text-xs font-bold text-gray-400 hover:text-[var(--color-crimson)] transition-colors cursor-pointer">Sign Out</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">
          <div className="lg:col-span-2 flex flex-col justify-center bg-gray-900 rounded-3xl p-8 md:p-12 shadow-md relative overflow-hidden z-10 min-h-full">
            <p style={{ color: "var(--color-amber)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Clinical Screening Element</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(1.8rem, 2.5vw, 3.5rem)", lineHeight: 1.1, color: "white", marginBottom: "1.5rem", textTransform: "uppercase" }}>Am I Safe, Or Should I <br /><span style={{ color: "var(--color-blush)" }}>See a Doctor?</span></h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.05rem", lineHeight: 1.8, maxWidth: "580px", marginBottom: "1.25rem" }}>Endometriosis symptoms vary drastically from person to person, causing diagnosis to take an average of <strong style={{ color: "var(--color-amber)" }}>7–10 years</strong>. Recognizing your patterns early saves years of silent frustration.</p>
            <div><button onClick={() => navigate("/questionnaire1")} style={{ background: "var(--color-amber)", color: "var(--color-crimson-dark)", fontWeight: 600, fontSize: "1rem", padding: "1.1rem 1.8rem", borderRadius: "9999px", border: "none", cursor: "pointer", display: "inline-block" }}>Start screening questionnaire →</button></div>
          </div>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)] w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--color-charcoal)] uppercase tracking-wide">Patient Profile</h2>
              {!isEditingProfile && <button onClick={() => setIsEditingProfile(true)} className="text-xs font-bold text-[var(--color-crimson)] hover:underline cursor-pointer">Modify</button>}
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
                  <button type="submit" className="flex-1 bg-[var(--color-crimson)] text-white text-xs font-bold uppercase tracking-wider py-2 rounded-lg hover:opacity-95">Save Nodes</button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider py-2 rounded-lg hover:bg-gray-200">Cancel</button>
                </div>
              </form>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Display Model Output from Questionnaire Submissions */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)]">
              <h2 className="text-lg font-bold text-[var(--color-charcoal)] mb-2 uppercase tracking-wide">Assessment History & ML Insights</h2>
              <p className="text-xs text-gray-500 mb-4">Persisted model evaluation results captured from your symptom submissions.</p>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {questionnaireSubmissions.length === 0 ? (
                  <p className="text-xs font-semibold text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-gray-100">No questionnaire assessments completed yet.</p>
                ) : (
                  questionnaireSubmissions.map((submission) => (
                    <div key={submission.id} className="bg-red-50/60 border-l-4 border-[var(--color-crimson)] p-4 rounded-r-xl border border-red-100/50 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--color-crimson)]">Submission #{submission.id} &bull; {submission.submitted_at ? submission.submitted_at.split('T')[0] : 'Recent'}</span>
                        {submission.model_output?.confidence_score && <span className="text-[0.65rem] font-bold text-gray-500">Confidence: {(submission.model_output.confidence_score * 100).toFixed(0)}%</span>}
                      </div>
                      <h4 className="text-sm font-bold text-gray-800">Risk Vector: {submission.model_output?.risk_level || "Evaluation Logged"}</h4>
                      <p className="text-xs text-gray-600 font-medium">{submission.model_output?.summary || "Assessment raw responses archived safely in backend."}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)]">
              <h2 className="text-lg font-bold text-[var(--color-charcoal)] mb-2 uppercase tracking-wide">Log Daily Progress</h2>
              <form onSubmit={handleAddLog} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.75rem] font-bold text-gray-500 uppercase">Pain Intensity ({newLog.painLevel}/10)</label>
                  <input type="range" min="0" max="10" value={newLog.painLevel} onChange={(e) => setNewLog({...newLog, painLevel: parseInt(e.target.value)})} className="w-full accent-[var(--color-crimson)] h-2 bg-gray-200 rounded-lg cursor-pointer mt-2" />
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
                <div className="md:col-span-3"><button type="submit" className="w-full bg-[var(--color-crimson)] text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg hover:opacity-95 transition-opacity">Commit Tracking Unit</button></div>
              </form>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)]">
              <h2 className="text-lg font-bold text-[var(--color-charcoal)] mb-4 uppercase tracking-wide">Historical Timeline Logs</h2>
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                {symptomLogs.length === 0 ? (
                  <p className="text-xs font-semibold text-gray-400 text-center py-6">No historical entries.</p>
                ) : (
                  symptomLogs.map((log, index) => (
                    <div key={log.id || index} className="border-l-4 border-[var(--color-crimson)] bg-gray-50/50 p-4 rounded-r-xl border border-gray-100 flex flex-col md:flex-row justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3"><span className="text-xs font-bold text-gray-400">{log.date}</span><span className="bg-red-100 text-[var(--color-crimson)] text-[0.65rem] px-2 py-0.5 rounded font-black">PAIN: {log.pain_level}/10</span></div>
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

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[rgba(0,0,0,0.03)] h-fit">
            <h2 className="text-lg font-bold text-[var(--color-charcoal)] mb-2 uppercase tracking-wide">Pelvic Imaging Diagnostic Log</h2>
            <p className="text-xs text-gray-500 mb-4">Maintain an uncompromised chain of history records for clinical reference.</p>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gray-400 transition-colors bg-gray-50/50">
                <input type="file" id="scan-file-node" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                <label htmlFor="scan-file-node" className="cursor-pointer text-[var(--color-crimson)] font-bold text-sm hover:underline">Append scan file array</label>
                <p className="text-[0.7rem] text-gray-400 mt-1">Accepts MRI, Ultrasound arrays, Laparoscopy PDFs</p>
              </div>
              {uploadStatus && <p className="text-xs font-semibold text-[var(--color-crimson)] bg-red-50 p-2 rounded-lg text-center border border-red-100">{uploadStatus}</p>}
              <button type="submit" className="w-full bg-gray-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-gray-900 transition-colors">Confirm Document Chain Addition</button>
            </form>
            
            {/* Display MRI Image Link + Stored Model Scan Note */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stored Imaging Repository</h4>
              {scans.length === 0 ? (
                <p className="text-[0.7rem] text-gray-400 italic">No diagnostic file vectors committed.</p>
              ) : (
                scans.map((scan, i) => {
                  const fileName = scan.scan_file ? scan.scan_file.split('/').pop() : `Scan_Record_${scan.id}`;
                  const fileUrl = scan.scan_file?.startsWith("http") ? scan.scan_file : `http://127.0.0.1:8000${scan.scan_file}`;
                  return (
                    <div key={scan.id || i} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center text-xs">
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-crimson)] hover:underline truncate max-w-[70%]">{fileName}</a>
                        <span className="text-gray-400 text-[0.65rem] font-bold">{scan.uploaded_at ? scan.uploaded_at.split('T')[0] : "Uploaded"}</span>
                      </div>
                      {scan.scan_note && (
                        <div className="mt-1 bg-white p-2.5 rounded-lg border border-gray-100 text-xs">
                          <span className="block text-[0.65rem] font-bold text-[var(--color-crimson)] uppercase tracking-wider mb-0.5">Diagnostic Model Note:</span>
                          <p className="text-gray-600 font-medium leading-relaxed">{scan.scan_note}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}