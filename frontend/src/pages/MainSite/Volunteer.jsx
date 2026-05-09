// Volunteer.js
import { useState, useEffect } from "react";
import "./Volunteer.css";

export default function Volunteer() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    reason: "",
    otherReason: "",
    additionalComments: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  // Predefined reasons
  const reasonOptions = [
    "I want to give back to society",
    "I am passionate about helping others",
    "I want to make a positive impact in the community",
    "I want to gain new skills and experience",
    "I want to build my resume / career profile",
    "I want to develop leadership and teamwork skills",
    "I was inspired by your NGO’s work",
    "I want to use my free time in a meaningful way",
    "I care about social causes like education, environment, or health",
    "Other",
  ];

  // Fetch volunteers
  const fetchVolunteers = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("https://ngo-website-wzab.onrender.com/api/volunteer/volunteers");
      const data = await res.json();
      if (data.success) {
        setVolunteers(data.volunteers);
      } else {
        console.error("Failed to fetch volunteers:", data);
      }
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Build the final message to send to API
  const buildMessage = () => {
    let reasonText = form.reason;
    if (form.reason === "Other" && form.otherReason.trim()) {
      reasonText = form.otherReason.trim();
    }
    let message = `🌍 Region: ${form.region || "Not specified"}\n💡 Reason: ${reasonText}`;
    if (form.additionalComments.trim()) {
      message += `\n\n📝 Additional comments:\n${form.additionalComments}`;
    }
    return message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const message = buildMessage();

    try {
      const res = await fetch("https://ngo-website-wzab.onrender.com/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({
          name: "",
          email: "",
          phone: "",
          region: "",
          reason: "",
          otherReason: "",
          additionalComments: "",
        });
        setTimeout(() => setSubmitted(false), 5000);
        
        // Wait 1.5 seconds to ensure backend processes and then refetch
        setTimeout(() => {
          fetchVolunteers();
        }, 1500);
      } else {
        alert(data.error || "Error submitting form ❌");
      }
    } catch (error) {
      console.error("Volunteer error:", error);
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleViewVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  const getRoleLabel = (role) => {
    const roles = { admin: "Admin", editor: "Editor", volunteer: "Volunteer" };
    return roles[role] || role;
  };

  return (
    <div className="volunteer-page">
      <div className="container">
        <h1>Join as a Volunteer</h1>

        {/* Form Section */}
        <div className="volunteer-form-container">
          {submitted && <div className="success-message">✅ Thank you! We'll contact you soon.</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                required
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <span className="input-icon">📧</span>
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <span className="input-icon">📞</span>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                required
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <span className="input-icon">📍</span>
              <input
                type="text"
                name="region"
                placeholder="Your Region / City (e.g., Mumbai, Delhi, etc.)"
                value={form.region}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <span className="input-icon">💡</span>
              <select name="reason" value={form.reason} onChange={handleChange} required>
                <option value="">Select a reason to volunteer *</option>
                {reasonOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {form.reason === "Other" && (
              <div className="form-group">
                <span className="input-icon">✏️</span>
                <input
                  type="text"
                  name="otherReason"
                  placeholder="Please specify your reason"
                  value={form.otherReason}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <span className="input-icon">💬</span>
              <textarea
                name="additionalComments"
                rows="3"
                placeholder="Anything else you'd like to share? (optional)"
                value={form.additionalComments}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="submit-volunteer-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>

        {/* Volunteer List Section */}
        <div className="volunteer-list-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2>Our Volunteers ({volunteers.length})</h2>
            <button 
              onClick={fetchVolunteers} 
              disabled={refreshing}
              className="refresh-btn"
            >
              {refreshing ? "🔄" : "⟳ Refresh"}
            </button>
          </div>
          <div className="volunteer-grid">
            {volunteers.length === 0 ? (
              <p className="no-volunteers">No volunteers yet. Be the first!</p>
            ) : (
              volunteers.map((vol) => (
                <div
                  key={vol._id}
                  className="volunteer-card"
                  onClick={() => handleViewVolunteer(vol)}
                >
                  <div className="volunteer-avatar">
                    {vol.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="volunteer-info">
                    <h3>{vol.name}</h3>
                    
                    {vol.message && (
                      <p className="volunteer-message">
                        "{vol.message.substring(0, 100)}"
                        {vol.message.length > 100 ? "..." : ""}
                      </p>
                    )}
                    <small className="volunteer-date">
                      Joined: {formatDate(vol.joinDate)}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* View Volunteer Modal */}
      {showViewModal && selectedVolunteer && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Volunteer Details</h3>
              <button className="close-modal" onClick={() => setShowViewModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-avatar">
                <div
                  className="user-avatar"
                  style={{
                    backgroundColor: selectedVolunteer.avatarColor || "#FFD700",
                    width: "80px",
                    height: "80px",
                    fontSize: "32px",
                    margin: "0 auto",
                  }}
                >
                  {selectedVolunteer.avatar ||
                    selectedVolunteer.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Full Name:</div>
                <div className="detail-value">{selectedVolunteer.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Email:</div>
                <div className="detail-value">{selectedVolunteer.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Role:</div>
                <div className="detail-value">{getRoleLabel(selectedVolunteer.role)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <span className={getStatusClass(selectedVolunteer.status)}>
                    {selectedVolunteer.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Phone:</div>
                <div className="detail-value">{selectedVolunteer.phone || "Not provided"}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Message:</div>
                <div className="detail-value">
                  {selectedVolunteer.message || "No message provided"}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Join Date:</div>
                <div className="detail-value">{formatDate(selectedVolunteer.joinDate)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Last Active:</div>
                <div className="detail-value">{formatDate(selectedVolunteer.lastActive)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}