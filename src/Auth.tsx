import { useState } from "react";

interface AuthProps {
  onBackToHome: () => void;
}

export default function Auth({ onBackToHome }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    endometriosisStage: "", // Added state field for the dropdown selector
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [scanFile, setScanFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScanFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    alert(`${isLogin ? "Logged in" : "Account created"} successfully!`);
    onBackToHome();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-offwhite)] px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white p-6 shadow-sm md:p-10">
        
        {/* Navigation Return Hook */}
        <button
          onClick={onBackToHome}
          className="mb-6 cursor-pointer border-none bg-none p-0 text-[0.95rem] font-semibold text-gray-500 hover:text-gray-700"
        >
          ← Back to Home
        </button>

        <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.15em] text-[var(--color-crimson)]">
          {isLogin ? "Welcome Back" : "Secure Registration"}
        </p>
        <h2 className="mb-6 font-[var(--font-display)] text-[2.25rem] font-extrabold uppercase text-[var(--color-crimson)]">
          {isLogin ? "Patient Login" : "Create Profile"}
        </h2>

        {/* Auth Multi-Flow Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* =========================================================
              REGISTRATION FLOW FIELDS
             ========================================================= */}
          {!isLogin && (
            <>
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Full Name</label>
                <input
                  type="text"
                  name="name"
                  // required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country or Address"
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none"
                />
              </div>
              {/* Endometriosis Condition Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Endometriosis Status</label>
                <select
                  name="endometriosisStage"
                  required
                  value={formData.endometriosisStage}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none appearance-none"
                >
                  <option value="" disabled hidden>Select your current status</option>
                  <option value="unsure">Not Diagnosed / Unsure</option>
                  <option value="mild">Mild Management</option>
                  <option value="moderate">Moderate Symptoms</option>
                  <option value="severe">Advanced / Severe</option>
                </select>
              </div>

              {/* Upload Scan */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Upload Scan</label>
                <input
                  type="file"
                  name="scan"
                  required
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:outline-none file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none"
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none"
                />
              </div>

              {/* Privacy Checkbox */}
              <label className="mt-2 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  required
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 accent-[var(--color-crimson)]"
                />
                <span className="text-[0.8rem] leading-normal text-gray-500">
                  I agree to the encryption guidelines. My intake details are entirely anonymous until shared.
                </span>
              </label>
            </>
          )}

          {/* =========================================================
              LOGIN FLOW FIELDS
             ========================================================= */}
          {isLogin && (
            <>
              {/* Email Address */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none"
                />
              </div>
              
              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Action Trigger Button */}
          <button
            type="submit"
            className="mt-4 w-full cursor-pointer rounded-full border-none bg-[var(--color-crimson)] p-[0.85rem] text-[0.95rem] font-bold text-white transition-opacity hover:opacity-95"
          >
            {isLogin ? "Access Private Dashboard ➔" : "Establish Encrypted Account ➔"}
          </button>
        </form>

        {/* View Flow State Swapping Link */}
        <div className="mt-6 border-t border-gray-100 pt-4 text-center">
          <p className="text-[0.9rem] text-gray-500">
            {isLogin ? "New to Her Matters?" : "Already managing an assessment?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="cursor-pointer border-none bg-none p-0 text-[0.9rem] font-bold text-[var(--color-crimson)] underline"
            >
              {isLogin ? "Sign up here" : "Log in here"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
