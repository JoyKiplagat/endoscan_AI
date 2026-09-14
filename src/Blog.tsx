import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

export const BLOG_POSTS = [
  {
    id: "diagnostic-timelines",
    numericId: 1,
    title: "Navigating Chronic Pelvic Pain: Diagnostic Timelines & Medical Advocacy",
    category: "Advocacy & Health",
    readTime: "6 min read",
    date: "May 14, 2024",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    excerpt: "Why does an endometriosis diagnosis take 7 to 10 years on average? Learn how to track your symptom history to present compelling data to your care team.",
    content: `
      Endometriosis diagnosis delays remain one of the most significant hurdles in women's healthcare. 
      Patients frequently face invalidation, with symptoms often brushed off as standard menstrual cramping. 
      
      To bridge this gap, structured diagnostic tracking is critical. Documenting symptom severity on a 
      0–10 scale alongside your menstrual timing provides clinical evidence that cannot be easily dismissed. 
      When speaking to a specialist, request a differential diagnosis and inquire directly about referral pathways 
      to minimally invasive gynecologic surgeons skilled in laparoscopic excision.
    `,
  },
  {
    id: "excision-vs-ablation",
    numericId: 2,
    title: "Laparoscopic Excision vs. Ablation: Understanding the Gold Standard",
    category: "Surgical Pathways",
    readTime: "8 min read",
    date: "June 02, 2024",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    excerpt: "Surgical approaches significantly impact long-term recurrence rates. Discover why excision of deep lesions provides superior long-term pain relief.",
    content: `
      When conservative hormonal therapies fail to control pain, surgical intervention often becomes necessary. 
      However, not all surgical approaches are equal.
      
      Ablation uses heat or laser energy to burn the superficial layer of endo implants, often leaving behind the deep root tissue. 
      Excision, considered the gold standard, works like removing a weed by its roots—cutting away the full depth of the lesion 
      from healthy pelvic tissue. Comparative studies indicate that excision drastically reduces long-term recurrence and symptomatic relief failure.
    `,
  },
  {
    id: "gut-pelvic-axis",
    numericId: 3,
    title: "Anti-Inflammatory Nutrition & Gut-Pelvic Axis Management",
    category: "Lifestyle & Coping",
    readTime: "5 min read",
    date: "June 22, 2024",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    excerpt: "Managing systemic inflammation through key dietary adjustments, pelvic physiotherapy, and targeted supplements for flare reduction.",
    content: `
      Endometriosis is a systemic inflammatory disease, meaning pelvic lesions can spark response loops throughout 
      the entire body—frequently impacting gastrointestinal health (often misdiagnosed as IBS).
      
      Implementing an anti-inflammatory diet rich in Omega-3 fatty acids, leafy greens, and fiber helps clear excess estrogen metabolites 
      and lower prostaglandin levels. Pair diet adjustments with specialized pelvic floor physical therapy to unlearn hypertonic muscle 
      clenching caused by chronic pain cycles.
    `,
  },
];

// EMBEDDABLE SECTION FOR HOME PAGE
export function BlogSection() {
  const [selectedPost, setSelectedPost] = useState<string | number | null>(null);

  return (
    <section id="blog" style={{ background: "var(--color-offwhite)", padding: "5rem 0" }}>
      <div className="max-w-5xl mx-auto px-6 md:px-14">
        
        {/* Header */}
        <div className="mb-12">
          <p style={{ color: "var(--color-crimson)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Insights & Research
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 200, fontSize: "clamp(2.5rem,3vw,3.5rem)", color: "var(--color-crimson)", textTransform: "uppercase", lineHeight: 1 }}>
            Educational Journal
          </h2>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article 
              key={post.id}
              style={{ background: "white", borderRadius: "1rem", overflow: "hidden", border: "1px solid #e8d0d6" }}
              className="flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Picture Frame */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: "var(--color-crimson)", color: "white", fontSize: "0.7rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "9999px", textTransform: "uppercase" }}>
                  {post.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--color-charcoal)", fontWeight: 600, lineHeight: 1.3, marginBottom: "0.75rem" }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <button
                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                    style={{ color: "var(--color-crimson)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}
                    className="inline-flex items-center gap-1 hover:underline text-left"
                  >
                    {selectedPost === post.id ? "Close Preview ↑" : "Quick Read ↓"}
                  </button>
                  <Link
                    to={`/blog/${post.id}`}
                    style={{ color: "var(--color-amber)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}
                    className="hover:underline"
                  >
                    Full Article Page →
                  </Link>
                </div>
              </div>

              {/* Expandable Preview */}
              {selectedPost === post.id && (
                <div style={{ background: "#faf0f2", padding: "1.5rem", borderTop: "1px solid #e8d0d6" }}>
                  <p style={{ fontSize: "0.9rem", lineHeight: 1.75, color: "var(--color-charcoal)" }}>
                    {post.content}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

// FULL PAGE LIST ROUTE (/blog)
export function BlogPage() {
  return (
    <div style={{ background: "var(--color-offwhite)", color: "var(--color-charcoal)", minHeight: "100vh" }}>
      <div style={{ background: "var(--color-crimson)", padding: "4rem 0 3rem" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <Link to="/" style={{ color: "var(--color-amber)", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", textTransform: "uppercase" }}>
            ← Back to Home
          </Link>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 4vw, 4rem)", color: "white", marginTop: "1rem" }}>
            HER MATTERS BLOG
          </h1>
          <p style={{ color: "var(--color-blush)", fontSize: "1.1rem", maxWidth: "600px" }}>
            Evidence-based guides, surgical breakdowns, and symptom management strategies.
          </p>
        </div>
      </div>
      <BlogSection />
    </div>
  );
}

// SINGLE POST ROUTE (/blog/:id)
export function BlogPostDetail() {
  const { id } = useParams<{ id: string }>();
  const post = BLOG_POSTS.find((p) => p.id === id || String(p.numericId) === id);

  if (!post) {
    return (
      <div className="p-16 text-center" style={{ minHeight: "100vh", background: "var(--color-offwhite)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--color-crimson)" }}>Article not found</h2>
        <Link to="/blog" style={{ color: "var(--color-amber)", fontWeight: 700, marginTop: "1rem", display: "inline-block" }}>
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-offwhite)", minHeight: "100vh", paddingBottom: "5rem" }}>
      <div style={{ background: "var(--color-crimson)", padding: "3rem 0" }}>
        <div className="max-w-3xl mx-auto px-6">
          <Link to="/#blog" style={{ color: "var(--color-amber)", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", textTransform: "uppercase" }}>
            ← Back to Home
          </Link>
          <span className="block mt-4" style={{ color: "var(--color-blush)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
            {post.category} • {post.readTime}
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "white", marginTop: "0.5rem" }}>
            {post.title}
          </h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 mt-8">
        <img src={post.image} alt={post.title} className="w-full h-80 object-cover rounded-2xl shadow-md mb-8" />
        <div style={{ background: "white", padding: "2.5rem", borderRadius: "1.5rem", border: "1px solid #e8d0d6", lineHeight: 1.8 }}>
          {post.content.split("\n\n").map((paragraph, index) => (
            <p key={index} style={{ marginBottom: "1.25rem", color: "var(--color-charcoal)" }}>
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}