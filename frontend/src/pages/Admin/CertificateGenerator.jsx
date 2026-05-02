// pages/Admin/CertificateGenerator.jsx
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import './CertificateGenerator.css';

export default function CertificateGenerator() {
  const [formData, setFormData] = useState({
    ngoName: "Helping Hands Foundation",
    recipientName: "John Doe",
    certificateType: "Volunteer",
    description: "In recognition of their outstanding contribution and dedicated service to our cause.",
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: "",
    certificateNumber: "NGO-" + Date.now(),
    signatureName: "Sarah Johnson",
    signatureTitle: "Executive Director"
  });

  const [template, setTemplate] = useState("classic");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const certificateRef = useRef(null);

  const certificateTypes = [
    "Volunteer",
    "Donor Recognition",
    "Community Service",
    "Achievement",
    "Participation",
    "Leadership",
    "Excellence",
    "Partnership"
  ];

  const templates = {
    classic: {
      name: "Classic",
      borderColor: "#f39c12",
      titleColor: "#2c3e50"
    },
    modern: {
      name: "Modern",
      borderColor: "#3498db",
      titleColor: "#2980b9"
    },
    elegant: {
      name: "Elegant",
      borderColor: "#9b59b6",
      titleColor: "#8e44ad"
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateCertificateNumber = () => {
    const newNumber = "NGO-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    setFormData(prev => ({ ...prev, certificateNumber: newNumber }));
    showToast("New certificate number generated!", "success");
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      showToast("Generating certificate...", "info");
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      const fileName = `${formData.recipientName.replace(/\s/g, '_')}_Certificate.png`;
      link.download = fileName;
      link.href = image;
      link.click();
      
      showToast("Certificate downloaded successfully!", "success");
    } catch (error) {
      console.error("Error generating certificate:", error);
      showToast("Failed to generate certificate. Please try again.", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="certificate-container">
      <div className="certificate-wrapper">
        <div className="certificate-header">
          <h1>🎓 Auto-Certificate Generator</h1>
          <p>Create and download professional certificates for your NGO</p>
        </div>

        <div className="certificate-content">
          {/* Form Panel */}
          <div className="form-panel">
            <h2>Certificate Details</h2>
            <p>Fill in the information below to generate your certificate</p>

            <div className="form-group">
              <label>NGO Name <span className="required">*</span></label>
              <input
                type="text"
                name="ngoName"
                value={formData.ngoName}
                onChange={handleChange}
                placeholder="Enter your NGO name"
              />
            </div>

            <div className="form-group">
              <label>Recipient Name <span className="required">*</span></label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Enter recipient's full name"
              />
            </div>

            <div className="form-group">
              <label>Certificate Type <span className="required">*</span></label>
              <select name="certificateType" value={formData.certificateType} onChange={handleChange}>
                {certificateTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description / Message</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter a special message for the recipient..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Expiry Date (Optional)</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Signature Name</label>
                <input
                  type="text"
                  name="signatureName"
                  value={formData.signatureName}
                  onChange={handleChange}
                  placeholder="Authorized signatory name"
                />
              </div>
              <div className="form-group">
                <label>Signature Title</label>
                <input
                  type="text"
                  name="signatureTitle"
                  value={formData.signatureTitle}
                  onChange={handleChange}
                  placeholder="Position title"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Certificate Number</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  name="certificateNumber"
                  value={formData.certificateNumber}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={generateCertificateNumber}
                  style={{
                    padding: "0 15px",
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="template-selector">
              <h3>Select Template Style</h3>
              <div className="template-buttons">
                {Object.entries(templates).map(([key, tmpl]) => (
                  <button
                    key={key}
                    className={`template-btn ${template === key ? 'active' : ''}`}
                    onClick={() => setTemplate(key)}
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="preview-panel">
            <div className="preview-header">
              <h2>📄 Certificate Preview</h2>
              <button className="download-btn" onClick={downloadCertificate}>
                ⬇️ Download Certificate
              </button>
            </div>

            {/* Certificate Card */}
            <div ref={certificateRef}>
              <div className="certificate-card">
                <div className="certificate-border">
                  {/* Logo/Icon */}
                  <div className="certificate-logo">
                    🏆
                  </div>

                  {/* Title */}
                  <div className="certificate-title">
                    <h2 style={{ color: templates[template].titleColor }}>
                      Certificate of {formData.certificateType}
                    </h2>
                    <div className="certificate-subtitle">
                      {formData.ngoName.toUpperCase()}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="certificate-body">
                    <p>This certificate is proudly presented to</p>
                    <div className="recipient-name">
                      {formData.recipientName}
                    </div>
                    <p className="certificate-description">
                      {formData.description}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="certificate-details">
                    <div className="detail-item">
                      <div className="detail-label">Issue Date</div>
                      <div className="detail-value">{formatDate(formData.issueDate)}</div>
                    </div>
                    {formData.expiryDate && (
                      <div className="detail-item">
                        <div className="detail-label">Valid Until</div>
                        <div className="detail-value">{formatDate(formData.expiryDate)}</div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="certificate-footer">
                    <div className="signature-area">
                      <div className="signature">
                        <div className="signature-line"></div>
                        <div className="signature-name">{formData.signatureName}</div>
                        <div className="signature-title">{formData.signatureTitle}</div>
                      </div>
                      <div className="signature">
                        <div className="signature-line"></div>
                        <div className="signature-name">Organization Seal</div>
                        <div className="signature-title">{formData.ngoName}</div>
                      </div>
                    </div>

                    <div className="certificate-seal">
                      <div className="seal">
                        {formData.ngoName.charAt(0)}
                      </div>
                    </div>

                    <div className="certificate-number">
                      Certificate No: {formData.certificateNumber}
                    </div>
                  </div>
                </div>
              </div>
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
  );
}