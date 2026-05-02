// pages/Admin/UploadVideo.jsx
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import './UploadVideo.css';
import { Outlet } from "react-router-dom";

export default function UploadVideo() {
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!desc.trim()) newErrors.description = "Description is required";
    if (!video) newErrors.video = "Please select a video file";
    else if (video.size > 100 * 1024 * 1024) newErrors.video = "File size must be less than 100MB";
    else if (!video.type.startsWith('video/')) newErrors.video = "Please select a valid video file";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        showToast("File size must be less than 100MB", "error");
        return;
      }
      if (!file.type.startsWith('video/')) {
        showToast("Please select a valid video file", "error");
        return;
      }
      setVideo(file);
      setErrors(prev => ({ ...prev, video: null }));
      showToast(`Selected: ${file.name}`, "info");
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size <= 100 * 1024 * 1024) {
        setVideo(file);
        setErrors(prev => ({ ...prev, video: null }));
        showToast(`Selected: ${file.name}`, "info");
      } else {
        showToast("File size must be less than 100MB", "error");
      }
    } else {
      showToast("Please drop a valid video file", "error");
    }
  };

  // Remove selected video
  const removeVideo = () => {
    setVideo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Video removed", "info");
  };

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("video", video);
    formData.append("title", title);
    formData.append("description", desc);

    setLoading(true);
    setProgress(0);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/posts/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        showToast("Video uploaded successfully! ✅", "success");
        // Reset form
        setTitle("");
        setDesc("");
        setVideo(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      let errorMessage = "Upload failed ❌";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Reset form
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All data will be lost.")) {
      setTitle("");
      setDesc("");
      setVideo(null);
      setErrors({});
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("Form cleared", "info");
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-wrapper">
        <div className="upload-card">
          <div className="upload-header">
            <div className="upload-icon">🎬</div>
            <h2>Upload New Video</h2>
            <p>Share your NGO's impact stories with the world</p>
          </div>

          <div className="upload-form">
            {/* Title Input */}
            <div className="form-group">
              <label>
                Video Title <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Clean Water Initiative - 2024"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                className={errors.title ? "error" : ""}
              />
              {errors.title && (
                <div className="error-message">
                  <span>⚠️</span> {errors.title}
                </div>
              )}
            </div>

            {/* Description Input */}
            <div className="form-group">
              <label>
                Description <span className="required">*</span>
              </label>
              <textarea
                rows="4"
                placeholder="Describe what this video is about..."
                value={desc}
                onChange={(e) => {
                  setDesc(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: null });
                }}
                className={errors.description ? "error" : ""}
              />
              {errors.description && (
                <div className="error-message">
                  <span>⚠️</span> {errors.description}
                </div>
              )}
            </div>

            {/* File Upload Area */}
            <div className="form-group">
              <label>
                Video File <span className="required">*</span>
              </label>
              <div
                className={`file-upload-area ${dragActive ? "dragging" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <div className="upload-icon-large">📹</div>
                <h3>Click or drag video file here</h3>
                <p>Supports MP4, MOV, WebM (Max 100MB)</p>
              </div>
              {errors.video && (
                <div className="error-message">
                  <span>⚠️</span> {errors.video}
                </div>
              )}
            </div>

            {/* Video Preview */}
            {video && (
              <div className="preview-section">
                <div className="preview-title">Preview</div>
                <div className="video-preview">
                  <video
                    ref={videoRef}
                    controls
                    src={URL.createObjectURL(video)}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        URL.revokeObjectURL(videoRef.current.src);
                      }
                    }}
                  />
                </div>
                <div className="preview-details">
                  <div className="file-size">
                    📁 {video.name} • {formatFileSize(video.size)}
                  </div>
                  <div className="remove-file" onClick={removeVideo}>
                    🗑️ Remove
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {loading && progress > 0 && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="progress-text">
                  Uploading... {progress}%
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="button-group">
              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    📤 Upload Video
                  </>
                )}
              </button>
              <button
                className="cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                🗑️ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}</span>
          {toast.message}
        </div>
      )}
    </div>
    
  );<Outlet></Outlet>
}