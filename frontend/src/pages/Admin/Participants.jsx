import { useState, useEffect } from "react";
import axios from "axios";
import "./Participants.css";

const events = [
  { id: 1, title: "Bal Vikas Vatika" },
  { id: 2, title: "Ramayan Quiz" },
  { id: 3, title: "Yoga for Women" },
  { id: 4, title: "Support for Weaker Families" },
];

export default function Participants() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const fetchParticipants = async (eventId) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/registrations?eventId=${eventId}`);
      setParticipants(res.data);
    } catch (err) {
      showToast("Failed to load participants", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    if (eventId) fetchParticipants(eventId);
    else setParticipants([]);
  };

  const handleDelete = async (regId, groupLeader) => {
    if (window.confirm(`Delete entire group "${groupLeader}"? All members will be removed.`)) {
      try {
        await axios.delete(`http://localhost:5000/api/registrations/${regId}`);
        showToast("Group deleted", "success");
        fetchParticipants(selectedEvent);
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
        <select value={selectedEvent} onChange={handleEventChange}>
          <option value="">-- Choose an event --</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="loading">Loading participants...</div>}

      {!loading && selectedEvent && participants.length === 0 && (
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
              {participants.map((group) => (
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
                          onClick={() => handleDelete(group._id, group.groupLeader)}
                        >
                          🗑️ Delete Group
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ))}
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