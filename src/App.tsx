// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./Home";
// import Questionnaire from "./questionnaire";
// import UploadDocs from "./UploadDocs";
// import Auth from "./Auth"; 
// import ChatBox from "./ChatBox"; // 👈 1. Import your new ChatBox component
// export default function App() {
//   return (
//     <Router>
//       <div className="relative min-h-screen"> {/* 👈 2. Wrap your app elements to give them viewport reference */}
        
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/questionnaire" element={<Questionnaire onBackToHome={() => window.location.href = "/"} />} />
//           <Route path="/upload-docs" element={<UploadDocs onBackToHome={() => window.location.href = "/"} />} />
//           <Route path="/auth" element={<Auth onBackToHome={() => window.location.href = "/"} />} />
//         </Routes>

//         {/* 👈 3. Drop the ChatBox right here! It stays completely out of the routes and navbar */}
//         <ChatBox />

//       </div>
//     </Router>
//   );
// }
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Questionnaire from "./questionnaire";
import Questionnaire1 from "./questionnaire1";
import UploadDocs from "./UploadDocs";
import Auth from "./Auth"; 
import ChatBox from "./ChatBox"; 
import PatientDashboard from "./dashboard";

// 1. A quick Protected Route component
// Replace this mock condition with your actual authentication logic later (e.g., checking localStorage or global context)
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("userToken");
  
  const isAuthenticated = token && token !== "null" && token !== "undefined";

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen"> 
        
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* 2. Dashboard is now secure. It can only be viewed if authenticated */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="/questionnaire" element={<Questionnaire onBackToHome={() => window.location.href = "/#Home"} />} />
          <Route path="/questionnaire1" element={<Questionnaire1 onBackToHome={() => window.location.href = "/dashboard"} />} />
          <Route path="/upload-docs" element={<UploadDocs onBackToHome={() => window.location.href = "/#Home"} />} />
          <Route path="/auth" element={<Auth onBackToHome={() => window.location.href = "/#Home"} />} />
        </Routes>

        <ChatBox />

      </div>
    </Router>
  );
}
