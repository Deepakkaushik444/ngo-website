import { useState, useEffect } from "react";
import "./Volunteer.css";

export default function Volunteer() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  // Fetch volunteers
  const fetchVolunteers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/volunteer/volunteers");
      const data = await res.json();
      if (data.success) {
        setVolunteers(data.volunteers);
      }
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
        fetchVolunteers(); // refresh list
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

  // Open modal with selected volunteer
  const handleViewVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowViewModal(true);
  };

  // Helper: format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper: get status badge class
  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  // Helper: get role label
  const getRoleLabel = (role) => {
    const roles = {
      admin: "Admin",
      editor: "Editor",
      volunteer: "Volunteer",
    };
    return roles[role] || role;
  };

  return (
    <div className="volunteer-page">
      <div className="container">
        <h1>Join as a Volunteer</h1>

        {/* Form Section */}
        <div className="volunteer-form-container">
          {submitted && <div className="success-message">Thank you! We'll contact you soon.</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <span className="input-icon">👤</span>
              <input type="text" name="name" placeholder="Full Name *" required value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <span className="input-icon">📧</span>
              <input type="email" name="email" placeholder="Email Address *" required value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <span className="input-icon">📞</span>
              <input type="tel" name="phone" placeholder="Phone Number *" required value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <span className="input-icon">💬</span>
              <textarea name="message" rows="4" placeholder="Why do you want to volunteer?" value={form.message} onChange={handleChange}></textarea>
            </div>
            <button type="submit" className="submit-volunteer-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>

        {/* Volunteer List Section */}
        <div className="volunteer-list-section">
          <h2>Our Volunteers ({volunteers.length})</h2>
          <div className="volunteer-grid">
            {volunteers.length === 0 ? (
              <p className="no-volunteers">No volunteers yet. Be the first!</p>
            ) : (
              volunteers.map((vol) => (
                <div key={vol._id} className="volunteer-card" onClick={() => handleViewVolunteer(vol)}>
                  <div className="volunteer-avatar">
                    {vol.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="volunteer-info">
                    <h3>{vol.name}</h3>
                    <p className="volunteer-email">{vol.email}</p>
                    {vol.phone && <p className="volunteer-phone">{vol.phone}</p>}
                    {vol.message && <p className="volunteer-message">"{vol.message.substring(0, 100)}"</p>}
                    <small className="volunteer-date">Joined: {formatDate(vol.joinDate)}</small>
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
              <button className="close-modal" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
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
                  {selectedVolunteer.avatar || selectedVolunteer.name.charAt(0).toUpperCase()}
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
                <div className="detail-label">Why Volunteer:</div>
                <div className="detail-value">{selectedVolunteer.message || "No message provided"}</div>
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