import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthProps {
  onBackToHome: () => void;
}

type AuthMode = "login" | "register" | "forgotPassword";

export default function Auth({ onBackToHome }: AuthProps) {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    endometriosisStage: "", 
    password: "",
    confirmPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    agreeTerms: false,
  });
  const [scanFile, setScanFile] = useState<FileList | null>(null);

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
    if (e.target.files && e.target.files.length > 0) {
      setScanFile(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === "login") {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/patients/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert("Logged in successfully!");
          
          localStorage.setItem("userToken", data.access);
          localStorage.setItem("refreshToken", data.refresh);
          localStorage.setItem("patientId", data.id);
          localStorage.setItem("patientName", data.name);
          localStorage.setItem("patientStage", data.endometriosis_stage);
          localStorage.setItem("patientLocation", data.location);
          localStorage.setItem("patientDiagnosisDate", data.diagnosis_date || "N/A");

          navigate("/dashboard");
        } else {
          const errorData = await response.json();
          alert(`Login failed: ${errorData.error || "Invalid credentials"}`);
        }
      } catch (error) {
        console.error("Connection error:", error);
        alert("Could not connect to the backend server.");
      }
    } else if (authMode === "forgotPassword") {
      if (formData.newPassword !== formData.confirmNewPassword) {
        alert("New passwords do not match!");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/patients/forgot-password/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            new_password: formData.newPassword,
          }),
        });

        if (response.ok) {
          alert("Password successfully reset! Please log in with your new password.");
          setAuthMode("login");
          setFormData((prev) => ({ ...prev, password: "", newPassword: "", confirmNewPassword: "" }));
        } else {
          const errorData = await response.json();
          alert(`Password reset failed: ${errorData.error || JSON.stringify(errorData)}`);
        }
      } catch (error) {
        console.error("Connection error:", error);
        alert("Could not connect to the backend server.");
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        const formPayload = new FormData();
        formPayload.append("name", formData.name);
        formPayload.append("email", formData.email);
        formPayload.append("password", formData.password);
        formPayload.append("location", formData.location);
        formPayload.append("endometriosis_stage", formData.endometriosisStage || "Not Diagnosed / Unsure");
        
        if (scanFile && scanFile.length > 0) {
          formPayload.append("scan_file", scanFile[0]);
        }

        const response = await fetch("http://127.0.0.1:8000/api/patients/register/", {
          method: "POST",
          body: formPayload,
        });

        if (response.ok) {
          const data = await response.json();
          alert("Account successfully created!");
          
          localStorage.setItem("userToken", data.access);
          localStorage.setItem("refreshToken", data.refresh);
          localStorage.setItem("patientId", data.id);
          localStorage.setItem("patientName", data.name);
          localStorage.setItem("patientStage", data.endometriosis_stage);
          localStorage.setItem("patientLocation", data.location);
          localStorage.setItem("patientDiagnosisDate", "N/A");

          navigate("/dashboard");
        } else {
          const errorData = await response.json();
          alert(`Registration failed: ${JSON.stringify(errorData)}`);
        }
      } catch (error) {
        console.error("Network connectivity issue:", error);
        alert("Could not connect to the backend server.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-offwhite)] px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white p-6 shadow-sm md:p-10">
        
        <button
          type="button"
          onClick={onBackToHome}
          className="mb-6 cursor-pointer border-none bg-none p-0 text-[0.95rem] font-semibold text-gray-500 hover:text-gray-700"
        >
          ← Back to Home
        </button>

        <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.15em] text-[var(--color-crimson)]">
          {authMode === "login" && "Welcome Back"}
          {authMode === "register" && "Secure Registration"}
          {authMode === "forgotPassword" && "Account Recovery"}
        </p>
        <h2 className="mb-6 font-[var(--font-display)] text-[2.25rem] font-extrabold uppercase text-[var(--color-crimson)]">
          {authMode === "login" && "Patient Login"}
          {authMode === "register" && "Create Profile"}
          {authMode === "forgotPassword" && "Reset Password"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {authMode === "register" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none"
                />
              </div>

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

              {/* <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Endometriosis Status</label>
                <select
                  name="endometriosisStage"
                  value={formData.endometriosisStage}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none appearance-none"
                >
                  <option value="" disabled hidden>Select your current status</option>
                  <option value="Not Diagnosed / Unsure">Not Diagnosed / Unsure</option>
                  <option value="Mild Management">Mild Management</option>
                  <option value="Moderate Symptoms">Moderate Symptoms</option>
                  <option value="Advanced / Severe">Advanced / Severe</option>
                </select>
              </div> */}

              {/* <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Upload Scan</label>
                <input
                  type="file"
                  name="scan"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:outline-none file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                />
              </div> */}

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
                  I agree to the encryption guidelines. My intake details are entirely anonymous.
                </span>
              </label>
            </>
          )}

          {authMode === "login" && (
            <>
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

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthMode("forgotPassword")}
                    className="text-xs font-semibold text-[var(--color-crimson)] hover:underline p-0 border-none bg-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
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

          {authMode === "forgotPassword" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Registered Email Address</label>
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

              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.85rem] font-semibold text-[var(--color-charcoal)]">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  required
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="rounded-lg border border-gray-200 px-4 py-3 text-[0.95rem] focus:border-gray-400 focus:outline-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="mt-4 w-full cursor-pointer rounded-lg bg-[var(--color-crimson)] py-3.5 text-center text-[0.95rem] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            {authMode === "login" && "Sign In"}
            {authMode === "register" && "Complete Secure Sign Up"}
            {authMode === "forgotPassword" && "Reset Password Parameters"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-100 pt-4 flex flex-col gap-2">
          {authMode !== "register" && (
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className="text-xs font-semibold text-[var(--color-crimson)] underline cursor-pointer bg-none border-none"
            >
              Don't have an account? Sign up here
            </button>
          )}
          {authMode !== "login" && (
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="text-xs font-semibold text-[var(--color-crimson)] underline cursor-pointer bg-none border-none"
            >
              Already have an account? Sign in instead
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
