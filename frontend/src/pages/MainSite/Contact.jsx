import { useState } from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22595.027413108273!2d76.1188087094248!3d28.91342986677385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391269000f924653%3A0xb67e0563c13ed402!2sParshuram%20chowk!5e1!3m2!1sen!2sin!4v1777463646907!5m2!1sen!2sin";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: "success", text: "Message sent successfully! We'll get back to you soon." });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(data.error || "Failed to send message.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus({ type: "error", text: "Something went wrong. Please try again later." });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <h1>Get in Touch</h1>
        <p className="contact-subtitle">We'd love to hear from you. Reach out with any questions or partnership inquiries.</p>

        <div className="contact-grid">
          {/* Contact Information Cards */}
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon"><FaMapMarkerAlt /></div>
              <h3>Our Location</h3>
              <p>Parshuram Chowk, Damodar Pana, Mandhana, <br />Bhiwani - 127032, Haryana</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><FaPhone /></div>
              <h3>Call Us</h3>
              <p>+91 70157 00961</p>
              <p className="info-sub">Mon-Sat, 10am-6pm</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><FaEnvelope /></div>
              <h3>Email Us</h3>
              <p>contact@indufoundation.org.in</p>
              <p className="info-sub">We respond within 24hrs</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><FaClock /></div>
              <h3>Office Hours</h3>
              <p>Monday - Saturday: 10:00 AM - 6:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form">
            <h2>Send a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <textarea name="message" rows="5" placeholder="Your Message" value={formData.message} onChange={handleChange} required></textarea>
              </div>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
              {submitStatus && (
                <div className={`submit-status ${submitStatus.type === "error" ? "error" : "success"}`}>
                  {submitStatus.text}
                </div>
              )}
            </form>

            {/* Social Links */}
            <div className="social-links">
              <a href="#" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-container">
          <iframe 
            title="NGO Location Map" 
            src={mapSrc}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
          ></iframe>
          <div className="map-overlay">
            <p><FaMapMarkerAlt /> Parshuram Chowk (W478+9HH), Mandhana, Bhiwani - 127032, Haryana</p>
          </div>
        </div>
      </div>
    </div>
  );
}