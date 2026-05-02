// frontend/src/pages/MainSite/Layout.jsx
import { Link, Outlet } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout-container">
      <header className="main-header">
        <div className="header-inner">
          <Link to="/" className="logo">
            Ma Indrawti Devi Foundation
          </Link>
          <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/programs">Programs</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/volunteer">Volunteer</Link>
            <Link to="/contact">Contact</Link>
            {/*
              Admin button leads to login page.
              After successful login, user will be redirected to dashboard.
            */}
            <Link to="/admin/login" className="admin-btn">
              <FaUserShield /> Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="main-footer">
        <p>© 2025 Ma Indrawti Devi Nari Shakti Foundation | All Rights Reserved</p>
        <p>📍 Damodar Pana Mandhana, Bhiwani - 127032 | 📞 +91 12345 67890</p>
      </footer>
    </div>
  );
}