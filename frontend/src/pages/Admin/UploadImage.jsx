import { useState, useRef } from "react";
import axios from "axios";
import './UploadImage.css';

export default function UploadImage() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!image) newErrors.image = "Please select an image";
    else if (image.size > 10 * 1024 * 1024) newErrors.image = "File size must be less than 10MB";
    else if (!image.type.startsWith('image/')) newErrors.image = "Please select a valid image file";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast("File size must be less than 10MB", "error");
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast("Please select a valid image file", "error");
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: null }));
      showToast(`Selected: ${file.name}`, "info");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size <= 10 * 1024 * 1024) {
        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setErrors(prev => ({ ...prev, image: null }));
        showToast(`Selected: ${file.name}`, "info");
      } else {
        showToast("File size must be less than 10MB", "error");
      }
    } else {
      showToast("Please drop a valid image file", "error");
    }
  };

  const removeImage = () => {
    setImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Image removed", "info");
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("description", description);

    setLoading(true);
    setProgress(0);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/images/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        showToast("Image uploaded successfully! ✅", "success");
        setTitle("");
        setDescription("");
        setImage(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      let errorMessage = "Upload failed ❌";
      if (err.response?.data?.error) errorMessage = err.response.data.error;
      else if (err.message) errorMessage = err.message;
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All data will be lost.")) {
      setTitle("");
      setDescription("");
      setImage(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
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
            <div className="upload-icon">🖼️</div>
            <h2>Upload New Image</h2>
            <p>Add impactful photos to the gallery</p>
          </div>

          <div className="upload-form">
            {/* Title */}
            <div className="form-group">
              <label>Image Title <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g., Tree Plantation Drive"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                className={errors.title ? "error" : ""}
              />
              {errors.title && <div className="error-message">⚠️ {errors.title}</div>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description <span className="required">*</span></label>
              <textarea
                rows="4"
                placeholder="Describe the image..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: null });
                }}
                className={errors.description ? "error" : ""}
              />
              {errors.description && <div className="error-message">⚠️ {errors.description}</div>}
            </div>

            {/* File Upload Area */}
            <div className="form-group">
              <label>Image File <span className="required">*</span></label>
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
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <div className="upload-icon-large">🖼️</div>
                <h3>Click or drag image here</h3>
                <p>Supports JPG, PNG, GIF (Max 10MB)</p>
              </div>
              {errors.image && <div className="error-message">⚠️ {errors.image}</div>}
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="preview-section">
                <div className="preview-title">Preview</div>
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" />
                </div>
                <div className="preview-details">
                  <div className="file-size">
                    📁 {image.name} • {formatFileSize(image.size)}
                  </div>
                  <div className="remove-file" onClick={removeImage}>🗑️ Remove</div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {loading && progress > 0 && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="progress-text">Uploading... {progress}%</div>
              </div>
            )}

            {/* Buttons */}
            <div className="button-group">
              <button className="upload-btn" onClick={handleUpload} disabled={loading}>
                {loading ? <>⏳ Uploading...</> : <>📤 Upload Image</>}
              </button>
              <button className="cancel-btn" onClick={handleCancel} disabled={loading}>
                🗑️ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}