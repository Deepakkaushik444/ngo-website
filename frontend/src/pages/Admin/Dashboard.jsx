// frontend/src/pages/Admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalDonations: 0,
    totalUsers: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [adminName, setAdminName] = useState('Admin');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    const email = localStorage.getItem('adminEmail');
    if (email) {
      setAdminName(email.split('@')[0]);
    }
  }, []);

  const fetchDashboardData = () => {
    // Simulate API call – replace with real data later
    setTimeout(() => {
      setStats({
        totalVideos: 24,
        totalDonations: 12500,
        totalUsers: 342
      });
      setRecentActivities([
        { id: 1, action: 'New video uploaded', time: '2 minutes ago', icon: '🎥' },
        { id: 2, action: 'Donation received', time: '1 hour ago', icon: '💰' },
        { id: 3, action: 'New user registered', time: '3 hours ago', icon: '👤' },
        { id: 4, action: 'Video edited', time: '5 hours ago', icon: '✏️' }
      ]);
    }, 1000);
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
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-icon">📹</div>
            <h3>NGO Admin</h3>
            <p>Video Management</p>
          </div>
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
          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content-area">
          {/* Top Navbar */}
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

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎥</div>
              <div className="stat-value">{stats.totalVideos}</div>
              <div className="stat-label">Total Videos</div>
              <div className="stat-change positive">↑ 12%</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">${stats.totalDonations.toLocaleString()}</div>
              <div className="stat-label">Total Donations</div>
              <div className="stat-change positive">↑ 23%</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Active Users</div>
              <div className="stat-change positive">↑ 8%</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <Link to="/activity" className="view-all-link">View All →</Link>
            </div>
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-details">
                    <div className="activity-title">{activity.action}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <Link to="/admin/upload" className="action-btn primary">
              📤 Upload New Video
            </Link>
            <Link to="/admin/videos" className="action-btn secondary">
              ✏️ Manage Videos
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}