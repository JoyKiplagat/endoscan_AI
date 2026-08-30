<nav style={{ background: "var(--color-crimson)" }} 
className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-14 py-4"> 
<span style={{ fontFamily: "var(--font-display)", color: "var(--color-blush)",
     fontSize: "1.5rem", fontWeight: 800, letterSpacing: "0.05em" }}> HER MATTERS </span> 
     <div className="hidden md:flex gap-8"> {["Home", "About", 
        "Stages", "Treatment", "Support"].map((l) =>
         ( <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "rgba(234,160,176,0.8)", 
         fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", 
         textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--color-blush)")} 
         onMouseLeave={e => (e.currentTarget.style.color = "rgba(234,160,176,0.8)")} >{l}</a> ))}
          </div> </nav>