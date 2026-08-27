import { useState } from "react";
import { Link } from "react-router-dom";
import brandImg from "./imports/once.jpg";
import flowerImg from "./imports/twice.jpeg";
import "./index.css";

const SYMPTOMS = [
  { label: "Severe pelvic pain", detail: "Often worst during menstruation — can radiate to the lower back and legs." },
  { label: "Heavy or irregular periods", detail: "Abnormally heavy flow or periods that come unpredictably." },
  { label: "Pain during sex", detail: "Deep pain during or after intercourse, caused by lesions on the uterosacral ligaments." },
  { label: "Fatigue & brain fog", detail: "Chronic tiredness driven by inflammation and pain-disrupted sleep." },
  { label: "Bloating & bowel issues", detail: "Painful bowel movements, bloating, diarrhea — especially around your period." },
  { label: "Difficulty conceiving", detail: "Found in 30–50% of people with infertility, though pregnancy is still possible for many." },
];

const STAGES = [
  { num: "I", name: "Minimal", desc: "Small, shallow implants on pelvic organs. Minimal scar tissue." },
  { num: "II", name: "Mild", desc: "More implants, some deeper — primarily on or beneath the ovaries." },
  { num: "III", name: "Moderate", desc: "Deeper implants, small ovarian cysts (endometriomas), some adhesions." },
  { num: "IV", name: "Severe", desc: "Large endometriomas, dense adhesions, and deep implants throughout the pelvis." },
];

const COPING = [
  { icon: "🌡️", title: "Heat therapy", body: "A heating pad for 15–20 min relaxes uterine muscles and cuts cramping. One of the simplest and most effective tools." },
  { icon: "🥗", title: "Anti-inflammatory diet", body: "More oily fish, greens, and fibre. Less processed food and alcohol. Reducing inflammation systemically can ease symptoms." },
  { icon: "🧘", title: "Gentle movement", body: "Yoga, swimming, and walking ease pain and lift mood. Skip high-intensity sessions during flares." },
  { icon: "🩺", title: "Pelvic physiotherapy", body: "A specialist physio can relieve the muscle tension that amplifies endometriosis pain — often overlooked and highly effective." },
  { icon: "📓", title: "Symptom tracking", body: "Log pain (0–10), location, diet, and cycle for 2+ cycles. Patterns emerge and your clinician gets better data." },
  { icon: "🤝", title: "Community support", body: "Connecting with others who understand — online or in-person — reduces isolation and surfaces practical strategies." },
];

const TREATMENTS = [
  {
    tab: "Hormonal",
    items: ["Combined pill, patch, or ring", "Progestin-only pill or injection", "Hormonal IUD (Mirena)", "GnRH agonists or antagonists (e.g. Orilissa)", "Aromatase inhibitors"],
  },
  {
    tab: "Surgical",
    items: ["Laparoscopic excision of lesions (gold standard)", "Ablation / burning of tissue", "Ovarian cystectomy for endometriomas", "Hysterectomy (severe, refractory cases only)"],
  },
  {
    tab: "Complementary",
    items: ["Acupuncture for pain modulation", "TENS therapy", "Cognitive Behavioural Therapy (CBT)", "Mindfulness-based stress reduction"],
  },
];

const RESOURCES = [
  { name: "Endometriosis Foundation of America", url: "https://www.endofound.org" },
  { name: "Endometriosis UK", url: "https://www.endometriosis-uk.org" },
  { name: "Nancy's Nook — Specialist Directory", url: "https://nancysnookendo.com" },
  { name: "iCareBetter — Find Excision Surgeons", url: "https://icarebetter.com" },
  { name: "World Endometriosis Society", url: "https://endometriosis.ca" },
];

