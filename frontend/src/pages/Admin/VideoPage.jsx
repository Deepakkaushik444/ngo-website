// pages/Admin/VideoPage.jsx
import { useState, useEffect, useRef } from "react";
import './VideoPage.css';
import axios from "axios";

export default function VideoPage() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "newest"
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 12;
  const fileInputRef = useRef(null);

  // Fetch videos from database
  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [videos, filters, currentPage]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/posts");
      
      const formattedVideos = res.data.map(video => ({
        id: video._id,
        title: video.title || "Untitled",
        description: video.description || "",
        videoUrl: video.videoUrl,
        thumbnail: video.thumbnail || null,
        duration: video.duration || "2:00",
        views: video.views || 0,
        likes: video.likes || 0,
        category: video.category || "General",
        uploadedAt: video.createdAt || new Date(),
        status: video.status || "published"
      }));
      
      setVideos(formattedVideos);
      showToast(`Loaded ${formattedVideos.length} video(s) successfully!`, "success");
    } catch (error) {
      console.error("Error fetching videos:", error);
      showToast("Failed to load videos from database ❌", "error");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...videos];
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(v => 
        (v.title && v.title.toLowerCase().includes(searchLower)) ||
        (v.description && v.description.toLowerCase().includes(searchLower)) ||
        (v.category && v.category.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
        break;
      case "most-viewed":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "most-liked":
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default:
        break;
    }
    
    setFilteredVideos(filtered);
  };

  const handleDelete = async (videoId) => {
  if (!window.confirm("Are you sure you want to delete this video?")) return;

  // Optimistic update (optional)
  setVideos(prev => prev.filter(v => v.id !== videoId));

  try {
    await axios.delete(`http://localhost:5000/api/posts/${videoId}`);
    showToast("Video deleted successfully ✅", "success");
  } catch (error) {
    console.error("Delete error:", error);
    showToast("Failed to delete video ❌", "error");
    // Revert optimistic update by re-fetching
    fetchVideos();
  }
};

  const handleEdit = (video) => {
    setEditingVideo({ ...video });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000.com/api/posts/${editingVideo.id}`, {
        title: editingVideo.title,
        description: editingVideo.description,
        category: editingVideo.category
      });
      
      const updatedVideos = videos.map(v => 
        v.id === editingVideo.id ? { ...editingVideo, updatedAt: new Date() } : v
      );
      setVideos(updatedVideos);
      setShowEditModal(false);
      showToast("Video updated successfully!", "success");
    } catch (error) {
      console.error("Error updating video:", error);
      showToast("Failed to update video ❌", "error");
    }
  };

  const handleView = async (video) => {
    setSelectedVideo(video);
    setShowModal(true);
    
    try {
      await axios.put(`http://localhost:5000/api/posts/${video.id}/view`);
      const updatedVideos = videos.map(v => 
        v.id === video.id ? { ...v, views: (v.views || 0) + 1 } : v
      );
      setVideos(updatedVideos);
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVideos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  // Statistics
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const publishedVideos = videos.filter(v => v.status === "published").length;

  return (
    <div className="video-container">
      <div className="video-wrapper">
        {/* Header */}
        <div className="video-header">
          <div className="header-top">
            <h1>
              <span>🎬</span> Video Library
            </h1>
            <button className="upload-btn" onClick={() => window.location.href = "upload"}>
              <span>📤</span> Upload New Video
            </button>
          </div>
          
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📹</div>
              <div className="stat-number">{totalVideos}</div>
              <div className="stat-label">Total Videos</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👁️</div>
              <div className="stat-number">{formatNumber(totalViews)}</div>
              <div className="stat-label">Total Views</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-number">{formatNumber(totalLikes)}</div>
              <div className="stat-label">Total Likes</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-number">{publishedVideos}</div>
              <div className="stat-label">Published</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search videos by title, description or category..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div className="filter-group">
            <select 
              className="filter-select"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-viewed">Most Viewed</option>
              <option value="most-liked">Most Liked</option>
            </select>
          </div>
          
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              📱 Grid
            </button>
            <button 
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              📋 List
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading videos from database...</p>
          </div>
        )}

        {/* Video Display */}
        {!loading && (
          <>
            {viewMode === "grid" ? (
              <div className="videos-grid">
                {currentItems.map((video) => (
                  <div key={video.id} className="video-card">
                    <div className="video-thumbnail" onClick={() => handleView(video)}>
                      <video src={video.videoUrl} preload="metadata" />
                      <div className="play-overlay">
                        <div className="play-icon">▶️</div>
                      </div>
                      <div className="duration">{video.duration}</div>
                    </div>
                    <div className="video-info">
                      <div className="video-title">
                        {video.title}
                        <span className="category-badge" style={{ fontSize: "11px", background: "#e0e0e0", padding: "2px 8px", borderRadius: "12px" }}>
                          {video.category}
                        </span>
                      </div>
                      <div className="video-description">{video.description}</div>
                      <div className="video-meta">
                        <span className="meta-item">👁️ {formatNumber(video.views)}</span>
                        <span className="meta-item">❤️ {formatNumber(video.likes)}</span>
                        <span className="meta-item">📅 {formatDate(video.uploadedAt)}</span>
                      </div>
                      <div className="video-actions">
                        <button className="action-icon view" onClick={() => handleView(video)}>▶️ Watch</button>
                        <button className="action-icon edit" onClick={() => handleEdit(video)}>✏️ Edit</button>
                        <button className="action-icon delete" onClick={() => handleDelete(video.id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="videos-list">
                <div className="list-header">
                  <div>Thumbnail</div>
                  <div>Title & Description</div>
                  <div>Views</div>
                  <div>Date</div>
                  <div>Actions</div>
                </div>
                {currentItems.map((video) => (
                  <div key={video.id} className="list-item">
                    <div className="list-thumbnail" onClick={() => handleView(video)}>
                      <video src={video.videoUrl} preload="metadata" />
                    </div>
                    <div>
                      <div className="list-title">{video.title}</div>
                      <div className="list-description">{video.description?.substring(0, 80)}...</div>
                    </div>
                    <div>{formatNumber(video.views)}</div>
                    <div>{formatDate(video.uploadedAt)}</div>
                    <div className="video-actions">
                      <button className="action-icon view" onClick={() => handleView(video)}>▶️</button>
                      <button className="action-icon edit" onClick={() => handleEdit(video)}>✏️</button>
                      <button className="action-icon delete" onClick={() => handleDelete(video.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredVideos.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No videos found</h3>
                <p>Try adjusting your search or upload a new video</p>
                <button className="upload-btn" onClick={() => window.location.href = "/upload"}>
                  Upload Video
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

      {/* View Modal */}
      {showModal && selectedVideo && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedVideo.title}</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <video className="modal-video" src={selectedVideo.videoUrl} controls autoPlay />
              <div className="modal-info">
                <div className="info-row">
                  <div className="info-label">Description:</div>
                  <div className="info-value">{selectedVideo.description}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Category:</div>
                  <div className="info-value">{selectedVideo.category}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Views:</div>
                  <div className="info-value">{formatNumber(selectedVideo.views)}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Likes:</div>
                  <div className="info-value">{formatNumber(selectedVideo.likes)}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Duration:</div>
                  <div className="info-value">{selectedVideo.duration}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Uploaded:</div>
                  <div className="info-value">{formatDate(selectedVideo.uploadedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingVideo && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Video</h3>
              <button className="close-modal" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="edit-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={editingVideo.category}
                  onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button className="save-btn" onClick={handleSaveEdit}>Save Changes</button>
                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : toast.type === "warning" ? "⚠️" : "❌"}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}