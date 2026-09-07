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
  { title: "Heat therapy", icon: "🔥", body: "A heating pad for 15–20 min relaxes uterine muscles and cuts cramping. One of the simplest and most effective tools." },
  { title: "Anti-inflammatory diet", icon: "🥗", body: "More oily fish, greens, and fibre. Less processed food and alcohol. Reducing inflammation systemically can ease symptoms." },
  { title: "Gentle movement", icon: "🧘‍♀️", body: "Yoga, swimming, and walking ease pain and lift mood. Skip high-intensity sessions during flares." },
  { title: "Pelvic physiotherapy", icon: "🩺", body: "A specialist physio can relieve the muscle tension that amplifies endometriosis pain — often overlooked and highly effective." },
  { title: "Symptom tracking", icon: "📅", body: "Log pain (0–10), location, diet, and cycle for 2+ cycles. Patterns emerge and your clinician gets better data." },
  { title: "Community support", icon: "💬", body: "Connecting with others who understand — online or in-person — reduces isolation and surfaces practical strategies." },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for mobile toggle

  const links = [
    { label: 'Home', href: '#Home' }, 
    { label: 'About', href: '#about' },                
    // { label: 'Stages', href: '#stages' },
    { label: 'Questionnaire', href: "/questionnaire" }, 
    { label: 'Screening', href: "/upload-docs" }, 
    { label: 'Support', href: '#support' },
    { label: 'Sign In', href: '/auth' }
  ];
  
  return (
    <div style={{ background: "var(--color-offwhite)", color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}>
      
      {/* NAVIGATION */}
      <nav 
        style={{ background: 'var(--color-crimson)' }} 
        className="sticky top-0 z-50 px-6 md:px-14 py-4 border-b border-[rgba(255,255,255,0.1)] shadow-md transition-all duration-300"
      >
        {/* Main row layout */}
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-blush)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.05em' }}> 
            HER MATTERS 
          </span> 
          
          {/* DESKTOP LINKS (Hidden on screens below 768px wide) */}
          <div className="hidden md:flex gap-8 justify-end"> 
            {links.map((l) => ( 
              <a 
                key={l.label} 
                href={l.href} 
                style={{ color: 'rgba(234,160,176,0.8)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s ease' }} 
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-blush)')} 
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(234,160,176,0.8)')} 
              >
                {l.label}
              </a> 
            ))} 
          </div> 

          {/* TOGGLE BUTTON (Visible only on mobile/tablet) */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden flex items-center justify-center p-2 focus:outline-none transition-colors duration-200"
            style={{ color: 'var(--color-blush)' }}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              /* Close Icon (X) */
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger Icon (☰) */
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* MOBILE & TABLET DROPDOWN (Toggles open/closed smoothly) */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-4 pb-2 border-t border-[rgba(255,255,255,0.1)] pt-4">
            {links.map((l) => ( 
              <a 
                key={l.label} 
                href={l.href} 
                onClick={() => setIsMenuOpen(false)} // Auto-closes panel when nav item is pressed
                style={{ color: 'rgba(234,160,176,0.8)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }} 
                className="hover:text-[var(--color-blush)] transition-colors duration-200"
              >
                {l.label}
              </a> 
            ))} 
          </div>
        </div>
      </nav>
      
      {/* HERO SECTION (FORMER ABOUT SECTION) */}
      <section id="Home" className="relative overflow-hidden min-h-[90vh] flex flex-col lg:flex-row items-stretch" style={{ background: "var(--color-crimson)" }}>
        {/* Background visual blur anchor */}
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "500px", height: "300px", borderRadius: "50%", background: "rgba(245,168,32,0.08)", filter: "blur(80px)", pointerEvents: "none" }} />
        
        {/* Left Column — High Impact Value Proposition */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center px-8 md:px-16 py-16 z-10">
          <p style={{ color: "var(--color-amber)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
            
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2.8rem, 3.5vw, 5.5rem)", lineHeight: 0.95, color: "white", marginBottom: "1.5rem", textTransform: "uppercase" }}>
            Am I Safe, Or Should I <br />
            <span style={{ color: "var(--color-blush)" }}>See a Doctor?</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.1rem", lineHeight: 1.8, maxWidth: "580px", marginBottom: "1.5rem" }}>
            Endometriosis symptoms vary drastically from person to person, causing diagnosis to take an average of <strong style={{ color: "var(--color-amber)" }}>7–10 years</strong>. Recognizing your patterns early saves years of silent frustration.
          </p>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.8, maxWidth: "580px", marginBottom: "1.5rem" }}>
            Our data-backed screening questionnaire evaluates your cycle signals, pain levels, and lifestyle markers against verified clinical indicators to map out your health path.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="/questionnaire" 
              style={{ 
                background: "var(--color-amber)", 
                color: "var(--color-crimson-dark)", 
                fontWeight: 600, 
                fontSize: "1rem", 
                padding: "1.1rem 1.0rem", 
                borderRadius: "9999px", 
                textDecoration: "none", 
                letterSpacing: "0.04em",
                boxShadow: "0 4px 14px rgba(245,168,32,0.3)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(245,168,32,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(245,168,32,0.3)";
              }}
            >
              Start screening questionnaire →
            </a>
            <a 
              href="#about" 
              style={{ 
                border: "2px solid var(--color-blush)", 
                color: "var(--color-blush)", 
                fontWeight: 600, 
                fontSize: "1rem", 
                padding: "1.1rem 1.6rem", 
                borderRadius: "9999px", 
                textDecoration: "none", 
                letterSpacing: "0.03em",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(234,160,176,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              Learn about Endometriosis
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex gap-8 mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            {[["1 in 10", "assigned female at birth"], ["7–10 yrs", "average diagnosis delay"], ["#2", "cause of infertility"]].map(([val, label]) => (
              <div key={label}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: "var(--color-amber)", marginBottom: "0.25rem" }}>{val}</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.2, maxWidth: "100px" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column — Cards & Diagnostic Intake */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center px-6 md:px-12 py-16 bg-[rgba(0,0,0,0.15)] z-10 gap-4">
          {/* Trust Reassurance Cards */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1.5rem", padding: "1.1rem" }} className="flex flex-col gap-5">
            <div className="flex gap-4 items-start">
              {/* <span className="p-2 rounded-xl flex-shrink-0" style={{ background: "rgba(245,168,32,0.1)" }}>
                <svg width="20" height="20" fill="var(--color-amber)" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              </span> */}
              <div>
                <h4 style={{ color: "white", fontWeight: 200, fontSize: "1.05rem", marginBottom: "0.15rem" }}>100% Private & Confidential</h4>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", lineHeight: 1.4 }}>Your health metrics are processed anonymously without credentials.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              {/* <span className="p-2 rounded-xl flex-shrink-0" style={{ background: "rgba(245,168,32,0.1)" }}>
                <svg width="20" height="20" fill="var(--color-amber)" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.71L11 12.41V7h2v4.59l3.71 3.71-1.42 1.41z"/></svg>
              </span> */}
              <div>
                <h4 style={{ color: "white", fontWeight: 200, fontSize: "1.05rem", marginBottom: "0.15rem" }}>Quick Assessment</h4>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", lineHeight: 1.4 }}>Takes less than 3 minutes to crosscheck critical clinical benchmarks.</p>
              </div>
            </div>

            <div  className="flex gap-4 items-start">
              {/* <span className="p-2 rounded-xl flex-shrink-0" style={{ background: "rgba(245,168,32,0.1)" }}>
                <svg width="20" height="20" fill="var(--color-amber)" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
              </span> */}
              <div>
                <h4 style={{ color: "white", fontWeight: 200, fontSize: "1.05rem", marginBottom: "0.15rem" }}>Actionable Reports</h4>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", lineHeight: 1.4 }}>Receive a customized validator summary log to present directly to your physician.</p>
              </div>
            </div>
          </div>

          {/* Secure Document Intake Panel */}
          <div  style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "1.5rem", padding: "1.5rem 1.75rem" }}>
            <div  className="flex items-center justify-between mb-2">
              <h4 style={{ color: "white", fontSize: "1rem", fontWeight: 400 }}>Already have imaging reports?</h4>
              <span style={{ color: "var(--color-amber)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(245,168,32,0.15)", padding: "0.25rem 0.5rem", borderRadius: "0.25rem" }}>Optional</span>
            </div>
            <p  style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
              Upload your ultrasound scans or pelvic MRI records so our system can read them and explain your results in simple language.
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
      </section>

      {/* WHAT IS IT CONTEXT SECTION */}
      <section id="about" style={{ background: "var(--color-offwhite)", padding: "5rem 0" }}>
        <div className=" max-w-5xl mx-auto px-6 md:px-14 grid md:grid-cols-2 gap-12 items-stretch">
          <div>
            {/* <p style={{ color: "var(--color-crimson)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>The Medical Context</p> */}
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2.2rem,3vw,3.2rem)", lineHeight: 1.05, color: "var(--color-crimson)", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Tissue that grows where it shouldn't
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--color-charcoal)", marginBottom: "1rem" }}>
              Endometriosis is a chronic inflammatory condition where tissue <em>similar</em> to the uterine lining grows outside the uterus — on ovaries, fallopian tubes, and the pelvic lining.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--color-charcoal)", marginBottom: "1.5rem" }}>
              Each month it swells and bleeds with your cycle — but unlike the uterine lining, it has nowhere to go. This leaves behind persistent inflammation, scar tissue (adhesions), and deep lesions.
            </p>
            <div style={{ background: "var(--color-crimson)", color: "white", borderRadius: "1rem", padding: "1.25rem 1.5rem", display: "inline-flex", gap: "1rem", alignItems: "flex-start" }}>
              <span className="mt-1"></span>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>
                <strong style={{ color: "var(--color-amber)" }}>Pain severity ≠ disease severity.</strong> You can have Stage IV disease with minor pain, or Stage I with debilitating pain. Never let your lived tracking metrics be dismissed.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src={flowerImg}
              alt="Women's health awareness — red flower"
              className="w-full rounded-2xl object-cover shadow-xl"
              style={{ aspectRatio: "4/5", filter: "saturate(0.95)" }}
            />
            <div style={{ position: "absolute", bottom: "-1rem", left: "-1rem", background: "var(--color-amber)", borderRadius: "1rem", padding: "1rem 1.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--color-crimson-dark)", lineHeight: 1.1 }}>Chronic.<br />Manageable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SYMPTOMS MARKEY */}
      <section id="symptoms" style={{ background: "var(--color-crimson)", padding: "2rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <div className="mb-12">
            {/* <p style={{ color: "var(--color-amber)", fontSize: "0.75rem", fontWeight: 400, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Recognise the signs</p> */}
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 200, fontSize: "clamp(2.3rem,3vw,3.3rem)", color: "white", textTransform: "uppercase", lineHeight: 1 }}>
              Common Symptoms
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SYMPTOMS.map((s, i) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "1.75rem", transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,168,32,0.12)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                {/* <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2rem", color: "var(--color-amber)", display: "block", marginBottom: "0.5rem" }}>
                  0{i + 1}
                </span> */}
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 100, fontSize: "1.2rem", color: "white", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.02em" }}>{s.label}</h3>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "rgba(234,160,176,0.9)" }}>{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAGES CONTAINER */}
      <section id="stages" style={{ background: "var(--color-offwhite)", padding: "5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 200, fontSize: "clamp(2.5rem,3vw,3.5rem)", color: "var(--color-crimson)", textTransform: "uppercase", lineHeight: 1, marginBottom: "2.5rem" }}>
            The Four Stages
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {STAGES.map((s, i) => (
              <button key={s.num} onClick={() => setActiveStage(i)} style={{
                background: activeStage === i ? "var(--color-crimson)" : "white",
                border: activeStage === i ? "2px solid var(--color-crimson)" : "2px solid #e0d0d4",
                borderRadius: "0.875rem", padding: "1.25rem", textAlign: "left", cursor: "pointer", transition: "all 0.2s"
              }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "2rem", color: activeStage === i ? "var(--color-amber)" : "var(--color-crimson)", lineHeight: 1 }}>Stage {s.num}</p>
                <p style={{ fontSize: "0.8rem", fontWeight: 400, color: activeStage === i ? "var(--color-blush)" : "var(--color-crimson)", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.name}</p>
              </button>
            ))}
          </div>
          <div style={{ background: "var(--color-crimson)", borderRadius: "1rem", padding: "2rem", boxShadow: "0 10px 30px rgba(124,26,53,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.45rem", color: "white", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Stage {STAGES[activeStage].num} — {STAGES[activeStage].name}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--color-blush)" }}>{STAGES[activeStage].desc}</p>
          </div>
        </div>
      </section>

      {/* COPING STRATEGIES */}
      <section id="coping" style={{ background: "var(--color-charcoal)", padding: "5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          {/* <p style={{ color: "var(--color-amber)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Daily management</p> */}
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 200, fontSize: "clamp(2.5rem,3vw,3.5rem)", color: "white", textTransform: "uppercase", lineHeight: 1, marginBottom: "2.5rem" }}>
            Coping Strategies
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {COPING.map((c, i) => (
              <div key={c.title} style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                <button onClick={() => setOpenCoping(openCoping === i ? null : i)} className="w-full flex items-center gap-4 p-5 text-left" style={{ background: openCoping === i ? "var(--color-crimson)" : "rgba(255,255,255,0.03)", transition: "background 0.2s" }}>
                  {/* <span style={{ fontSize: "1.5rem", flexShrink: 0 }}></span> */}
                  <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.1rem", color: "white", textTransform: "uppercase" }}>{c.title}</span>
                  <span style={{ color: "var(--color-amber)", fontWeight: 700, fontSize: "1.25rem" }}>{openCoping === i ? "−" : "+"}</span>
                </button>
                {openCoping === i && (
                  <div style={{ background: "rgba(124,26,53,0.2)", padding: "1.25rem 1.5rem" }}>
                    <p style={{ fontSize: "0.9rem", lineHeight: 1.75, color: "rgba(255,255,255,0.8)" }}>{c.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEDICAL TREATMENTS */}
      <section id="treatment" style={{ background: "var(--color-offwhite)", padding: "5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <p style={{ color: "var(--color-crimson)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Medical options</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 200, fontSize: "clamp(2.5rem,3vw,3.5rem)", color: "var(--color-crimson)", textTransform: "uppercase", lineHeight: 1, marginBottom: "2rem" }}>
            Treatment Pathways
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, maxWidth: "560px", marginBottom: "2rem", color: "var(--color-charcoal)" }}>
            No single treatment fits everyone. The approach relies on your unique metrics, lifecycle timelines, and systemic updates. <strong style={{ color: "var(--color-crimson)" }}>Ask about surgical excision pathways</strong> — it returns far better long-term clinical control.
          </p>
          
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
          <div style={{ background: "var(--color-amber)", borderRadius: "1rem", padding: "1.5rem 2rem", marginTop: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            {/* <span>⚡</span> */}
            <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-crimson-dark)", fontWeight: 500 }}>
              <strong>Excision vs. Ablation:</strong> Excision completely cuts out deep lesions from the root rather than burning the surface layer. Always query your care provider regarding structural choices.
            </p>
          </div>
        </div>
      </section>

      {/* CLOSING METRICS BANNER */}
      <section style={{ background: "var(--color-crimson)", padding: "4rem 0" }}>
        <div className="max-w-3xl mx-auto px-6 md:px-14 text-center">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(2.5rem,4vw,4rem)", color: "white", textTransform: "uppercase", lineHeight: 1, marginBottom: "1rem" }}>
            Track Before<br /><span style={{ color: "var(--color-amber)" }}>You Attend</span>
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.8)", maxWidth: "480px", margin: "0 auto 2rem" }}>
            Log symptoms consistently across 2+ monthly cycles. Structured baseline timelines help clinical networks implement your protocols without delay.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {["Pain score & location", "Bleeding volume", "Bowel & bladder notes", "Medication taken", "Sleep quality", "Energy level"].map((t) => (
              <span key={t} style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: "0.8rem", fontWeight: 600, padding: "0.5rem 1.1rem", borderRadius: "9999px", letterSpacing: "0.03em" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORT AND NETWORKS */}
      <section id="support" style={{ background: "var(--color-charcoal)", padding: "5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14 grid md:grid-cols-2 gap-12">
          <div>
            <p style={{ color: "var(--color-amber)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>You are not alone</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem,3vw,3.5rem)", color: "white", textTransform: "uppercase", lineHeight: 1, marginBottom: "1.5rem" }}>
              Find Your Support
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>
              Endometriosis is complex — community resource mapping provides foundational support alongside verified peer tracking feedback.
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
                    display: "flex", alignItems: "center", gap: "0.875rem", padding: "1rem 1.25rem", borderRadius: "0.875rem", textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.2s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,168,32,0.12)"; e.currentTarget.style.borderColor = "rgba(245,168,32,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
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
