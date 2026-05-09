import { useState, useRef } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPaperPlane } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const formRef = useRef();

  // 🔁 REPLACE THESE WITH YOUR OWN EMAILJS CREDENTIALS
  const EMAILJS_SERVICE_ID = 'service_f6831yz';      // e.g., 'service_abc123'
  const EMAILJS_TEMPLATE_ID = 'template_612cddc';    // e.g., 'template_xyz789'
  const EMAILJS_PUBLIC_KEY = 'W8n2ZFS-d-NPjBeIK';      // e.g., 'user_abc123xyz'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    // Prepare template parameters exactly matching your EmailJS template variables
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (response.status === 200) {
        setStatus({
          type: 'success',
          text: 'Message sent successfully! We’ll get back to you soon.'
        });
        // Reset form on success
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('Unexpected response from EmailJS');
      }
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus({
        type: 'error',
        text: 'Failed to send message. Please check your EmailJS configuration or try again later.'
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="section-header">
          <h1>Get in Touch</h1>
          <p>Have questions or want to partner with us? Reach out – we’d love to hear from you.</p>
        </div>

        <div className="contact-grid">
          {/* Left – Info Cards */}
          <div className="contact-info">
            <div className="info-card">
              <div className="icon-circle"><FaMapMarkerAlt /></div>
              <h3>Our Location</h3>
              <p>Parshuram Chowk, Damodar Pana, Mandhana,<br />Bhiwani - 127032, Haryana</p>
            </div>
            <div className="info-card">
              <div className="icon-circle"><FaPhone /></div>
              <h3>Call Us</h3>
              <p>+91 70157 00961</p>
              <span className="info-sub">Mon-Sat, 10am–6pm</span>
            </div>
            <div className="info-card">
              <div className="icon-circle"><FaEnvelope /></div>
              <h3>Email Us</h3>
              <p>contact@indufoundation.org.in</p>
              <span className="info-sub">Response within 24h</span>
            </div>
            <div className="info-card">
              <div className="icon-circle"><FaClock /></div>
              <h3>Office Hours</h3>
              <p>Monday – Saturday: 10:00 AM – 6:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>

          {/* Right – Contact Form */}
          <div className="contact-form-wrapper">
            <h2>Send a Message</h2>
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="input-group">
                <input type="text" name="name" placeholder="Your Name *" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <input type="text" name="subject" placeholder="Subject *" value={formData.subject} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <textarea name="message" rows="5" placeholder="Your Message *" value={formData.message} onChange={handleChange} required></textarea>
              </div>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'} <FaPaperPlane />
              </button>
              {status && (
                <div className={`status-message ${status.type === 'error' ? 'error' : 'success'}`}>
                  {status.text}
                </div>
              )}
            </form>

            {/* Social Icons */}
            <div className="social-links">
              <a href="#" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div className="map-section">
          <iframe 
            title="NGO Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22595.027413108273!2d76.1188087094248!3d28.91342986677385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391269000f924653%3A0xb67e0563c13ed402!2sParshuram%20chowk!5e1!3m2!1sen!2sin!4v1777463646907!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
          <div className="map-overlay">
            <FaMapMarkerAlt /> Parshuram Chowk (W478+9HH), Mandhana, Bhiwani - 127032
          </div>
        </div>
      </div>
    </div>
  );
}