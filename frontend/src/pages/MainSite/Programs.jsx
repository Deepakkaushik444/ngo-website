import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Programs.css";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch programs from backend
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get("https://ngo-website-wzab.onrender.com/api/programs");
        setPrograms(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load programs:", err);
        setError("Could not load programs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedProgram(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedProgram ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedProgram]);

  const openModal = (program) => setSelectedProgram(program);
  const closeModal = () => setSelectedProgram(null);

  const handleRegister = (program) => {
    navigate("/register", {
      state: {
        event: {
          id: program._id,        // MongoDB ObjectId
          title: program.title,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="programs-page">
        <div className="container" style={{ textAlign: "center", padding: "4rem" }}>
          <div className="loading-spinner">⏳ Loading programs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="programs-page">
        <div className="container" style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "#e74c3c" }}>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="programs-page">
        <div className="container" style={{ textAlign: "center", padding: "4rem" }}>
          <p>No programs available at the moment. Please check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="programs-page">
      <div className="container">
        <h1>Our Key Programs</h1>
        <div className="programs-list">
          {programs.map((program) => (
            <div key={program._id} className="program-detail-card">
              <div className="program-icon">{program.icon}</div>
              <h2>{program.title}</h2>
              <p>{program.desc}</p>
              <small>{program.shortDetails}</small>
              <div className="card-actions">
                <button className="know-more-btn" onClick={() => openModal(program)}>
                  Know More →
                </button>
                <button className="register-btn" onClick={() => handleRegister(program)}>
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <div className="modal-content">
              <div className="modal-image">
                <img src={selectedProgram.image} alt={selectedProgram.title} />
              </div>
              <div className="modal-text">
                <h2>{selectedProgram.title}</h2>
                <p className="modal-desc">{selectedProgram.desc}</p>
                <p className="modal-long">{selectedProgram.longDetails}</p>
                <div className="modal-icon">{selectedProgram.icon}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}