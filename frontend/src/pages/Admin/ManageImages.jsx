import { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageImages.css';

export default function ManageImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingImage, setEditingImage] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/images`);
      setImages(response.data);
    } catch (err) {
      showToast('Failed to load images', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setEditTitle(image.title);
    setEditDesc(image.description);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE}/images/${editingImage._id}`, {
        title: editTitle,
        description: editDesc,
      });
      showToast('Image updated successfully!', 'success');
      setEditingImage(null);
      fetchImages(); // refresh list
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const handleDelete = async (image) => {
    try {
      await axios.delete(`${API_BASE}/images/${image._id}`);
      showToast('Image deleted from Cloudinary & database', 'success');
      setDeleteConfirm(null);
      fetchImages();
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="manage-container">
        <div className="loading-spinner">⏳ Loading images...</div>
      </div>
    );
  }

  return (
    <div className="manage-container">
      <div className="manage-header">
        <h1>📷 ✨Manage Images</h1>
        <p>View, edit, or delete uploaded images</p>
      </div>

      <div className="images-grid">
        {images.length === 0 ? (
          <div className="empty-state">📭 No images uploaded yet</div>
        ) : (
          images.map((image) => (
            <div key={image._id} className="image-card">
              <img src={image.imageUrl} alt={image.title} className="image-thumb" />
              <div className="image-info">
                <h3>{image.title}</h3>
                <p>{image.description || 'No description'}</p>
                <small>Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}</small>
              </div>
              <div className="image-actions">
                <button className="edit-btn" onClick={() => handleEdit(image)}>✏️ Edit</button>
                <button className="delete-btn" onClick={() => setDeleteConfirm(image)}>🗑️ Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <div className="modal-overlay" onClick={() => setEditingImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Image Details</h2>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows="3" />
            </div>
            <div className="modal-buttons">
              <button onClick={handleUpdate} className="save-btn">💾 Save</button>
              <button onClick={() => setEditingImage(null)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-confirm" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Confirm Deletion</h2>
            <p>Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?</p>
            <p style={{ color: 'red', fontSize: '0.9rem' }}>This will remove it from Cloudinary AND the database – permanent!</p>
            <div className="modal-buttons">
              <button onClick={() => handleDelete(deleteConfirm)} className="delete-btn">🗑️ Yes, Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span> {toast.message}
        </div>
      )}
    </div>
  );
}