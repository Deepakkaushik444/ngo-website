// frontend/src/pages/MainSite/Home.jsx
import { useState, useEffect, useRef } from "react";
import { ParallaxBanner } from "react-scroll-parallax";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { 
  FaDonate, FaHandsHelping, FaChild, FaFemale, FaHeartbeat, FaSchool, 
  FaTimes, FaFilePdf, FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, 
  FaTwitter, FaInstagram, FaLinkedin, FaArrowRight 
} from "react-icons/fa";
import "./Home.css";

// Gallery images
const galleryImages = [
  { original: "/images/logo.jpeg", title: "Activities" },
  { original: "/images/game.png", title: "Game" },
  { original: "/images/yoga.png", title: "Yoga Program" },
  { original: "/images/logo.jpeg", title: "Activities" },
  { original: "/images/logo1 (1).jpeg", title: "Activities" },
  { original: "/images/logo1 (2).jpeg", title: "Activities" },
  { original: "/images/logo1 (3).jpeg", title: "Activities" },
  { original: "/images/logo1 (4).jpeg", title: "Activities" },
  { original: "/images/logo1 (5).jpeg", title: "Activities" },
  { original: "/images/logo1 (6).jpeg", title: "Activities" },
  { original: "/images/logo2 (2).jpeg", title: "Activities" },
  { original: "/images/logo2 (1).jpeg", title: "Activities" },
  { original: "/images/logo2 (2).jpeg", title: "Activities" },
  { original: "/images/logo2 (3).jpeg", title: "Activities" },
  { original: "/images/logo2 (4).jpeg", title: "Activities" },
  { original: "/images/logo2 (5).jpeg", title: "Activities" },
  { original: "/images/logo2 (6).jpeg", title: "Activities" },
  { original: "/images/logo2 (7).jpeg", title: "Activities" },
  { original: "/images/logo2 (8).jpeg", title: "Activities" },
  { original: "/images/logo2 (9).jpeg", title: "Activities" },
  { original: "/images/logo2 (10).jpeg", title: "Activities" },

  { original: "/images/price.png", title: "Price Distribution" },
  { original: "/images/playschool.jpeg", title: "School Support" },
];

const testimonials = [
  { name: "Shri Karmvir Shastri (Principal)", text: "संस्था द्वारा बच्चों की शिक्षा में अद्भुत कार्य किया जा रहा है।", role: "Principal, Aadarsh Sr. Sec. School" },
  { name: "Smt. Sita Devi (Sarpanch)", text: "महिला सशक्तिकरण के क्षेत्र में यह संस्था मील का पत्थर है।", role: "Sarpanch, Mandhana" },
];

const programs = [
  { title: "Bal Vikas Vatika", desc: "Holistic child development & education", icon: <FaChild /> },
  { title: "Women Empowerment", desc: "Skill development & self-help groups", icon: <FaFemale /> },
  { title: "Health Camps", desc: "Free medical checkups & awareness", icon: <FaHeartbeat /> },
  { title: "School Support", desc: "Infrastructure & learning materials", icon: <FaSchool /> },
];

const csrOptions = [
  { amount: "₹2,000", description: "Child Education Kit" },
  { amount: "₹10,000", description: "Ramayan Quiz / Cultural Event Sponsorship" },
  { amount: "₹50,000", description: "Complete Yoga & Women Health Camp" },
];