export default function App() {
  const [activeStage, setActiveStage] = useState(0);
  const [activeTreatment, setActiveTreatment] = useState(0);
  const [openCoping, setOpenCoping] = useState<number | null>(null);

  return (
    <div style={{ background: "var(--color-offwhite)", color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}>

      {/* NAV */}
      <nav style={{ background: "var(--color-crimson)" }} className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-14 py-4">
        <span style={{ fontFamily: "var(--font-display)", color: "var(--color-blush)", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "0.05em" }}>
          HER MATTERS
        </span>
        <div className="hidden md:flex gap-8">
          {["About", "Symptoms", "Stages", "Coping", "Treatment", "Support"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "rgba(234,160,176,0.8)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-blush)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(234,160,176,0.8)")}
            >{l}</a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section id="about" className="relative overflow-hidden min-h-[90vh] flex flex-col md:flex-row">
        {/* Left — brand image */}
        <div className="md:w-2/5 relative min-h-[40vh] md:min-h-[90vh]">
          <img src={brandImg} alt="Her Matters brand identity" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        {/* Right — headline */}
        <div className="md:w-3/5 flex flex-col justify-center px-8 md:px-16 py-16" style={{ background: "var(--color-crimson)" }}>
          <p style={{ color: "var(--color-amber)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            Patient Education Guide
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(3.5rem, 8vw, 6.5rem)", lineHeight: 0.95, color: "white", marginBottom: "1.5rem", textTransform: "uppercase" }}>
            Endometriosis:<br />
            <span style={{ color: "var(--color-blush)" }}>Know It.<br />Own It.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "420px", marginBottom: "2.5rem" }}>
            190 million people live with endometriosis worldwide — yet diagnosis takes an average of <strong style={{ color: "var(--color-amber)" }}>7–10 years</strong>. This guide gives you the knowledge to advocate for yourself.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#symptoms" style={{ background: "var(--color-amber)", color: "var(--color-crimson-dark)", fontWeight: 700, fontSize: "0.875rem", padding: "0.85rem 2rem", borderRadius: "9999px", textDecoration: "none", letterSpacing: "0.05em" }}>
              See the symptoms →
            </a>
            <a href="#coping" style={{ border: "2px solid var(--color-blush)", color: "var(--color-blush)", fontWeight: 700, fontSize: "0.875rem", padding: "0.85rem 2rem", borderRadius: "9999px", textDecoration: "none", letterSpacing: "0.05em" }}>
              Coping strategies
            </a>

          </div>
          {/* Stats row */}
          <div className="flex gap-8 mt-10 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            {[["1 in 10", "people assigned female at birth"], ["7–10 yrs", "average diagnosis delay"], ["#2", "cause of female infertility"]].map(([val, label]) => (
              <div key={label}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--color-amber)" }}>{val}</p>
                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.4, maxWidth: "80px" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT IS IT */}
      <section style={{ background: "var(--color-offwhite)", padding: "5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p style={{ color: "var(--color-crimson)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>What is it?</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem,5vw,3.5rem)", lineHeight: 1, color: "var(--color-crimson)", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Tissue that grows where it shouldn't
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--color-charcoal)", marginBottom: "1rem" }}>
              Endometriosis is a chronic inflammatory condition where tissue <em>similar</em> to the uterine lining grows outside the uterus — on ovaries, fallopian tubes, the pelvic lining, and beyond.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--color-charcoal)", marginBottom: "1rem" }}>
              Each month it swells and bleeds with your cycle — but unlike the uterine lining, it has nowhere to go. This causes inflammation, scarring (adhesions), and cysts on the ovaries (endometriomas).
            </p>
            <div style={{ background: "var(--color-crimson)", color: "white", borderRadius: "1rem", padding: "1.25rem 1.5rem", display: "inline-flex", gap: "1rem", alignItems: "flex-start", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>
                <strong style={{ color: "var(--color-amber)" }}>Pain severity ≠ disease severity.</strong> You can have Stage IV endometriosis with little pain, or Stage I with debilitating pain. Never let anyone dismiss you.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src={flowerImg}
              alt="Women's health awareness — red flower"
              className="w-full rounded-2xl object-cover"
              style={{ aspectRatio: "4/5", filter: "saturate(0.9)" }}
            />
            <div style={{ position: "absolute", bottom: "-1rem", left: "-1rem", background: "var(--color-amber)", borderRadius: "1rem", padding: "1rem 1.5rem" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--color-crimson-dark)", lineHeight: 1.1 }}>Chronic.<br />Manageable.</p>
            </div>
          </div>
        </div>
      </section>
      {/* SCREENING SYSTEM CTA */}
      <section style={{ background: "var(--color-crimson)", padding: "6rem 0", overflow: "hidden" }} className="relative">
        {/* Background visual anchor */}
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(234,160,176,0.05)", filter: "blur(60px)", pointerEvents: "none" }} />
        
        <div className="max-w-5xl mx-auto px-6 md:px-14 grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column — Text & Main Button */}
          <div>
            <p style={{ color: "var(--color-amber)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Take the first step
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem,5vw,3.5rem)", lineHeight: 1, color: "white", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Am I safe, or should I see a doctor?
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.85)", marginBottom: "1rem" }}>
              Because endometriosis symptoms vary drastically from person to person, diagnosis is frequently delayed. Recognizing your personal patterns early can save you years of silent frustration.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.85)", marginBottom: "2.5rem" }}>
              Our data-backed screening questionnaire evaluates your cycle signals, pain levels, and lifestyle markers against verified clinical indicators to map out your risk path.
            </p>
            
            {/* The Link Button to your question page */}
            <a 
              href="/questionnaire" 
              style={{ 
                background: "var(--color-amber)", 
                color: "var(--color-crimson-dark)", 
                fontWeight: 700, 
                fontSize: "0.95rem", 
                padding: "1rem 2.5rem", 
                borderRadius: "9999px", 
                textDecoration: "none", 
                letterSpacing: "0.05em",
                display: "inline-block",
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              Start screening questionnaire →
            </a>
          </div>

          {/* Right Column — Trust Cards & Upload Section */}
          <div className="flex flex-col gap-6">
            {/* Informational reassurance block */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1.5rem", padding: "2rem" }} className="flex flex-col gap-6">
              <div className="flex gap-4 items-start">
                <span style={{ fontSize: "1.5rem", background: "rgba(245,168,32,0.1)", padding: "0.5rem", borderRadius: "0.75rem", flexShrink: 0 }}>🔒</span>
                <div>
                  <h4 style={{ color: "white", fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.25rem" }}>100% Private & Confidential</h4>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", lineHeight: 1.5 }}>Your health metrics are processed anonymously. No credentials required.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span style={{ fontSize: "1.5rem", background: "rgba(245,168,32,0.1)", padding: "0.5rem", borderRadius: "0.75rem", flexShrink: 0 }}>⏳</span>
                <div>
                  <h4 style={{ color: "white", fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.25rem" }}>Quick Assessment</h4>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", lineHeight: 1.5 }}>Takes less than 3 minutes to evaluate critical clinical benchmarks.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span style={{ fontSize: "1.5rem", background: "rgba(245,168,32,0.1)", padding: "0.5rem", borderRadius: "0.75rem", flexShrink: 0 }}>📋</span>
                <div>
                  <h4 style={{ color: "white", fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.25rem" }}>Actionable Report</h4>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", lineHeight: 1.5 }}>Receive custom validation documentation to share with your personal healthcare physician.</p>
                </div>
              </div>
            </div>

            {/* 🎯 OPTIONAL SCAN & MRI UPLOAD BOX BELOW CARDS */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "1.5rem", padding: "1.5rem 2rem" }}>
              <div className="flex items-center justify-between mb-2">
                <h4 style={{ color: "white", fontSize: "1rem", fontWeight: 600 }}>Already have imaging reports?</h4>
                <span style={{ color: "var(--color-amber)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(245,168,32,0.1)", padding: "0.25rem 0.5rem", borderRadius: "0.25rem" }}>Optional</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                You can securely attach your transvaginal ultrasound or pelvic MRI records directly to your private profile summary.
              </p>
              <a 
                href="/upload-docs" 
                style={{ 
                  background: "transparent", 
                  color: "var(--color-blush)", 
                  border: "2px solid var(--color-blush)",
                  fontWeight: 700, 
                  fontSize: "0.875rem", 
                  padding: "0.75rem 1.75rem", 
                  borderRadius: "9999px", 
                  textDecoration: "none", 
                  letterSpacing: "0.05em",
                  display: "inline-block",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.background = "var(--color-blush)";
                  e.currentTarget.style.color = "var(--color-crimson-dark)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-blush)";
                }}
              >
                Upload pelvic scans or MRI →
              </a>
            </div>
          </div>

        </div>
      </section>
      {/* SYMPTOMS */}
      <section id="symptoms" style={{ background: "var(--color-crimson)", padding: "5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <div className="mb-12">
            <p style={{ color: "var(--color-amber)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Recognise the signs</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem,5vw,3.5rem)", color: "white", textTransform: "uppercase", lineHeight: 1 }}>
              Common Symptoms
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYMPTOMS.map((s, i) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "1rem", padding: "1.5rem", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,168,32,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              >
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2.5rem", color: "var(--color-blush)", opacity: 0.4, display: "block", lineHeight: 1, marginBottom: "0.5rem" }}>0{i + 1}</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "white", textTransform: "uppercase", marginBottom: "0.5rem" }}>{s.label}</h3>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "rgba(234,160,176,0.85)" }}>{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAGES */}
      <section id="stages" style={{ background: "var(--color-offwhite)", padding: "5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <p style={{ color: "var(--color-crimson)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>ASRM Classification</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem,5vw,3.5rem)", color: "var(--color-crimson)", textTransform: "uppercase", lineHeight: 1, marginBottom: "2.5rem" }}>
            The Four Stages
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {STAGES.map((s, i) => (
              <button key={s.num} onClick={() => setActiveStage(i)} style={{
                background: activeStage === i ? "var(--color-crimson)" : "white",
                border: activeStage === i ? "2px solid var(--color-crimson)" : "2px solid #e0d0d4",
                borderRadius: "0.875rem", padding: "1.25rem", textAlign: "left", cursor: "pointer", transition: "all 0.2s"
              }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2rem", color: activeStage === i ? "var(--color-amber)" : "var(--color-crimson)", lineHeight: 1 }}>Stage {s.num}</p>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: activeStage === i ? "var(--color-blush)" : "var(--color-crimson)", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.name}</p>
              </button>
            ))}
          </div>
          <div style={{ background: "var(--color-crimson)", borderRadius: "1rem", padding: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.75rem", color: "white", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Stage {STAGES[activeStage].num} — {STAGES[activeStage].name}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--color-blush)" }}>{STAGES[activeStage].desc}</p>
          </div>
        </div>
      </section>

      {/* COPING */}
      <section id="coping" style={{ background: "var(--color-charcoal)", padding: "5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <p style={{ color: "var(--color-amber)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Daily management</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem,5vw,3.5rem)", color: "white", textTransform: "uppercase", lineHeight: 1, marginBottom: "2.5rem" }}>
            Coping Strategies
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {COPING.map((c, i) => (
              <div key={c.title} style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                <button onClick={() => setOpenCoping(openCoping === i ? null : i)} className="w-full flex items-center gap-4 p-5 text-left" style={{ background: openCoping === i ? "var(--color-crimson)" : "rgba(255,255,255,0.05)", transition: "background 0.2s" }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{c.icon}</span>
                  <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "white", textTransform: "uppercase" }}>{c.title}</span>
                  <span style={{ color: "var(--color-amber)", fontWeight: 700, fontSize: "1.25rem" }}>{openCoping === i ? "−" : "+"}</span>
                </button>
                {openCoping === i && (
                  <div style={{ background: "rgba(124,26,53,0.25)", padding: "1rem 1.5rem 1.25rem" }}>
                    <p style={{ fontSize: "0.9rem", lineHeight: 1.75, color: "rgba(255,255,255,0.75)" }}>{c.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TREATMENT */}
      <section id="treatment" style={{ background: "var(--color-offwhite)", padding: "5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <p style={{ color: "var(--color-crimson)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Medical options</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem,5vw,3.5rem)", color: "var(--color-crimson)", textTransform: "uppercase", lineHeight: 1, marginBottom: "2rem" }}>
            Treatment Pathways
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, maxWidth: "560px", marginBottom: "2rem", color: "var(--color-charcoal)" }}>
            No single treatment fits everyone. The right approach depends on your symptoms, fertility goals, and response to treatment. <strong style={{ color: "var(--color-crimson)" }}>Ask specifically about excision surgery</strong> — it has far better long-term outcomes than ablation.
          </p>
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap mb-6">
            {TREATMENTS.map((t, i) => (
              <button key={t.tab} onClick={() => setActiveTreatment(i)} style={{
                padding: "0.6rem 1.5rem", borderRadius: "9999px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                background: activeTreatment === i ? "var(--color-crimson)" : "white",
                color: activeTreatment === i ? "white" : "var(--color-crimson)",
                border: "2px solid var(--color-crimson)",
                letterSpacing: "0.05em",
              }}>
                {t.tab}
              </button>
            ))}
          </div>
          <div style={{ background: "white", border: "2px solid #e8d0d6", borderRadius: "1rem", padding: "2rem" }}>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {TREATMENTS[activeTreatment].items.map((item) => (
                <li key={item} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "var(--color-crimson)", flexShrink: 0, marginTop: "0.45rem" }} />
                  <span style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Excision callout */}
          <div style={{ background: "var(--color-amber)", borderRadius: "1rem", padding: "1.5rem 2rem", marginTop: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontSize: "2rem", flexShrink: 0 }}>⚡</span>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-crimson-dark)", fontWeight: 500 }}>
              <strong>Excision vs. Ablation:</strong> Excision removes lesions at the root and has significantly lower recurrence rates. Always ask your surgeon which technique they use.
            </p>
          </div>
        </div>
      </section>

      {/* TRACK YOUR SYMPTOMS — callout */}
      <section style={{ background: "var(--color-crimson)", padding: "4rem 0" }}>
        <div className="max-w-3xl mx-auto px-6 md:px-14 text-center">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(2.5rem,6vw,4rem)", color: "white", textTransform: "uppercase", lineHeight: 1, marginBottom: "1rem" }}>
            Track Before<br /><span style={{ color: "var(--color-amber)" }}>You Attend</span>
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.8)", maxWidth: "480px", margin: "0 auto 2rem" }}>
            Log these for 2+ cycles before your appointment. Patterns give your clinician far more than memory alone — and make it harder for symptoms to be dismissed.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {["Pain score & location", "Bleeding volume", "Bowel & bladder notes", "Medication taken", "Sleep quality", "Energy level"].map((t) => (
              <span key={t} style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: "0.8rem", fontWeight: 600, padding: "0.5rem 1.1rem", borderRadius: "9999px", letterSpacing: "0.03em" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section id="support" style={{ background: "var(--color-charcoal)", padding: "5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14 grid md:grid-cols-2 gap-12">
          <div>
            <p style={{ color: "var(--color-amber)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>You are not alone</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem,5vw,3.5rem)", color: "white", textTransform: "uppercase", lineHeight: 1, marginBottom: "1.5rem" }}>
              Find Your Support
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>
              Endometriosis is isolating — especially when others minimise the pain. Finding your community provides emotional grounding and practical strategies from people who truly get it.
            </p>
            <div style={{ background: "var(--color-crimson)", borderRadius: "1rem", padding: "1.5rem 2rem" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "white", textTransform: "uppercase", marginBottom: "0.75rem" }}>Finding a specialist</h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "var(--color-blush)" }}>
                Look for a gynaecologist who performs <strong style={{ color: "var(--color-amber)" }}>excision surgery</strong>. Use Nancy's Nook or iCareBetter to find vetted specialists near you. Always seek more than one opinion.
              </p>
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--color-blush)", textTransform: "uppercase", marginBottom: "1rem", letterSpacing: "0.1em" }}>Trusted Resources</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {RESOURCES.map((r) => (
                <li key={r.name}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", alignItems: "center", gap: "0.875rem", padding: "1rem 1.25rem", borderRadius: "0.875rem", textDecoration: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,168,32,0.15)"; e.currentTarget.style.borderColor = "rgba(245,168,32,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  >
                    <span style={{ color: "var(--color-amber)", fontWeight: 700 }}>→</span>
                    <span style={{ fontSize: "0.875rem", color: "white", fontWeight: 500 }}>{r.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--color-crimson-dark)", padding: "2rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--color-blush)", letterSpacing: "0.05em" }}>HER MATTERS</span>
          <p style={{ fontSize: "0.75rem", color: "rgba(234,160,176,0.6)", maxWidth: "400px" }}>
            Educational information only — not a substitute for professional medical advice. Content informed by WHO, ASRM, and Endometriosis Foundation of America guidelines.
          </p>
        </div>
      </footer>
    </div>
  );
}
