import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";

// MainSite pages
import Layout from "./pages/MainSite/Layout";
import Home from "./pages/MainSite/Home";
import About from "./pages/MainSite/About";
import Programs from "./pages/MainSite/Programs";
import Gallery from "./pages/MainSite/Gallery";
import Volunteer from "./pages/MainSite/Volunteer";
import Contact from "./pages/MainSite/Contact";
import Participants from "./pages/Admin/Participants";

// Import global MainSite CSS (optional – each component imports its own)
// import "./pages/MainSite/MainSite.css"; // if you have one

// Admin pages (keep your existing imports)
import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import UploadVideo from "./pages/Admin/UploadVideo";
import DonationPage from "./pages/Admin/DonationPage";
import VideoPage from "./pages/Admin/VideoPage";
import UsersPage from "./pages/Admin/UserPage";
import CertificateGenerator from "./pages/Admin/CertificateGenerator";
import UploadImage from './pages/Admin/UploadImage';
import ManageImages from './pages/Admin/ManageImages';
import RegisterForEvent from "./pages/MainSite/RegisterForEvent";
import ManagePrograms from './pages/Admin/ManagePrograms';

function AdminRoute({ children }) {
  const isAuthenticated = localStorage.getItem("adminToken");
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <ParallaxProvider>
      <BrowserRouter>
        <Routes>
          {/* Public MainSite */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="register" element={<RegisterForEvent />} />
            <Route path="programs" element={<Programs />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="volunteer" element={<Volunteer />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          {/* Admin */}
          <Route path="/admin">
            <Route path="login" element={<Login />} />
            <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="upload" element={<AdminRoute><UploadVideo /></AdminRoute>} />
            <Route path="donations" element={<AdminRoute><DonationPage /></AdminRoute>} />
            <Route path="videos" element={<AdminRoute><VideoPage /></AdminRoute>} />
            <Route path="/admin/upload-image" element={<AdminRoute><UploadImage /></AdminRoute>} />
            <Route path="/admin/manage-images" element={<AdminRoute><ManageImages /></AdminRoute>} />
            <Route path="/admin/participants" element={<AdminRoute><Participants/> </AdminRoute>} />
            <Route path="/admin/manage-programs" element={<AdminRoute><ManagePrograms /></AdminRoute>} />

            <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
            <Route path="certificate" element={<AdminRoute><CertificateGenerator /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
   
            </Route>
        </Routes>
      </BrowserRouter>
    </ParallaxProvider>
  );
}

export default App;