function StatCard({ value, label, suffix = "+" }) {
  return (
    <div className="stat-card">
      <div className="stat-number">{value}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Home() {
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Refs for animated sections
  const statsRef = useRef(null);
  const programsRef = useRef(null);
  const galleryRef = useRef(null);
  const testimonialsRef = useRef(null);

  // Animated background floating particles
  useEffect(() => {
    const icons = ["❤️", "🤝", "🌱", "📚", "🏥", "🍲", "🎓", "🌍", "🕊️", "🤲", "✨"];
    for (let i = 0; i < 24; i++) {
      const div = document.createElement('div');
      div.classList.add('floating-bg-particle');
      div.style.left = Math.random() * 100 + '%';
      div.style.animationDelay = Math.random() * 20 + 's';
      div.style.animationDuration = 18 + Math.random() * 30 + 's';
      div.style.fontSize = 1.3 + Math.random() * 2 + 'rem';
      div.innerHTML = icons[Math.floor(Math.random() * icons.length)];
      document.body.appendChild(div);
    }
    return () => {
      document.querySelectorAll('.floating-bg-particle').forEach(el => el.remove());
    };
  }, []);

  // Scroll‑triggered animations (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );

    const sections = [statsRef.current, programsRef.current, galleryRef.current, testimonialsRef.current];
    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const handleOpenQR = () => setShowQRModal(true);
  const handleCloseQR = () => setShowQRModal(false);

  const handleDownloadCSR = () => {
    const link = document.createElement('a');
    link.href = '/files/csr-certificate.pdf';
    link.download = 'csr-certificate.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDownloadReceipt = () => {
    const link = document.createElement('a');
    link.href = '/receipt.pdf';
    link.download = 'donation_receipt.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDonateClick = () => {
    handleDownloadReceipt();
    handleOpenQR();
  };
  const handleOpenCSR = () => {
    window.open('/files/csr-certificate.pdf', '_blank');
  };

  return (
    <>
      {/* Hero Parallax Banner */}
      <ParallaxBanner
        layers={[
          {
            image: "/images/food_1.png",
            speed: -20,
            children: (
              <video autoPlay loop muted playsInline className="hero-video">
                <source src="/videos/videoplayback.mp4" type="video/mp4" />
              </video>
            ),
          },
          {
            speed: 10,
            children: (
              <div className="hero-overlay">
                <div className="hero-content">
                  <h1>Ma Indrawti Devi <br /> Nari Shakti Foundation</h1>
                  <p>Shakti • Seva • Samarpan</p>
                  <button className="donate-btn" onClick={handleOpenQR}>Donate Now</button>
                </div>
              </div>
            ),
          },
        ]}
        className="hero-banner"
      />

      {/* Who We Are (static, no animation) */}
      <section className="section who-we-are">
        <div className="container">
          <h2>Who We Are</h2>
          <p>A community-based NGO transforming lives through education, women empowerment, and rural development.</p>
          <div className="trust-badges">
            <span>✅ 80G Certified</span>
            <span>✅ 12A Registered</span>
            <span>✅ Darpan ID: HR/2025/0859355</span>
          </div>
        </div>
      </section>

      {/* Impact Stats - animated */}
      <section className="section stats-section animate-on-scroll" ref={statsRef}>
        <div className="container">
          <h2 >Our Impact So Far</h2>
          <div className="stats-grid">
            <StatCard value={500} label="Children Supported" />
            <StatCard value={200} label="Women Empowered" />
            <StatCard value={50} label="Health Programs" />
            <StatCard value={10} label="Schools Adopted" />
          </div>
        </div>
      </section>

      {/* Key Programs - animated */}
      <section className="section programs-section animate-on-scroll" ref={programsRef}>
        <div className="container">
          <h2>Our Key Programs</h2>
          <div className="programs-grid">
            {programs.map((p, idx) => (
              <div key={idx} className="program-card">
                <div className="program-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery - animated */}
      <section className="section gallery-section animate-on-scroll" ref={galleryRef}>
        <div className="container">
          <h2>Our Activities in Photos</h2>
          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 4000 }}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            className="gallery-swiper"
          >
            {galleryImages.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="gallery-item">
                  <img src={img.original} alt={img.title} loading="lazy" />
                  <div className="gallery-caption">{img.title}</div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Testimonials - animated */}
      <section className="section testimonials-section animate-on-scroll" ref={testimonialsRef}>
        <div className="container">
          <h2>Community Says</h2>
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            spaceBetween={30}
            slidesPerView={1}
            className="testimonial-swiper"
          >
            {testimonials.map((t, i) => (
              <SwiperSlide key={i}>
                <div className="testimonial-card">
                  <p>"{t.text}"</p>
                  <h4>{t.name}</h4>
                  <span>{t.role}</span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* CSR Section (static, no animation) */}
      <section className="section csr-section">
        <div className="container">
          <h2>CSR & Partnership Opportunities</h2>
          <p className="csr-intro">
            Corporate partners can support <strong>Ma Indrawti Devi Nari Shakti Foundation</strong> under CSR for education, health, and women empowerment initiatives in rural Haryana.
          </p>
          <div className="csr-options">
            {csrOptions.map((opt, idx) => (
              <div key={idx} className="csr-card">
                <div className="csr-amount">{opt.amount}</div>
                <div className="csr-desc">{opt.description}</div>
              </div>
            ))}
          </div>
          <div className="csr-actions">
            <button onClick={handleDownloadCSR} className="csr-download-btn">
              <FaFilePdf /> Download CSR Certificate
            </button>
            <button onClick={handleOpenCSR} className="csr-view-btn">
              👁️ View Certificate
            </button>
          </div>
        </div>
      </section>

      {/* Donation CTA (static) */}
      <section className="cta-section">
        <div className="container">
          <h2>Support Our Mission</h2>
          <p>Your donation can change lives. Partner with us for CSR.</p>
          <div className="cta-buttons">
            <button className="cta-primary" onClick={handleDonateClick}>
              <FaDonate /> Donate Now
            </button>
            <a href="https://wa.me/917015700961?text=Hello%20I%20want%20to%20become%20a%20partner%20with%20your%20NGO" target="_blank" rel="noopener noreferrer">
              <button className="cta-secondary">
                <FaHandsHelping /> Become a Partner
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-about">
              <h3>Ma Indrawti Devi Nari Shakti Foundation</h3>
              <p>Empowering rural communities through education, health, and women's upliftment since 2025.</p>
              <div className="footer-social">
                <a href="https://www.facebook.com/share/1AfvkyJaAQ/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
                <a href="https://www.instagram.com/ngoindu?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
              </div>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About Us</a></li>
                <li><a href="/programs">Programs</a></li>
                <li><a href="/gallery">Gallery</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/volunteer">Volunteer</a></li>
              </ul>
            </div>
            <div className="footer-contact">
              <h4>Contact Info</h4>
              <p><FaMapMarkerAlt /> Parshuram Chowk, Damodar Pana, Mandhana, Bhiwani - 127032, Haryana</p>
              <p><FaPhone /> +91 70157 00961</p>
              <p><FaEnvelope /> contact@indufoundation.org.in</p>
            </div>
            <div className="footer-newsletter">
              <h4>Stay Updated</h4>
              <p>Subscribe to our newsletter for latest updates and stories.</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your email address" required />
                <button type="submit"><FaArrowRight /></button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Ma Indrawti Devi Nari Shakti Foundation. All rights reserved.</p>
            <p>Built with ❤️ for social impact | Registered under Societies Registration Act, 1860</p>
          </div>
        </div>
      </footer>

      {/* QR Modal */}
      {showQRModal && (
        <div className="qr-modal-overlay" onClick={handleCloseQR}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="qr-modal-close" onClick={handleCloseQR}>
              <FaTimes />
            </button>
            <div className="qr-modal-body">
              <h3>Scan to Donate</h3>
              <img src="/images/qrfinal.jpeg" alt="Donation QR Code" className="qr-image" />
              <p className="qr-note">Scan with any UPI app to support our cause</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}