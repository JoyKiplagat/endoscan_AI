import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Questionnaire from "./questionnaire";
import UploadDocs from "./UploadDocs";
import Auth from "./Auth"; 
import ChatBox from "./ChatBox"; // 👈 1. Import your new ChatBox component
export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen"> {/* 👈 2. Wrap your app elements to give them viewport reference */}
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questionnaire" element={<Questionnaire onBackToHome={() => window.location.href = "/"} />} />
          <Route path="/upload-docs" element={<UploadDocs onBackToHome={() => window.location.href = "/"} />} />
          <Route path="/auth" element={<Auth onBackToHome={() => window.location.href = "/"} />} />
        </Routes>

        {/* 👈 3. Drop the ChatBox right here! It stays completely out of the routes and navbar */}
        <ChatBox />

      </div>
    </Router>
  );
}
