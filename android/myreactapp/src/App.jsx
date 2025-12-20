// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import VidStreemDashboard from "./movies";
import UploadVideo from "./UploadVideo.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<VidStreemDashboard />} />
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/uploadvideo" element={<UploadVideo/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
