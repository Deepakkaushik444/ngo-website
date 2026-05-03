// pages/Admin/DonationPage.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import QRCode from "qrcode";
import './DonationPage.css';

const API_URL = "https://ngo-website-wzab.onrender.com/api";

export default function DonationPage() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    monthlyDonations: 0,
    totalDonors: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [filters, setFilters] = useState({ status: "all", search: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // State for UPI ID and QR generation
  const [upiId, setUpiId] = useState("your-ngo@okhdfcbank"); // default example
  const [tempUpiId, setTempUpiId] = useState("");
  const qrCanvasRef = useRef(null);

  // QR record form state
  const [qrDonation, setQrDonation] = useState({
    donorName: "",
    email: "",
    amount: "",
    transactionId: "",
    date: new Date().toISOString().slice(0, 10),
    message: "",
    status: "pending"
  });
  const [paymentProof, setPaymentProof] = useState(null);
  const [proofPreview, setProofPreview] = useState("");

  const itemsPerPage = 10;

  // Generate UPI URI from entered UPI ID
  const getUpiUri = (id) => {
    return `upi://pay?pa=${encodeURIComponent(id)}&pn=NGO%20Name&cu=INR`;
  };

  // Generate QR code whenever upiId changes
  useEffect(() => {
    if (qrCanvasRef.current && upiId) {
      const upiUri = getUpiUri(upiId);
      QRCode.toCanvas(qrCanvasRef.current, upiUri, { width: 180, margin: 2 }, (error) => {
        if (error) console.error("QR generation failed", error);
      });
    }
  }, [upiId]);

  // Save UPI ID to localStorage (optional) and apply
  const handleSetUpiId = () => {
    if (tempUpiId.trim()) {
      setUpiId(tempUpiId);
      localStorage.setItem("ngo_upi_id", tempUpiId);
      showToast("UPI ID updated! QR code regenerated.", "success");
    } else {
      showToast("Please enter a valid UPI ID", "error");
    }
  };

  // Load saved UPI ID from localStorage on mount
  useEffect(() => {
    const savedUpi = localStorage.getItem("ngo_upi_id");
    if (savedUpi) {
      setUpiId(savedUpi);
      setTempUpiId(savedUpi);
    }
  }, []);

  // Fetch donations from backend (unchanged)
  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      const res = await axios.get(`${API_URL}/donations?${params.toString()}`);
      setDonations(res.data);
      calculateStats(res.data);
    } catch (error) {
      showToast("Failed to load donations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [filters.status, filters.search]);

  useEffect(() => {
    applyFilters();
  }, [donations, filters]);

  const calculateStats = (donationsList) => {
    const total = donationsList.reduce((sum, d) => sum + d.amount, 0);
    const currentMonth = new Date().getMonth();
    const monthly = donationsList
      .filter(d => new Date(d.date).getMonth() === currentMonth)
      .reduce((sum, d) => sum + d.amount, 0);
    const donors = new Set(donationsList.map(d => d.email)).size;
    setStats({ totalDonations: total, monthlyDonations: monthly, totalDonors: donors });
  };

  const applyFilters = () => {
    let filtered = [...donations];
    if (filters.status !== "all") filtered = filtered.filter(d => d.status === filters.status);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(d =>
        d.donorName.toLowerCase().includes(s) ||
        d.email.toLowerCase().includes(s) ||
        d.transactionId.toLowerCase().includes(s)
      );
    }
    setFilteredDonations(filtered);
    setCurrentPage(1);
  };

  const handleRecordQRPayment = async (e) => {
    e.preventDefault();
    if (!qrDonation.donorName || !qrDonation.email || !qrDonation.amount || !qrDonation.transactionId) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (!paymentProof) {
      showToast("Please upload a payment screenshot", "error");
      return;
    }
    try {
      const payload = {
        ...qrDonation,
        amount: parseFloat(qrDonation.amount),
        paymentMethod: "qr_code",
        paymentProof: proofPreview,
        date: qrDonation.date || new Date().toISOString()
      };
      await axios.post(`${API_URL}/donations`, payload);
      showToast("QR Payment recorded successfully!", "success");
      setShowQRModal(false);
      resetQRForm();
      fetchDonations();
    } catch (error) {
      showToast("Error recording payment", "error");
    }
  };

  const resetQRForm = () => {
    setQrDonation({
      donorName: "", email: "", amount: "", transactionId: "",
      date: new Date().toISOString().slice(0, 10), message: "", status: "pending"
    });
    setPaymentProof(null);
    setProofPreview("");
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/donations/${id}/status`, { status: newStatus });
      fetchDonations();
      showToast(`Status updated to ${newStatus}`, "success");
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();
  const formatAmount = (amt) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amt);

  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const currentItems = filteredDonations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="donation-container">
      <div className="donation-wrapper">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-header"><div className="stat-icon">💰</div><div className="stat-change positive">↑</div></div>
            <div className="stat-value">{formatAmount(stats.totalDonations)}</div>
            <div className="stat-label">Total Donations</div>
          </div>
          <div className="stat-card monthly">
            <div className="stat-header"><div className="stat-icon">📅</div><div className="stat-change positive">↑</div></div>
            <div className="stat-value">{formatAmount(stats.monthlyDonations)}</div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-card donors">
            <div className="stat-header"><div className="stat-icon">👥</div><div className="stat-change positive">↑</div></div>
            <div className="stat-value">{stats.totalDonors}</div>
            <div className="stat-label">Total Donors</div>
          </div>
        </div>

        {/* QR Code Generator Section */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginBottom: "1rem" }}>📱 Donation QR Code (UPI)</h3>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <canvas ref={qrCanvasRef} style={{ width: "180px", height: "180px" }}></canvas>
              <button 
                className="action-btn" 
                style={{ marginTop: "0.5rem" }}
                onClick={() => {
                  if (qrCanvasRef.current) {
                    const link = document.createElement("a");
                    link.download = "donation-qr.png";
                    link.href = qrCanvasRef.current.toDataURL();
                    link.click();
                  }
                }}
              >
                Download QR
              </button>
            </div>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <div className="form-group">
                <label>Your UPI ID (e.g., name@bank)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder="Enter UPI ID"
                    value={tempUpiId}
                    onChange={(e) => setTempUpiId(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button className="save-btn" onClick={handleSetUpiId}>
                    Set & Generate
                  </button>
                </div>
                <small style={{ color: "#666" }}>Current: {upiId}</small>
              </div>
              <p style={{ fontSize: "13px", color: "#555", marginTop: "0.5rem" }}>
                Scan this QR code with any UPI app to donate. The QR code will update automatically when you change the UPI ID.
              </p>
            </div>
          </div>
        </div>

        <div className="donation-content">
          {/* Donations Table */}
          <div className="donations-table-container">
            <div className="section-header">
              <h2>Recent Donations</h2>
              <div className="filter-controls">
                <select className="filter-select" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                  <option value="all">All Status</option><option value="completed">Completed</option>
                  <option value="pending">Pending</option><option value="failed">Failed</option>
                </select>
                <div className="search-box">
                  <input type="text" placeholder="Search by donor, email, TXN ID" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
                </div>
              </div>
            </div>

            {loading ? <div className="loading"><div className="spinner"></div></div> : (
              <>
                <div className="table-responsive">
                  <table className="donations-table">
                    <thead><tr><th>Donor</th><th>Amount</th><th>Date</th><th>TXN ID</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {currentItems.map(d => (
                        <tr key={d._id}>
                          <td><div><strong>{d.donorName}</strong><br/><small>{d.email}</small></div></td>
                          <td className="amount">{formatAmount(d.amount)}</td>
                          <td>{formatDate(d.date)}</td>
                          <td><code>{d.transactionId}</code></td>
                          <td>
                            <select className={`status-badge status-${d.status}`} value={d.status} onChange={e => handleStatusChange(d._id, e.target.value)}>
                              <option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option>
                            </select>
                          </td>
                          <td><button className="action-btn view-btn" onClick={() => { setSelectedDonation(d); setShowModal(true); }}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredDonations.length === 0 && <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No donations found</h3></div>}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}>Previous</button>
                    {[...Array(totalPages)].map((_,i) => <button key={i} className={`page-btn ${currentPage===i+1?'active':''}`} onClick={()=>setCurrentPage(i+1)}>{i+1}</button>)}
                    <button className="page-btn" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)}>Next</button>
                  </div>
                )}
              </>
            )}
          </div>

          <button className="submit-btn" style={{ marginTop: "1rem", backgroundColor: "#2c3e50" }} onClick={() => setShowQRModal(true)}>
            📷 Record QR Code Payment
          </button>
        </div>
      </div>

      {/* Record QR Payment Modal (same as before) */}
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "550px" }}>
            <div className="modal-header"><h3>Record Payment from QR Scan</h3><button className="close-modal" onClick={() => setShowQRModal(false)}>×</button></div>
            <div className="modal-body">
              <form onSubmit={handleRecordQRPayment}>
                <div className="form-group">
                  <label>Upload Payment Screenshot <span className="required">*</span></label>
                  <input type="file" accept="image/*" onChange={handleFileChange} required />
                  {proofPreview && <img src={proofPreview} alt="Proof" style={{ maxWidth: "100%", maxHeight: "150px", marginTop: "10px", borderRadius: "8px" }} />}
                </div>
                <div className="form-group"><label>Donor Name<span className="required">*</span></label><input type="text" value={qrDonation.donorName} onChange={e=>setQrDonation({...qrDonation, donorName: e.target.value})} required /></div>
                <div className="form-group"><label>Email<span className="required">*</span></label><input type="email" value={qrDonation.email} onChange={e=>setQrDonation({...qrDonation, email: e.target.value})} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>Amount ($)<span className="required">*</span></label><input type="number" step="0.01" value={qrDonation.amount} onChange={e=>setQrDonation({...qrDonation, amount: e.target.value})} required /></div>
                  <div className="form-group"><label>Transaction ID<span className="required">*</span></label><input type="text" value={qrDonation.transactionId} onChange={e=>setQrDonation({...qrDonation, transactionId: e.target.value})} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Date</label><input type="date" value={qrDonation.date} onChange={e=>setQrDonation({...qrDonation, date: e.target.value})} /></div>
                  <div className="form-group"><label>Status</label><select value={qrDonation.status} onChange={e=>setQrDonation({...qrDonation, status: e.target.value})}><option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option></select></div>
                </div>
                <div className="form-group"><label>Message (optional)</label><textarea rows="2" value={qrDonation.message} onChange={e=>setQrDonation({...qrDonation, message: e.target.value})} /></div>
                <div className="modal-actions"><button type="submit" className="save-btn">Save Payment</button><button type="button" className="cancel-btn" onClick={() => setShowQRModal(false)}>Cancel</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Donation Modal */}
      {showModal && selectedDonation && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Donation Details</h3><button className="close-modal" onClick={()=>setShowModal(false)}>×</button></div>
            <div className="modal-body">
              <div><strong>Donor:</strong> {selectedDonation.donorName}</div><div><strong>Email:</strong> {selectedDonation.email}</div>
              <div><strong>Amount:</strong> {formatAmount(selectedDonation.amount)}</div><div><strong>Transaction ID:</strong> {selectedDonation.transactionId}</div>
              <div><strong>Date:</strong> {formatDate(selectedDonation.date)}</div><div><strong>Status:</strong> {selectedDonation.status}</div>
              {selectedDonation.message && <div><strong>Message:</strong> {selectedDonation.message}</div>}
              {selectedDonation.paymentProof && <div><strong>Payment Proof:</strong><br/><img src={selectedDonation.paymentProof} alt="proof" style={{ maxWidth: "100%", marginTop: "10px", borderRadius: "8px" }} /></div>}
            </div>
          </div>
        </div>
      )}

      {toast.show && <div className={`toast-notification toast-${toast.type}`}><span>{toast.type==="success"?"✅":"❌"}</span> {toast.message}</div>}
    </div>
  );
}