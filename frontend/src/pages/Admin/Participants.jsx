import { useState, useEffect } from "react";
import axios from "axios";
import "./Participants.css";

export default function Participants() {
  const [programs, setPrograms] = useState([]);        // dynamic program list
  const [selectedEventId, setSelectedEventId] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch programs from backend when component mounts
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await axios.get("https://ngo-website-wzab.onrender.com/api/programs");
        setPrograms(res.data);
      } catch (err) {
        showToast("Failed to load programs list", "error");
      }
    };
    fetchPrograms();
  }, []);

  // Fetch participants for selected event
  const fetchParticipants = async (eventId) => {
  if (!eventId) return;
  setLoading(true);
  try {
    // Find the selected program to get its title
    const selectedProgram = programs.find(p => p._id === eventId);
    if (!selectedProgram) throw new Error('Program not found');
    
    // Fetch using eventTitle (works for old records)
    const res = await axios.get(`https://ngo-website-wzab.onrender.com/api/registrations?eventTitle=${selectedProgram.title}`);
    setParticipants(res.data);
  } catch (err) {
    showToast("Failed to load participants", "error");
  } finally {
    setLoading(false);
  }
};

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEventId(eventId);
    if (eventId) {
      fetchParticipants(eventId);
    } else {
      setParticipants([]);
    }
  };

  const handleDelete = async (regId, groupLeader) => {
    if (window.confirm(`Delete entire group "${groupLeader}"? All members will be removed.`)) {
      try {
        await axios.delete(`https://ngo-website-wzab.onrender.com/api/registrations/${regId}`);
        showToast("Group deleted", "success");
        fetchParticipants(selectedEventId);
      } catch (err) {
        showToast("Delete failed", "error");
      }
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <div className="participants-container">
      <h1>📋 Event Participants</h1>
      <div className="filter-section">
        <label>Select Event:</label>
        <select value={selectedEventId} onChange={handleEventChange}>
          <option value="">-- Choose an event --</option>
          {programs.map((prog) => (
            <option key={prog._id} value={prog._id}>
              {prog.title}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="loading">Loading participants...</div>}

      {!loading && selectedEventId && participants.length === 0 && (
        <div className="empty-state">No registrations yet for this event.</div>
      )}

      {participants.length > 0 && (
        <div className="participants-table-wrapper">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Group ID</th>
                <th>Member Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>School Name</th>
                <th>Role</th>
                <th>Registered On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((group) =>
                group.members.map((member, idx) => (
                  <tr key={`${group._id}-${idx}`}>
                    <td className="id-cell">{idx === 0 ? group.generatedId : ""}</td>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td>{member.schoolName}</td>
                    <td>{idx === 0 ? "Group Leader" : "Member"}</td>
                    <td>{new Date(group.registeredAt).toLocaleString()}</td>
                    <td>
                      {idx === 0 && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(group._id, group.members[0].name)}
                        >
                          🗑️ Delete Group
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}
    </div>
  );
}