import { useState, useEffect } from 'react';
import axios from 'axios';
import './ManagePrograms.css';

export default function ManagePrograms() {
  const [programs, setPrograms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', desc: '', icon: '📚', shortDetails: '', longDetails: '', image: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    const res = await axios.get('https://ngo-website-wzab.onrender.com/api/programs');
    setPrograms(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await axios.put(`https://ngo-website-wzab.onrender.com/api/programs/${editing._id}`, form);
      } else {
        await axios.post('https://ngo-website-wzab.onrender.com/api/programs', form);
      }
      await fetchPrograms();
      setEditing(null);
      setForm({ title: '', desc: '', icon: '📚', shortDetails: '', longDetails: '', image: '' });
    } catch (err) {
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prog) => {
    setEditing(prog);
    setForm(prog);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this program? All registrations referencing it will remain.')) {
      await axios.delete(`https://ngo-website-wzab.onrender.com/api/programs/${id}`);
      await fetchPrograms();
    }
  };

  return (
    <div className="manage-programs">
      <h1>📁 Manage Programs</h1>
      <form onSubmit={handleSubmit} className="program-form">
        <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        <input type="text" placeholder="Short Description" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} required />
        <input type="text" placeholder="Icon (emoji)" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} />
        <textarea placeholder="Short Details (shown on card)" rows="2" value={form.shortDetails} onChange={e => setForm({...form, shortDetails: e.target.value})} required />
        <textarea placeholder="Long Details (modal)" rows="4" value={form.longDetails} onChange={e => setForm({...form, longDetails: e.target.value})} required />
        <input type="text" placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
        <button type="submit" disabled={loading}>{editing ? 'Update' : 'Create'} Program</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({title:'', desc:'', icon:'📚', shortDetails:'', longDetails:'', image:''}); }}>Cancel</button>}
      </form>

      <div className="programs-list-admin">
        {programs.map(prog => (
          <div className="program-item" key={prog._id}>
            <h3>{prog.icon} {prog.title}</h3>
            <p>{prog.desc}</p>
            <div className="admin-actions">
              <button onClick={() => handleEdit(prog)}>✏️ Edit</button>
              <button onClick={() => handleDelete(prog._id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}