import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Questionnaire from "./questionnaire";
import UploadDocs from "./UploadDocs";
import Auth from "./Auth"; // 👈 1. ADD THIS IMPORT

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questionnaire" element={<Questionnaire onBackToHome={() => window.location.href = "/"} />} />
        <Route path="/upload-docs" element={<UploadDocs onBackToHome={() => window.location.href = "/"} />} />
        
        {/* 👈 2. ADD THIS SECURE AUTH PATH LAYER */}
        <Route path="/auth" element={<Auth onBackToHome={() => window.location.href = "/"} />} />
      </Routes>
    </Router>
  );
}
