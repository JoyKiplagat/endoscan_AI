import { useState } from "react";

interface QuestionnaireProps {
  onBackToHome: () => void;
}

export default function Questionnaire({ onBackToHome }: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // --- Dynamic Follow-up State Hooks ---
  const [isFollowUpStage, setIsFollowUpStage] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState("");

  const steps = [
    {
      title: "Section 1: Menstrual History & Pelvic Pain Characteristics",
      description: "This section establishes the timeline, cyclicity, and physiological presentation of pelvic pain.",
      sectionNoteId: "q1_additional_notes",
      questions: [
        {
          id: "q1_severity",
          type: "radio",
          text: "1a. How severe is your menstrual pain on a scale of 1–10?",
          options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
        },
        {
          id: "q1_med",
          type: "radio",
          text: "1b. Does your pain improve with standard over-the-counter pain medications (like ibuprofen)?",
          options: [
            "Yes, it completely relieves the pain.",
            "Yes, but it only mildly reduces the pain.",
            "No, the pain persists despite maximum recommended doses."
          ]
        },
        {
          id: "q2_cyclicity",
          type: "radio",
          text: "2. Does your lower belly (pelvic) or lower back pain occur exclusively during your period, or do you also experience pain in between cycles?",
          options: [
            "Only during my period (cyclical pain)",
            "Starts a few days before my period and goes away during bleeding",
            "Continuous/random pain throughout the month (non-cyclical pain)",
            "Primarily during ovulation (mid-cycle)",
            "None of the above"
          ]
        },
        {
          id: "q3_onset",
          type: "radio",
          text: "3a. At what age did your painful periods begin?",
          options: [
            "Since my very first period (teenage years)",
            "Developed later in my 20s or 30s",
            "None of the above"
          ]
        },
        {
          id: "q3_progression",
          type: "radio",
          text: "3b. Have you noticed the pain worsening progressively over time?",
          options: [
            "Yes, the pain has gotten progressively worse over the last few years.",
            "No, the pain has stayed relatively consistent.",
            "No, the pain has actually improved."
          ]
        },
        {
          id: "q4_missed_days",
          type: "radio",
          text: "4. How many days per month does your pelvic pain cause you to miss school, work, or social activities?",
          options: [
            "0 days",
            "1 to 2 days per month",
            "3 to 5 days per month",
            "More than 5 days per month"
          ]
        },
        {
          id: "q5_flow",
          type: "radio",
          text: "5. Do you experience heavy menstrual bleeding or unexpected spotting between periods?",
          options: [
            "Normal flow with no bleeding between periods",
            "Heavy flow (flooding through products, changing pads/tampons every 1–2 hours)",
            "Regular spotting or bleeding between periods",
            "Both heavy flow and bleeding between periods",
            "None of the above"
          ]
        }
      ]
    },
    {
      title: "Section 2: Systemic & Extrapelvic Symptoms",
      description: "This section evaluates how deep tissue implants may be interacting with the digestive, urinary, and reproductive systems.",
      sectionNoteId: "q2_additional_notes",
      questions: [
        {
          id: "q6_intercourse",
          type: "radio",
          text: "6. Do you experience deep, internal pelvic pain during or immediately following sexual intercourse?",
          options: [
            "Severe pain during intercourse",
            "Severe pain after intercourse",
            "Mild/occasional discomfort",
            "No pain during or after intercourse",
            "Not applicable"
          ]
        },
        {
          id: "q7_bowel",
          type: "checkbox",
          text: "7. Do you suffer from painful bowel movements, cyclical diarrhea, constipation, or severe abdominal bloating ('endo belly') that worsens right before or during your period? (Select all that apply)",
          options: [
            "Sharp, stabbing pain during bowel movements (dyschezia)",
            "Diarrhea that only occurs around my period",
            "Severe constipation that only occurs around my period",
            "Severe, painful abdominal bloating ('endo belly')",
            "None of the above"
          ]
        },
        {
          id: "q8_urinary",
          type: "radio",
          text: "8. Do you experience burning, pain, or an intense urgency to urinate during your menstrual cycle, despite testing negative for a UTI?",
          options: [
            "Yes, severe pain/burning when urinating during my period",
            "Yes, frequent urgency to urinate that worsens during my period",
            "No, my urinary habits do not change during my period"
          ]
        },
        {
          id: "q9_fertility",
          type: "radio",
          text: "9. Have you been actively trying to become pregnant, and if so, for how long without success?",
          options: [
            "Not trying to conceive",
            "Trying for less than 6 months",
            "Trying for 6 to 12 months without success",
            "Trying for more than 12 months without success",
            "I have previously experienced unexplained infertility or pregnancy loss",
            "None of the above "
          ]
        },
        {
          id: "q10_extrapelvic",
          type: "checkbox",
          text: "10. Do you experience chronic fatigue or localized pain outside the pelvis (such as shooting sciatic nerve pain or shoulder pain) that flares up with your period? (Select all that apply)",
          options: [
            "Chronic, severe exhaustion that does not resolve with rest",
            "Sharp, shooting nerve pain down my legs/lower back during my period",
            "Chest or shoulder pain during my period",
            "No systemic or extra-pelvic symptoms"
          ]
        }
      ]
    },
    {
      title: "Section 3: Medical, Family, & Treatment History",
      description: "This section gathers context on potential genetic predispositions and what medical interventions have already been attempted.",
      sectionNoteId: "q3_additional_notes",
      questions: [
        {
          id: "q11_family",
          type: "radio",
          text: "11. Has your mother, sister, or any close biological relative been diagnosed with endometriosis or severe pelvic pain?",
          options: [
            "Yes, confirmed endometriosis",
            "Yes, severe period pain or suspected endometriosis (but never formally diagnosed)",
            "No known family history",
            "Unknown",
            "None of the above"
          ]
        },
        {
          id: "q12_mimic",
          type: "checkbox",
          text: "12. Have you ever been diagnosed with other conditions that mimic pelvic pain? (Select all that apply)",
          options: [
            "Irritable Bowel Syndrome (IBS)",
            "Interstitial Cystitis (Painful Bladder Syndrome)",
            "Pelvic Inflammatory Disease (PID)",
            "Uterine Fibroids or Adenomyosis",
            "None of the above"
          ]
        },
        {
          id: "q13_hormonal",
          type: "checkbox",
          text: "13. Which hormonal medications have you tried to manage your symptoms? (Select all that apply)",
          options: [
            "Birth control pills / patches / rings",
            "Progesterone IUD (Mirena/Kyleena)",
            "Hormone injections or implants",
            "I have never tried hormonal treatments for my pain"
          ]
        },
        {
          id: "q14_surgery",
          type: "radio",
          text: "14. Have you ever had a pelvic surgery, and what were the findings?",
          options: [
            "Yes, diagnostic laparoscopy ➔ Endometriosis found",
            "Yes, diagnostic laparoscopy ➔ Nothing found",
            "Yes, surgery for ovarian cysts",
            "Yes, another pelvic surgery (appendectomy, C-section, etc.)",
            "No, I have never had pelvic surgery"
          ]
        }
      ]
    }
  ];

  const handleRadioScaleChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const currentValues: string[] = prev[questionId] || [];
      if (currentValues.includes(option)) {
        return { ...prev, [questionId]: currentValues.filter((v) => v !== option) };
      } else {
        return { ...prev, [questionId]: [...currentValues, option] };
      }
    });
  };

  const constructPayload = (overrideUserInput?: string) => {
    const textSegments: string[] = [];
    const historyFlags: string[] = [];

    Object.entries(answers).forEach(([key, val]) => {
      if (!val) return;

      if (key.endsWith("_notes") && typeof val === "string") {
        textSegments.push(`Section Note: ${val.trim()}`);
      } else if (Array.isArray(val) && val.length > 0) {
        textSegments.push(`${val.join(", ")}`);
      } else if (typeof val === "string") {
        textSegments.push(val);
      }
    });

    const compiledUserInput = overrideUserInput || textSegments.join(". ");
    const durationCode = answers["q2_cyclicity"]?.includes("Continuous") ? "chronic" : "acute";

    if (answers["q11_family"]?.includes("Yes")) {
      historyFlags.push("maternal_endo");
    }

    return {
      user_input: compiledUserInput || "Patient reports cyclic pelvic pain and menstrual distress.",
      duration_code: durationCode,
      history_flags: historyFlags,
      history_text: answers["q3_additional_notes"] || ""
    };
  };

  const submitAssessment = async (finalUserInput?: string) => {
    setLoading(true);
    setErrorMessage("");

    const reliableInput = finalUserInput || constructPayload().user_input || "";
    const payload = constructPayload(reliableInput.trim());

    const safePayload = {
      user_input: payload.user_input || "Patient reports cyclic pelvic pain tracking history.",
      duration_code: payload.duration_code || "DM001",
      history_flags: payload.history_flags || [],
      history_text: answers["q3_additional_notes"]?.trim() || ""
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/questionnaire/anonymous-analyze/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(safePayload)
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysisResult({
          score: data.score,
          raw_score: data.raw_score,
          tier: data.tier,
          matched_symptoms: data.matched_symptoms || [],
          systems_affected: data.systems_affected || [],
          explanation: data.explanation || "",
          alternative_explanation: data.alternative_explanation || "",
          non_endo_signals: data.non_endo_signals || []
        });
        
        setShowResults(true);
      } else {
        setErrorMessage(data?.error || data?.detail || "Failed to process assessment responses.");
      }
    } catch (error) {
      setErrorMessage("Unable to connect to the backend server. Please verify Django is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSubmit = () => {
    if (!followUpAnswer.trim()) {
      setErrorMessage("Please fill out an answer for the follow-up question or click back.");
      return;
    }

    const baseText = constructPayload().user_input;
    const enrichedText = `${baseText}. Additional Clarification: ${followUpAnswer.trim()}`;
    
    submitAssessment(enrichedText);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submitAssessment();
    }
  };

  const handleBack = () => {
    if (isFollowUpStage) {
      setIsFollowUpStage(false);
      setErrorMessage("");
      return;
    }

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onBackToHome();
    }
  };

  // --- RENDERING 1: RESULTS VIEW ---
  if (showResults && analysisResult) {
    const matchedSymptoms: string[] = analysisResult.matched_symptoms || [];
    const systemsAffected: string[] = analysisResult.systems_affected || [];
    const explanationNarrative: string = analysisResult.explanation || "Symptoms show potential overlap with pelvic health conditions.";
    const altExplanation: string = analysisResult.alternative_explanation || "Some symptoms may point toward non-endometriosis causes.";
    const priorityTier: string = (analysisResult.tier || "MODERATE").toUpperCase();
    const adjustedScore: number = analysisResult.score ?? 7.2;

    return (
      <div style={{ padding: "40px 30px", fontFamily: "sans-serif", maxWidth: "750px", margin: "0 auto", color: "#2d3748" }}>
        
        {/* Header Title */}
        <h4 style={{ 
          fontSize: "13px", 
          fontWeight: "700", 
          color: "#4A5568", 
          letterSpacing: "0.5px", 
          textTransform: "uppercase", 
          marginBottom: "24px" 
        }}>
          ASSESSMENT ANALYSIS RESULT
        </h4>

        {/* Main Content Card with Red Left Border Accent */}
        <div style={{ 
          borderLeft: "4px solid #A01235", 
          paddingLeft: "24px", 
          marginBottom: "35px" 
        }}>
          
          {/* Top Row: Tier Name (Left) & Score Badge (Right) */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-start", 
            marginBottom: "24px" 
          }}>
            <div>
              <span style={{ 
                fontSize: "11px", 
                fontWeight: "700", 
                color: "#718096", 
                letterSpacing: "0.5px", 
                textTransform: "uppercase",
                display: "block",
                marginBottom: "4px"
              }}>
                ASSESSMENT RISK TIER
              </span>
              <h2 style={{ 
                margin: 0, 
                fontSize: "20px", 
                fontWeight: "800", 
                color: "#77172E", 
                letterSpacing: "0.5px",
                textTransform: "uppercase"
              }}>
                {priorityTier} TIER
              </h2>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ 
                fontSize: "11px", 
                fontWeight: "700", 
                color: "#718096", 
                letterSpacing: "0.5px", 
                textTransform: "uppercase",
                display: "block",
                marginBottom: "2px"
              }}>
                SCORE
              </span>
              <span style={{ 
                fontSize: "22px", 
                fontWeight: "800", 
                color: "#1A202C" 
              }}>
                {adjustedScore} / 100
              </span>
            </div>
          </div>

          {/* Endometriosis Presentation */}
          <div style={{ marginBottom: "18px" }}>
            <h5 style={{ 
              margin: "0 0 6px 0", 
              fontSize: "14px", 
              fontWeight: "600", 
              color: "#4A5568" 
            }}>
              Endometriosis Presentation:
            </h5>
            <p style={{ 
              margin: 0, 
              fontSize: "14px", 
              color: "#4A5568", 
              lineHeight: "1.4" 
            }}>
              {explanationNarrative}
            </p>
          </div>

          {/* Differential Considerations */}
          {/* <div style={{ marginBottom: "28px" }}>
            <h5 style={{ 
              margin: "0 0 6px 0", 
              fontSize: "14px", 
              fontWeight: "600", 
              color: "#4A5568" 
            }}>
              Differential Considerations:
            </h5>
            <p style={{ 
              margin: 0, 
              fontSize: "14px", 
              color: "#4A5568", 
              lineHeight: "1.4" 
            }}>
              {altExplanation}
            </p>
          </div> */}

          {/* Matched Symptoms Section */}
          <div style={{ marginBottom: "24px" }}>
            <span style={{ 
              fontSize: "11px", 
              fontWeight: "700", 
              color: "#718096", 
              letterSpacing: "0.5px", 
              textTransform: "uppercase",
              display: "block",
              marginBottom: "10px"
            }}>
              MATCHED SYMPTOMs:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {matchedSymptoms.length > 0 ? (
                matchedSymptoms.map((symptom, idx) => (
                  <span 
                    key={idx} 
                    style={{ 
                      backgroundColor: "#E2E8F0", 
                      color: "#4A5568", 
                      padding: "6px 12px", 
                      borderRadius: "4px", 
                      fontSize: "13px",
                      textTransform: "lowercase" 
                    }}
                  >
                    {symptom}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "13px", color: "#A0AEC0" }}>None detected</span>
              )}
            </div>
          </div>

          {/* Organ Systems Flagged Section */}
          <div>
            <span style={{ 
              fontSize: "11px", 
              fontWeight: "700", 
              color: "#718096", 
              letterSpacing: "0.5px", 
              textTransform: "uppercase",
              display: "block",
              marginBottom: "10px"
            }}>
              ORGAN SYSTEMS FLAGGED:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {systemsAffected.length > 0 ? (
                systemsAffected.map((system, idx) => (
                  <span 
                    key={idx} 
                    style={{ 
                      backgroundColor: "#E2E8F0", 
                      color: "#4A5568", 
                      padding: "6px 12px", 
                      borderRadius: "4px", 
                      fontSize: "13px",
                      textTransform: "lowercase" 
                    }}
                  >
                    {system}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "13px", color: "#A0AEC0" }}>None flagged</span>
              )}
            </div>
          </div>

        </div>

        {/* Dashboard Return Button */}
        <button 
          onClick={onBackToHome}
          style={{ 
            padding: "12px 24px", 
            backgroundColor: "#A01235", 
            color: "#FFFFFF", 
            border: "none", 
            borderRadius: "6px", 
            cursor: "pointer", 
            fontWeight: "700",
            fontSize: "14px"
          }}
        >
          Return to Dashboard
        </button>

      </div>
    );
  }

  // --- RENDERING 2: INTERSTITIAL FOLLOW-UP QUESTION VIEW ---
  if (isFollowUpStage && analysisResult?.next_question) {
    return (
      <div style={{ padding: "30px", fontFamily: "sans-serif", maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ padding: "16px", backgroundColor: "#f0fff4", borderLeft: "4px solid #38a169", borderRadius: "6px", color: "#276749", fontSize: "0.85rem", marginBottom: "20px" }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>Clarification Pass Triggered</strong>
          Our clinical analysis engine requires a bit more context regarding your symptoms to make sure the tracking logs map accurately.
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
            {errorMessage}
          </div>
        )}

        <h2 style={{ color: "#bd4f6c", marginBottom: "15px" }}>Additional Question</h2>
        <p style={{ fontWeight: "bold", fontSize: "16px", color: "#2d3748", marginBottom: "12px", lineHeight: "1.4" }}>
          {analysisResult.next_question}
        </p>

        <textarea
          rows={5}
          value={followUpAnswer}
          onChange={(e) => setFollowUpAnswer(e.target.value)}
          placeholder="Please type your descriptive clarification here..."
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "5px",
            border: "1px solid #cbd5e0",
            resize: "vertical",
            fontFamily: "inherit",
            boxSizing: "border-box",
            marginBottom: "25px",
            fontSize: "14px"
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={handleBack}
            disabled={loading}
            style={{ padding: "10px 20px", background: "#ccc", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Back to Questionnaire
          </button>
          <button
            onClick={handleFollowUpSubmit}
            disabled={loading}
            style={{ padding: "10px 20px", background: "#bd4f6c", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            {loading ? "Re-Evaluating..." : "Submit and Finish"}
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERING 3: STANDARD STEPPED QUESTIONNAIRE VIEW ---
  const currentSection = steps[currentStep];

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", maxWidth: "700px", margin: "0 auto" }}>
      {currentStep === 0 && (
        <div style={{ marginBottom: "25px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ padding: "16px", backgroundColor: "#f0f4f8", borderLeft: "4px solid #2b6cb0", borderRadius: "6px", color: "#2d3748", fontSize: "0.85rem", lineHeight: "1.5" }}>
            <strong style={{ color: "#2b6cb0", display: "block", marginBottom: "4px", fontSize: "0.95rem" }}>
              Age Notice
            </strong>
            <strong>If you are under 18 years old, a parent or legal guardian should help you answer this questionnaire.</strong>
          </div>

          <div style={{ padding: "16px", backgroundColor: "#fff5f5", borderLeft: "4px solid #bd4f6c", borderRadius: "6px", color: "#4a5568", fontSize: "0.85rem", lineHeight: "1.5" }}>
            <strong style={{ color: "#bd4f6c", display: "block", marginBottom: "4px", fontSize: "0.95rem" }}>
              Medical Disclaimer
            </strong>
            <strong>This assessment tool is for informational purposes only and does not provide a formal medical diagnosis. The information gathered here should not replace professional medical advice, diagnosis, or treatment. If you are experiencing severe symptoms or a medical emergency, please seek immediate medical assistance from a qualified healthcare professional.</strong>
          </div>
        </div>
      )}

      {errorMessage && (
        <div style={{ backgroundColor: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
          {errorMessage}
        </div>
      )}

      <h2 style={{ color: "#bd4f6c", marginBottom: "5px" }}>{currentSection.title}</h2>
      <p style={{ color: "#666", fontSize: "14px", marginTop: "0", marginBottom: "25px" }}>
        {currentSection.description}
      </p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {currentSection.questions.map((q) => (
          <div key={q.id} style={{ borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
            <p style={{ fontWeight: "bold", marginBottom: "10px" }}>{q.text}</p>
            
            {q.type === "radio" && q.id === "q1_severity" && q.options && (
              <div style={{ display: "flex", flexDirection: "row", gap: "8px", flexWrap: "wrap" }}>
                {q.options.map((opt) => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === opt}
                      onChange={() => handleRadioScaleChange(q.id, opt)}
                      style={{ accentColor: "#bd4f6c" }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}         
            
            {q.type === "radio" && q.id !== "q1_severity" && q.options && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {q.options.map((opt) => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === opt}
                      onChange={() => handleRadioScaleChange(q.id, opt)}
                      style={{ accentColor: "#bd4f6c" }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}
            
            {q.type === "checkbox" && q.options && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {q.options.map((opt) => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={(answers[q.id] || []).includes(opt)}
                      onChange={() => handleCheckboxChange(q.id, opt)}
                      style={{ accentColor: "#bd4f6c" }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{ paddingBottom: "20px" }}>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Please provide any additional symptoms, triggers, or specific details regarding this section:
          </p>
          <textarea
            rows={4}
            value={answers[currentSection.sectionNoteId] || ""}
            onChange={(e) => handleRadioScaleChange(currentSection.sectionNoteId, e.target.value)}
            placeholder="Type your additional section details here..."
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box"
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
        <button
          onClick={handleBack}
          disabled={loading}
          style={{ padding: "10px 20px", background: "#ccc", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          {currentStep === 0 ? "Cancel" : "Back"}
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          style={{ padding: "10px 20px", background: "#bd4f6c", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          {loading ? "Analyzing Symptoms..." : currentStep === steps.length - 1 ? "Submit Assessment" : "Next Section"}
        </button>
      </div>
    </div>
  );
}