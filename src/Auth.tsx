import { useState } from "react";

interface AuthProps {
  onBackToHome: () => void;
}

export default function Auth({ onBackToHome }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    alert(`${isLogin ? "Logged in" : "Account created"} successfully as a private health profile!`);
    onBackToHome();
  };

  return (
    <div style={{ background: "var(--color-offwhite)", minHeight: "100vh", padding: "4rem 1rem" }} className="flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-[rgba(0,0,0,0.05)]">
        
        {/* Navigation Return Hook */}
        <button
          onClick={onBackToHome}
          style={{ background: "none", border: "none", color: "gray", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", marginBottom: "1.5rem", padding: 0 }}
        >
          ← Back to Home
        </button>

        <p style={{ color: "var(--color-crimson)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          {isLogin ? "Welcome Back" : "Secure Registration"}
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-crimson)", fontSize: "2.25rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "1.5rem" }}>
          {isLogin ? "Patient Login" : "Create Profile"}
        </h2>

        {/* Auth Multi-Flow Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Sign Up Specific Name Field */}
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-charcoal)" }}>Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", fontSize: "0.95rem" }}
              />
            </div>
          )}

          {/* Email Address Input */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-charcoal)" }}>Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", fontSize: "0.95rem" }}
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-charcoal)" }}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", fontSize: "0.95rem" }}
            />
          </div>

          {/* Sign Up Specific Confirm Password Field */}
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-charcoal)" }}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", fontSize: "0.95rem" }}
              />
            </div>
          )}

          {/* Sign Up Specific Privacy Checkbox */}
          {!isLogin && (
            <label className="flex items-start gap-3 mt-2 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                required
                checked={formData.agreeTerms}
                onChange={handleChange}
                style={{ accentColor: "var(--color-crimson)", marginTop: "0.2rem" }}
              />
              <span style={{ fontSize: "0.8rem", color: "gray", lineHeight: 1.4 }}>
                I agree to the encryption guidelines. My intake details are entirely anonymous until shared.
              </span>
            </label>
          )}

          {/* Action Trigger Button */}
          <button
            type="submit"
            style={{
              background: "var(--color-crimson)",
              color: "white",
              fontWeight: 700,
              padding: "0.85rem",
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.95rem",
              marginTop: "1rem"
            }}
          >
            {isLogin ? "Access Private Dashboard ➔" : "Establish Encrypted Account ➔"}
          </button>
        </form>

        {/* View Flow State Swapping Link */}
        <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f3f4f6", paddingTop: "1rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.9rem", color: "gray" }}>
            {isLogin ? "New to Her Matters?" : "Already managing an assessment?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: "none", border: "none", color: "var(--color-crimson)", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: "0.9rem", textDecoration: "underline" }}
            >
              {isLogin ? "Sign up here" : "Log in here"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
