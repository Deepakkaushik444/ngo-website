// pages/Admin/CertificateGenerator.jsx
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import './CertificateGenerator.css';

export default function CertificateGenerator() {
  const [formData, setFormData] = useState({
    ngoName: "Maa Indrawati Devi Nari Shakti Foundation",
    recipientName: "Dr. Priya Sharma",
    certificateType: "Humanitarian Service",
description: "Honoring your exceptional commitment, inspiring service, and significant contribution toward social empowerment, humanitarian support, and community development.",
    expiryDate: "",
    certificateNumber: "NGO-" + Date.now(),
    signatureName: "Indu",
    signatureTitle: "Executive Director"
  });

  const [template, setTemplate] = useState("classic");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [orgLogo, setOrgLogo] = useState(null);
  const [adminSignature, setAdminSignature] = useState(null);
  const certificateRef = useRef(null);
  const logoInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  const certificateTypes = [
    "Humanitarian Service",
    "Volunteer Excellence",
    "Donor Recognition",
    "Community Leadership",
    "Social Impact",
    "Education Support",
    "Healthcare Initiative",
    "Environmental Stewardship",
    "Women Empowerment",
    "Child Welfare",
    "Disaster Relief",
    "Partnership Award"
  ];

  const templates = {
    classic: {
      name: "Classic",
      borderColor: "#c0392b",
      titleColor: "#2c3e50",
      accentColor: "#e67e22"
    },
    modern: {
      name: "Modern",
      borderColor: "#2980b9",
      titleColor: "#1a5276",
      accentColor: "#3498db"
    },
    elegant: {
      name: "Elegant",
      borderColor: "#7d3c98",
      titleColor: "#6c3483",
      accentColor: "#9b59b6"
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

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setOrgLogo(reader.result);
        } else if (type === 'signature') {
          setAdminSignature(reader.result);
        }
        showToast(`${type === 'logo' ? 'Logo' : 'Signature'} uploaded successfully!`, "success");
      };
      reader.readAsDataURL(file);
    } else {
      showToast("Please upload a valid PNG or JPG image", "error");
    }
  };

  const removeImage = (type) => {
    if (type === 'logo') {
      setOrgLogo(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    } else if (type === 'signature') {
      setAdminSignature(null);
      if (signatureInputRef.current) signatureInputRef.current.value = '';
    }
    showToast(`${type === 'logo' ? 'Logo' : 'Signature'} removed`, "info");
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      showToast("Generating certificate...", "info");
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      const fileName = `${formData.recipientName.replace(/\s/g, '_')}_${formData.certificateType.replace(/\s/g, '_')}_Certificate.png`;
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
          <h1>🌍 NGO Certificate Generator</h1>
          <p>Create impact-driven certificates with official signatures & branding</p>
        </div>

        <div className="certificate-content">
          {/* Form Panel */}
          <div className="form-panel">
            <h2>Certificate Details</h2>
            <p>Fill in the information below to generate your humanitarian certificate</p>

            <div className="form-group">
              <label>Organization Logo <span className="optional">(Optional)</span></label>
              <div className="image-upload-wrapper">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => handleImageUpload(e, 'logo')}
                  ref={logoInputRef}
                  style={{ display: 'none' }}
                  id="logo-upload"
                />
                <button 
                  type="button" 
                  className="upload-btn"
                  onClick={() => document.getElementById('logo-upload').click()}
                >
                  📷 Upload Logo
                </button>
                {orgLogo && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeImage('logo')}
                  >
                    ✖ Remove Logo
                  </button>
                )}
              </div>
              {orgLogo && (
                <div className="image-preview">
                  <img src={orgLogo} alt="Organization Logo Preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>NGO / Organization Name <span className="required">*</span></label>
              <input
                type="text"
                name="ngoName"
                value={formData.ngoName}
                onChange={handleChange}
                placeholder="Enter your NGO name"
              />
            </div>

            <div className="form-group">
              <label>Recipient Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Enter recipient's full name"
              />
            </div>

            <div className="form-group">
              <label>Award / Certificate Type <span className="required">*</span></label>
              <select name="certificateType" value={formData.certificateType} onChange={handleChange}>
                {certificateTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Recognition Message</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Write a heartfelt message of appreciation..."
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

            <div className="form-group">
              <label>Administrator Signature <span className="optional">(Upload Image)</span></label>
              <div className="image-upload-wrapper">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => handleImageUpload(e, 'signature')}
                  ref={signatureInputRef}
                  style={{ display: 'none' }}
                  id="signature-upload"
                />
                <button 
                  type="button" 
                  className="upload-btn"
                  onClick={() => document.getElementById('signature-upload').click()}
                >
                  ✍️ Upload Signature
                </button>
                {adminSignature && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeImage('signature')}
                  >
                    ✖ Remove Signature
                  </button>
                )}
              </div>
              {adminSignature && (
                <div className="image-preview">
                  <img src={adminSignature} alt="Signature Preview" />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Authorized Signatory Name</label>
                <input
                  type="text"
                  name="signatureName"
                  value={formData.signatureName}
                  onChange={handleChange}
                  placeholder="Name of signing authority"
                />
              </div>
              <div className="form-group">
                <label>Signatory Title</label>
                <input
                  type="text"
                  name="signatureTitle"
                  value={formData.signatureTitle}
                  onChange={handleChange}
                  placeholder="Position / Title"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Certificate Serial Number</label>
              <div className="cert-number-group">
                <input
                  type="text"
                  name="certificateNumber"
                  value={formData.certificateNumber}
                  onChange={handleChange}
                />
                <button onClick={generateCertificateNumber} className="generate-number-btn">
                  Generate New
                </button>
              </div>
            </div>

            <div className="template-selector">
              <h3>Certificate Design Template</h3>
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
              <h2>📜 Certificate Preview</h2>
              <button className="download-btn" onClick={downloadCertificate}>
                ⬇️ Download Certificate (PNG)
              </button>
            </div>

            {/* Certificate Card */}
            <div ref={certificateRef}>
              <div className="certificate-card" style={{ borderColor: templates[template].borderColor }}>
                <div className="certificate-border">
                  {/* Organization Logo & Header */}
                  <div className="certificate-header-section">
                    <div className="certificate-logo">
                      {orgLogo ? (
                        <img src={orgLogo} alt="Organization Logo" className="org-logo-img" />
                      ) : (
                        <div className="default-logo" style={{ background: templates[template].accentColor }}>
                          🌍
                        </div>
                      )}
                    </div>
                    <div className="certificate-ngo-name" style={{ color: templates[template].borderColor }}>
                      {formData.ngoName}
                    </div>
                  </div>

                  {/* Decorative Line */}
                  <div className="certificate-divider" style={{ background: `linear-gradient(90deg, transparent, ${templates[template].borderColor}, transparent)` }}></div>

                  {/* Title */}
                  <div className="certificate-title">
                    <h2 style={{ color: templates[template].titleColor }}>
                      Certificate of {formData.certificateType}
                    </h2>
                    <div className="certificate-subtitle">
                      In Recognition & Appreciation
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

                  {/* Details Grid */}
                  <div className="certificate-details">
                    <div className="detail-item">
                      <div className="detail-label">Date of Issue</div>
                      <div className="detail-value">{formatDate(formData.issueDate)}</div>
                    </div>
                    {formData.expiryDate && (
                      <div className="detail-item">
                        <div className="detail-label">Valid Through</div>
                        <div className="detail-value">{formatDate(formData.expiryDate)}</div>
                      </div>
                    )}
                  </div>

                  {/* Footer with Signature & Seal */}
                  <div className="certificate-footer">
                    <div className="signature-area">
                      <div className="signature-block">
                        <div className="signature-container">
                          {adminSignature ? (
                            <img src={adminSignature} alt="Authorized Signature" className="signature-img" />
                          ) : (
                            <div className="signature-line"></div>
                          )}
                        </div>
                        <div className="signature-name">{formData.signatureName}</div>
                        <div className="signature-title">{formData.signatureTitle}</div>
                      </div>
                      <div className="signature-block">
                        <div className="signature-container">
                          <div className="signature-line"></div>
                        </div>
                        <div className="signature-name">Organization Seal</div>
                        <div className="signature-title">{formData.ngoName}</div>
                      </div>
                    </div>

                   <div className="certificate-seal">
  <img 
    src="../images/stamp.png"   // 👈 DUMMY URL – replace with your stamp image URL later
    alt="Organization Stamp"
    className="seal-image"
    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
  />
</div>

                    <div className="certificate-number">
                      Certificate ID: {formData.certificateNumber}
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