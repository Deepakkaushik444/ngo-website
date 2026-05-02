// frontend/src/pages/MainSite/Home.jsx
import { useState } from "react";
import { ParallaxBanner } from "react-scroll-parallax";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { FaDonate, FaHandsHelping, FaChild, FaFemale, FaHeartbeat, FaSchool, FaTimes, FaFilePdf } from "react-icons/fa";
import "./Home.css";

// Gallery images
const galleryImages = [
  { original: "/images/youth.png", title: "Motivation" },
  { original: "/images/game.png", title: "Game" },
  { original: "/images/yoga.png", title: "Yoga Program" },
  { original: "/images/ration.jpeg", title: "Ration Kit Distribution" },
  { original: "/images/price.png", title: "Price Distribution" },
  { original: "/images/playschool.jpeg", title: "School Support" },
];

const testimonials = [
  { name: "Shri Ramesh Sharma (Principal)", text: "संस्था द्वारा बच्चों की शिक्षा में अद्भुत कार्य किया जा रहा है।", role: "Principal, Govt School" },
  { name: "Smt. Sushila Devi (Sarpanch)", text: "महिला सशक्तिकरण के क्षेत्र में यह संस्था मील का पत्थर है।", role: "Sarpanch, Damodar Pana" },
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

  const handleOpenQR = () => setShowQRModal(true);
  const handleCloseQR = () => setShowQRModal(false);

  // CSR PDF handlers
  const handleDownloadCSR = () => {
    const link = document.createElement('a');
    link.href = '/files/csr-certificate.pdf'; // adjust path as needed
    link.download = 'csr-certificate.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDownloadReceipt = () => {
  // Create a link to a static file in your public folder
  const link = document.createElement('a');
  link.href = '/receipt.pdf';     // place receipt.pdf in public/
  link.download = 'donation_receipt.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const handleDonateClick = () => {
  handleDownloadReceipt();   // download file
  handleOpenQR();            // open QR modal (existing)
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

      {/* Who We Are */}
      <section className="section who-we-are">
        <div className="container">
          <h2>Who We Are</h2>
          <p>A community-based NGO transforming lives through education, women empowerment, and rural development.</p>
          <div className="trust-badges">
            <span>✅ 80G Certified</span>
            <span>✅ 12A Registered</span>
            <span>✅ Darpan ID: HR/2024/123456</span>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="section stats-section">
        <div className="container">
          <h2>Our Impact So Far</h2>
          <div className="stats-grid">
            <StatCard value={500} label="Children Supported" />
            <StatCard value={200} label="Women Empowered" />
            <StatCard value={50} label="Health Programs" />
            <StatCard value={10} label="Schools Adopted" />
          </div>
        </div>
      </section>

      {/* Key Programs */}
      <section className="section programs-section">
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

      {/* Gallery */}
      <section className="section gallery-section">
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

      {/* Testimonials */}
      <section className="section testimonials-section">
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

      {/* CSR & Partnership Opportunities */}
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
              👁️ View Certificate (opens in new tab)
            </button>
          </div>
        </div>
      </section>

      {/* Donation CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Support Our Mission</h2>
          <p>Your donation can change lives. Partner with us for CSR.</p>
          <div className="cta-buttons">
            <button className="cta-primary" onClick={handleDonateClick} >
              <FaDonate /> Donate Now
            </button>
            <a href="https://wa.me/917015700961?text=Hello%20I%20want%20to%20become%20a%20partner%20with%20your%20NGO" target="_blank" >
            <button className="cta-secondary">
              <FaHandsHelping /> Become a Partner
            </button>
            </a>
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="qr-modal-overlay" onClick={handleCloseQR}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="qr-modal-close" onClick={handleCloseQR}>
              <FaTimes />
            </button>
            <div className="qr-modal-body">
              <h3>Scan to Donate</h3>
              <img src="/images/qr1.jpg" alt="Donation QR Code" className="qr-image" />
              <p className="qr-note">Scan with any UPI app to support our cause</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}