import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./Authpage.jsx";
import DashboardLayout from "./DashboardLayout.jsx";
import VidStreemDashboard from "./Dashborad.jsx";
import UploadVideo from "./UploadVideo.jsx";
import CategoryManagement from "./CategoryManagement.jsx";
import UserManagement from "./UserManagement.jsx";
import VideoGallery from "./VideoGallery.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<Navigate to="/auth" replace />} />

                {/* Layout wrapper for all dashboard pages */}
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<VidStreemDashboard />} />
                    <Route path="/uploadvideo" element={<UploadVideo />} />
                    <Route path="/Categorys" element={<CategoryManagement />} />
                    <Route path="/UserManagement" element={<UserManagement />} />
                    <Route path="/Videos" element={<VideoGallery />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
