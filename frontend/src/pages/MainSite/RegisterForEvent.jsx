import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterForEvent.css';

export default function RegisterForEvent() {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;

  const [groupSize, setGroupSize] = useState(1);
  const [members, setMembers] = useState([
    { name: '', email: '', phone: '', schoolName: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
  if (!event) {
    navigate('/programs');
  } else {
    console.log('Event received:', event);
    console.log('Event ID (_id):', event._id);
    console.log('Event ID (id):', event.id);
  }
}, [event, navigate]);

  const handleGroupSizeChange = (size) => {
    const newSize = parseInt(size);
    setGroupSize(newSize);
    const newMembers = [];
    for (let i = 0; i < newSize; i++) {
      if (members[i]) {
        newMembers.push(members[i]);
      } else {
        newMembers.push({ name: '', email: '', phone: '', schoolName: '' });
      }
    }
    setMembers(newMembers);
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleGenerateId = async (e) => {
  e.preventDefault();
  setError('');

  // Validate all fields
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    if (!m.name.trim()) {
      setError(`Member ${i + 1}: Name is required`);
      return;
    }
    if (!m.email.trim() || !/\S+@\S+\.\S+/.test(m.email)) {
      setError(`Member ${i + 1}: Valid email is required`);
      return;
    }
    if (!m.phone.trim() || !/^\d{10}$/.test(m.phone)) {
      setError(`Member ${i + 1}: Phone must be 10 digits`);
      return;
    }
    if (!m.schoolName.trim()) {
      setError(`Member ${i + 1}: School name is required`);
      return;
    }
  }

  // Check that event.id exists
  if (!event.id) {
    setError('Event ID missing. Please go back to Programs and try again.');
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post('https://ngo-website-wzab.onrender.com/api/registrations/register', {
      eventId: event.id,        // ✅ FIXED: use event.id
      eventTitle: event.title,
      groupSize: Number(groupSize),
      members,
    });
    if (res.data.success) {
      setSuccessId(res.data.generatedId);
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (!event) return null;

  return (
    <div className="register-page">
      <div className="register-container">
        {!successId ? (
          <>
            <h1>Register for {event.title}</h1>
            <form onSubmit={handleGenerateId}>
              <div className="form-card">
                <div className="form-group">
                  <label>Number of Team Members (1–4) *</label>
                  <select
                    value={groupSize}
                    onChange={(e) => handleGroupSizeChange(e.target.value)}
                  >
                    <option value="1">1 (Individual)</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <div className="members-section">
                  <h3>Member Details</h3>
                  {members.map((member, idx) => (
                    <div key={idx} className="member-card">
                      <h4>Member {idx + 1}</h4>
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                          placeholder="example@school.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number (10 digits) *</label>
                        <input
                          type="tel"
                          value={member.phone}
                          onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                          placeholder="9876543210"
                          maxLength="10"
                        />
                      </div>
                      <div className="form-group">
                        <label>School / College Name *</label>
                        <input
                          type="text"
                          value={member.schoolName}
                          onChange={(e) => handleMemberChange(idx, 'schoolName', e.target.value)}
                          placeholder="Name of institution"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {error && <div className="error-msg">{error}</div>}

                <button type="submit" disabled={loading}>
                  {loading ? 'Generating ID...' : '🔑 Generate Unique ID & Register'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>Registration Successful!</h2>
            <p>Your unique registration ID is:</p>
            <div className="unique-id">{successId}</div>
            <p>
              Registration Date: {new Date().toLocaleString()}<br />
              Team size: {groupSize}
            </p>
            <p>Please save this ID for future reference.</p>
            <button onClick={() => navigate('/programs')}>Back to Programs</button>
          </div>
        )}
      </div>
    </div>
  );
}