// frontend/src/pages/Admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalDonations: 0,
    totalUsers: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = 'https://ngo-website-wzab.onrender.com/api';

  useEffect(() => {
    fetchRealData();
    const email = localStorage.getItem('adminEmail');
    if (email) {
      setAdminName(email.split('@')[0]);
    }
  }, []);

  const fetchRealData = async () => {
  setLoading(true);
  try {
    // ✅ Changed: fetch videos from /posts (not /videos)
    const [postsRes, donationsRes, usersRes] = await Promise.allSettled([
      axios.get(`${API_BASE}/posts`),      // ← this is the only change
      axios.get(`${API_BASE}/donations`),
      axios.get(`${API_BASE}/users`)
    ]);

    const totalVideos = postsRes.status === 'fulfilled' ? postsRes.value.data.length : 0;

    // Donations (unchanged)
    let totalDonations = 0;
    if (donationsRes.status === 'fulfilled') {
      const donationsData = donationsRes.value.data;
      if (Array.isArray(donationsData)) {
        totalDonations = donationsData.reduce((sum, d) => sum + (d.amount || 0), 0);
      } else if (donationsData.totalAmount) {
        totalDonations = donationsData.totalAmount;
      } else if (typeof donationsData === 'number') {
        totalDonations = donationsData;
      }
    }

    // Users (unchanged)
    const totalUsers = usersRes.status === 'fulfilled' ? usersRes.value.data.length : 0;

    setStats({ totalVideos, totalDonations, totalUsers });

    // Recent activities (unchanged)
    const [recentRegs, recentDonations] = await Promise.allSettled([
      axios.get(`${API_BASE}/registrations?limit=3`),
      axios.get(`${API_BASE}/donations/recent?limit=2`)
    ]);

    const activities = [];
    if (recentRegs.status === 'fulfilled' && recentRegs.value.data.length) {
      recentRegs.value.data.slice(0, 3).forEach(reg => {
        activities.push({
          id: reg._id,
          action: `New registration for ${reg.eventTitle}`,
          time: new Date(reg.registeredAt).toLocaleString(),
          icon: '📝'
        });
      });
    }
    if (recentDonations.status === 'fulfilled' && recentDonations.value.data.length) {
      recentDonations.value.data.slice(0, 2).forEach(don => {
        activities.push({
          id: don._id,
          action: `Donation of $${don.amount} received`,
          time: new Date(don.createdAt).toLocaleString(),
          icon: '💰'
        });
      });
    }
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    setRecentActivities(activities.slice(0, 5));
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Sidebar with scroll */ }
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-icon">📹</div>
            <h3>NGO Admin</h3>
            <p>Video Management</p>
          </div>
          <div className="sidebar-nav-wrapper">
            <nav className="sidebar-nav">
              <Link to="/admin/dashboard" className="sidebar-nav-item active">
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </Link>
              <Link to="/admin/videos" className="sidebar-nav-item">
                <span className="nav-icon">🎬</span>
                <span>All Videos</span>
              </Link>
              <Link to="/admin/upload" className="sidebar-nav-item">
                <span className="nav-icon">📤</span>
                <span>Upload Video</span>
              </Link>
              <Link to="/admin/upload-image" className="sidebar-nav-item">
                <span className="nav-icon">🖼️</span>
                <span>Upload Image</span>
              </Link>
              <Link to="/admin/manage-images" className="sidebar-nav-item">
                <span className="nav-icon">🖼️</span>
                <span>Manage Images</span>
              </Link>
              <Link to="/admin/participants" className="sidebar-nav-item">
                <span className="nav-icon">📋</span>
                <span>Participants</span>
              </Link>
              <Link to="/admin/manage-programs" className="sidebar-nav-item">
                <span className="nav-icon">📋</span>
                <span>Manage Programs</span>
              </Link>
              <Link to="/admin/certificate" className="sidebar-nav-item">
                <span className="nav-icon">📜</span>
                <span>Certificate</span>
              </Link>
              <Link to="/admin/donations" className="sidebar-nav-item">
                <span className="nav-icon">💝</span>
                <span>Donations</span>
              </Link>
              <Link to="/admin/users" className="sidebar-nav-item">
                <span className="nav-icon">👥</span>
                <span>Users</span>
              </Link>
            </nav>
          </div>
          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content-area">
          <div className="top-navbar">
            <div className="page-title">
              <h1>Dashboard</h1>
              <p>Welcome back, {adminName}!</p>
            </div>
            <div className="user-actions">
              <div className="notification-icon">
                <span>🔔</span>
                <span className="notification-badge">3</span>
              </div>
              <div className="user-avatar">
                {adminName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading dashboard data...</div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🎥</div>
                  <div className="stat-value">{stats.totalVideos}</div>
                  <div className="stat-label">Total Videos</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">${stats.totalDonations.toLocaleString()}</div>
                  <div className="stat-label">Total Donations</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">Active Users</div>
                </div>
              </div>

              <div className="recent-section">
                <div className="section-header">
                  <h2>Recent Activity</h2>
                  <Link to="/admin/activity" className="view-all-link">View All →</Link>
                </div>
                <div className="activity-list">
                  {recentActivities.length === 0 ? (
                    <div className="activity-item">No recent activity</div>
                  ) : (
                    recentActivities.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">{activity.icon}</div>
                        <div className="activity-details">
                          <div className="activity-title">{activity.action}</div>
                          <div className="activity-time">{activity.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="quick-actions">
                <Link to="/admin/upload" className="action-btn primary">
                  📤 Upload New Video
                </Link>
                <Link to="/admin/videos" className="action-btn secondary">
                  ✏️ Manage Videos
                </Link>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}