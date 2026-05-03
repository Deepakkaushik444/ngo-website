// pages/Admin/UsersPage.jsx
import { useState, useEffect } from "react";
import axios from 'axios';
import './UserPage.css';

const API_URL = 'https://ngo-website-wzab.onrender.com/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "volunteer",
    status: "active",
    phone: "",
    address: "",
    bio: ""
  });

  const itemsPerPage = 10;

  // Fetch users from database
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.role, filters.status]);

  // Adjust current page when filtered users change (e.g., after delete)
  useEffect(() => {
    const maxPage = Math.ceil(filteredUsers.length / itemsPerPage);
    if (maxPage > 0 && currentPage > maxPage) {
      setCurrentPage(maxPage);
    } else if (filteredUsers.length === 0) {
      setCurrentPage(1);
    }
  }, [filteredUsers, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`);
      // Transform database users to match frontend format
      const transformedUsers = response.data.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
        avatar: user.avatar || user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        avatarColor: user.avatarColor || getRandomColor(),
        joinDate: user.joinDate || new Date(),
        lastActive: user.lastActive || new Date()
      }));
      setUsers(transformedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast("Failed to load users", "error");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.phone.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.role !== "all") {
      filtered = filtered.filter(u => u.role === filters.role);
    }
    
    if (filters.status !== "all") {
      filtered = filtered.filter(u => u.status === filters.status);
    }
    
    setFilteredUsers(filtered);
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    if (!formData.email.includes('@')) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setAddLoading(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        phone: formData.phone || "",
        address: formData.address || "",
        bio: formData.bio || "",
        avatarColor: getRandomColor()
      };

      await axios.post(`${API_URL}/users`, userData);
      await fetchUsers();
      setShowAddModal(false);
      resetForm();
      showToast("User added successfully!", "success");
    } catch (error) {
      console.error("Error adding user:", error);
      if (error.response) {
        showToast(error.response.data?.message || `Server error (${error.response.status})`, "error");
      } else if (error.request) {
        showToast("Network error – could not reach server", "error");
      } else {
        showToast("Failed to add user", "error");
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser.name || !selectedUser.email) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    if (!selectedUser.email.includes('@')) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setEditLoading(true);
    try {
      const updatedData = {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        status: selectedUser.status,
        phone: selectedUser.phone || "",
        address: selectedUser.address || "",
        bio: selectedUser.bio || ""
      };
      await axios.put(`${API_URL}/users/${selectedUser.id}`, updatedData);
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      showToast("User updated successfully!", "success");
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response) {
        showToast(error.response.data?.message || `Server error (${error.response.status})`, "error");
      } else if (error.request) {
        showToast("Network error – could not reach server", "error");
      } else {
        showToast("Failed to update user", "error");
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;

    // Optimistically close any open modals
    if (showEditModal) setShowEditModal(false);
    if (showViewModal) setShowViewModal(false);
    setSelectedUser(null);

    try {
      await axios.delete(`${API_URL}/users/${userId}`);
      await fetchUsers();
      showToast("User deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response) {
        showToast(error.response.data?.message || `Server error (${error.response.status})`, "error");
      } else if (error.request) {
        showToast("Network error – could not reach server", "error");
      } else {
        showToast("Failed to delete user", "error");
      }
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/users/${userId}/status`, { status: newStatus });
      await fetchUsers();
      showToast(`User status updated to ${newStatus}`, "success");
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Failed to update status", "error");
    }
  };

  const getRandomColor = () => {
    const colors = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "volunteer",
      status: "active",
      phone: "",
      address: "",
      bio: ""
    });
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'admin': return 'Administrator';
      case 'editor': return 'Content Editor';
      case 'volunteer': return 'Volunteer';
      default: return role;
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const adminUsers = users.filter(u => u.role === "admin").length;
  const newThisMonth = users.filter(u => {
    if (!u.joinDate) return false;
    const joinMonth = new Date(u.joinDate).getMonth();
    const currentMonth = new Date().getMonth();
    return joinMonth === currentMonth;
  }).length;

  return (
    <div className="users-container">
      <div className="users-wrapper">
        {/* Header */}
        <div className="users-header">
          <div className="header-top">
            <h1>
              <span>👥</span> User Management
            </h1>
            <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
              <span>➕</span> Add New User
            </button>
          </div>
          
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-number">{totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-number">{activeUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-number">{adminUsers}</div>
              <div className="stat-label">Administrators</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🆕</div>
              <div className="stat-number">{newThisMonth}</div>
              <div className="stat-label">New This Month</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div className="filter-group">
            <select 
              className="filter-select"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="editor">Editor</option>
              <option value="volunteer">Volunteer</option>
            </select>
            
            <select 
              className="filter-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div 
                            className="user-avatar" 
                            style={{ backgroundColor: user.avatarColor }}
                          >
                            {user.avatar}
                          </div>
                          <div className="user-details">
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`status-badge status-${user.status}`}
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          style={{ border: 'none', cursor: 'pointer', width: '100px' }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>
                      <td>{formatDate(user.joinDate)}</td>
                      <td>{formatDate(user.lastActive)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowViewModal(true);
                            }}
                          >
                            👁️ View
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {filteredUsers.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <h3>No users found</h3>
                  <p>Try adjusting your search or add a new user</p>
                  <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
                    Add User
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="admin">Administrator</option>
                    <option value="editor">Editor</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  rows="2"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  rows="3"
                  placeholder="Enter bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              
              <div className="modal-actions">
                <button className="save-btn" onClick={handleAddUser} disabled={addLoading}>
                  {addLoading ? "Adding..." : "Add User"}
                </button>
                <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-modal" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  >
                    <option value="admin">Administrator</option>
                    <option value="editor">Editor</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={selectedUser.phone}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  rows="2"
                  value={selectedUser.address}
                  onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  rows="3"
                  value={selectedUser.bio}
                  onChange={(e) => setSelectedUser({ ...selectedUser, bio: e.target.value })}
                />
              </div>
              
              <div className="modal-actions">
                <button className="save-btn" onClick={handleEditUser} disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-modal" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div 
                  className="user-avatar" 
                  style={{ 
                    backgroundColor: selectedUser.avatarColor, 
                    width: "80px", 
                    height: "80px", 
                    fontSize: "32px",
                    margin: "0 auto"
                  }}
                >
                  {selectedUser.avatar}
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Full Name:</div>
                <div className="detail-value">{selectedUser.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Email:</div>
                <div className="detail-value">{selectedUser.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Role:</div>
                <div className="detail-value">{getRoleLabel(selectedUser.role)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <span className={`status-badge status-${selectedUser.status}`}>
                    {selectedUser.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Phone:</div>
                <div className="detail-value">{selectedUser.phone || "Not provided"}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Address:</div>
                <div className="detail-value">{selectedUser.address || "Not provided"}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Bio:</div>
                <div className="detail-value">{selectedUser.bio || "No bio provided"}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Join Date:</div>
                <div className="detail-value">{formatDate(selectedUser.joinDate)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Last Active:</div>
                <div className="detail-value">{formatDate(selectedUser.lastActive)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}