// Gallery.js
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay, EffectCoverflow, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import "./Gallery.css";

// --- Floating NGO Icons (animated particles) ---
const FloatingParticles = () => {
  const icons = ["❤️", "🤝", "🌱", "📚", "🏥", "🍲", "🎓", "🌍", "🕊️", "🤲", "✨", "⭐"];
  return (
    <>
      {[...Array(28)].map((_, i) => (
        <div
          key={i}
          className="floating-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${12 + Math.random() * 25}s`,
            fontSize: `${1 + Math.random() * 1.8}rem`,
            opacity: 0.1 + Math.random() * 0.15,
          }}
        >
          {icons[Math.floor(Math.random() * icons.length)]}
        </div>
      ))}
    </>
  );
};

// --- Counter animation with proper restart ---
const useCounter = (targetValue, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (targetValue === 0) {
      setCount(0);
      return;
    }
    let startTime = null;
    let animationFrame;
    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * targetValue));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };
    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);
  return count;
};

export default function Gallery() {
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState("carousel");
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [autoplaySpeed, setAutoplaySpeed] = useState(4000);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const swiperRef = useRef(null);
  const [animateStats, setAnimateStats] = useState(false);

  // Counters will animate once data is loaded
  const livesImpacted = 12500;
  const animatedLives = useCounter(animateStats ? livesImpacted : 0, 2000);
  const animatedMediaCount = useCounter(animateStats ? galleryMedia.length : 0, 1500);

  // Fetch images & videos
  useEffect(() => {
    const fetchAllMedia = async () => {
      try {
        setLoading(true);
        const videoRes = await fetch("https://ngo-website-wzab.onrender.com/api/posts");
        if (!videoRes.ok) throw new Error("Failed to fetch videos");
        const videosData = await videoRes.json();

        const galleryVideos = videosData.map((video) => ({
          type: "video",
          url: video.videoUrl,
          title: video.title || "Untitled",
          description: video.description || "",
        }));

        let galleryImages = [];
        try {
          const imageRes = await fetch("https://ngo-website-wzab.onrender.com/api/images");
          if (imageRes.ok) {
            const imagesData = await imageRes.json();
            galleryImages = imagesData.map((img) => ({
              type: "image",
              url: img.imageUrl,
              title: img.title,
              description: img.description,
            }));
          }
        } catch (imgErr) {
          console.warn("Could not fetch images:", imgErr);
        }

        const combined = [...galleryImages, ...galleryVideos];
        setGalleryMedia(combined);
        setFilteredMedia(combined);
      } catch (err) {
        console.error("Error loading gallery:", err);
        setError("Could not load media. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllMedia();
  }, []);

  // Start counter animation after loading finishes
  useEffect(() => {
    if (!loading) {
      setAnimateStats(true);
    }
  }, [loading]);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedMedia) return;
      if (e.key === "ArrowLeft") handlePrevMedia();
      if (e.key === "ArrowRight") handleNextMedia();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMedia, filteredMedia, selectedIndex]);

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    setFilteredMedia(filter === "all" ? galleryMedia : galleryMedia.filter((m) => m.type === filter));
    if (swiperRef.current?.swiper) swiperRef.current.swiper.slideTo(0, 0);
    closeModal();
  };

  const openModal = (media, index) => {
    setSelectedMedia(media);
    setSelectedIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedMedia(null);
    document.body.style.overflow = "auto";
  };

  const handlePrevMedia = () => {
    if (filteredMedia.length === 0) return;
    const newIndex = (selectedIndex - 1 + filteredMedia.length) % filteredMedia.length;
    setSelectedMedia(filteredMedia[newIndex]);
    setSelectedIndex(newIndex);
  };

  const handleNextMedia = () => {
    if (filteredMedia.length === 0) return;
    const newIndex = (selectedIndex + 1) % filteredMedia.length;
    setSelectedMedia(filteredMedia[newIndex]);
    setSelectedIndex(newIndex);
  };

  const toggleAutoplay = () => setAutoplayEnabled((prev) => !prev);
  const changeAutoplaySpeed = (speed) => {
    setAutoplaySpeed(speed);
    if (swiperRef.current?.swiper?.params.autoplay) {
      swiperRef.current.swiper.params.autoplay.delay = speed;
      if (autoplayEnabled) {
        swiperRef.current.swiper.autoplay.stop();
        swiperRef.current.swiper.autoplay.start();
      }
    }
  };

  // Skeletons
  const renderSkeleton = () => (
    <div className="skeleton-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image shimmer"></div>
          <div className="skeleton-text shimmer"></div>
          <div className="skeleton-text short shimmer"></div>
        </div>
      ))}
    </div>
  );

  // Carousel view
  const renderCarousel = () => (
    <Swiper
      ref={swiperRef}
      modules={[Pagination, Navigation, Autoplay, EffectCoverflow, Keyboard]}
      effect="coverflow"
      grabCursor
      centeredSlides
      slidesPerView="auto"
      coverflowEffect={{
        rotate: 45,
        stretch: 0,
        depth: 120,
        modifier: 1.2,
        slideShadows: true,
      }}
      pagination={{ clickable: true, dynamicBullets: true }}
      navigation
      autoplay={autoplayEnabled ? { delay: autoplaySpeed, disableOnInteraction: false } : false}
      keyboard={{ enabled: true }}
      breakpoints={{
        640: { slidesPerView: 1.2, spaceBetween: 15 },
        768: { slidesPerView: 2, spaceBetween: 25 },
        1024: { slidesPerView: 2.5, spaceBetween: 30 },
        1280: { slidesPerView: 3, spaceBetween: 40 },
      }}
      className="gallery-swiper"
    >
      {filteredMedia.map((media, idx) => (
        <SwiperSlide key={`${media.type}-${media.url}-${idx}`}>
          <div className="gallery-card" onClick={() => openModal(media, idx)}>
            {media.type === "image" ? (
              <img src={media.url} alt={media.title} loading="lazy" />
            ) : (
              <div className="video-thumb">
                <video
                  src={media.url}
                  preload="metadata"
                  muted
                  playsInline
                  className="video-thumbnail-element"
                />
                <div className="play-icon">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="gallery-card-overlay">
              <h3>{media.title}</h3>
              <p>{media.description}</p>
              <span className="media-type-badge">{media.type === "image" ? "📷 Photo" : "🎥 Video"}</span>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );

  // Grid view
  const renderGridView = () => (
    <div className="gallery-grid">
      {filteredMedia.map((media, idx) => (
        <div key={`grid-${media.type}-${media.url}-${idx}`} className="grid-card" onClick={() => openModal(media, idx)}>
          {media.type === "image" ? (
            <img src={media.url} alt={media.title} loading="lazy" />
          ) : (
            <div className="video-thumb">
              <video src={media.url} preload="metadata" muted playsInline className="video-thumbnail-element" />
              <div className="play-icon small">▶</div>
            </div>
          )}
          <div className="grid-card-info">
            <h4>{media.title}</h4>
            <p>{media.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="gallery-page">
        <FloatingParticles />
        <div className="gallery-hero">
          <div className="hero-content">
            <h1 className="gradient-text">Moments That Matter</h1>
            <p>Loading our journey of hope and impact...</p>
          </div>
        </div>
        <div className="container">{renderSkeleton()}</div>
      </div>
    );
  }

  if (error && filteredMedia.length === 0) {
    return (
      <div className="gallery-page">
        <FloatingParticles />
        <div className="container error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <FloatingParticles />

      {/* Hero Section */}
      <div className="gallery-hero">
        <div className="hero-content">
          <h1 className="gradient-text">Moments That Matter</h1>
          <p className="hero-subtitle">Explore the stories of hope, kindness and impact we create together.</p>
        </div>
      </div>

      {/* Stats Section with animated counters */}
      <div className="stats-section">
        <div className="container stats-container">
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-number">{animatedLives.toLocaleString()}+</div>
            <div className="stat-label">Lives Impacted</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📸</div>
            <div className="stat-number">{animatedMediaCount}</div>
            <div className="stat-label">Media Moments</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤝</div>
            <div className="stat-number">50+</div>
            <div className="stat-label">Community Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌍</div>
            <div className="stat-number">15+</div>
            <div className="stat-label">Cities Reached</div>
          </div>
        </div>
      </div>

      {/* Mission Quote */}
      <div className="mission-quote">
        “Every image tells a story of change. Every video captures a moment of hope.”
      </div>

      <div className="container">
        {/* Controls */}
        <div className="gallery-controls">
          <div className="filter-tabs">
            <button className={`filter-btn ${activeFilter === "all" ? "active" : ""}`} onClick={() => handleFilter("all")}>
              All Media
            </button>
            <button className={`filter-btn ${activeFilter === "image" ? "active" : ""}`} onClick={() => handleFilter("image")}>
              📷 Images
            </button>
            <button className={`filter-btn ${activeFilter === "video" ? "active" : ""}`} onClick={() => handleFilter("video")}>
              🎥 Videos
            </button>
          </div>
          <div className="view-controls">
            <div className="autoplay-control">
              <button className={`control-btn ${autoplayEnabled ? "active" : ""}`} onClick={toggleAutoplay}>
                {autoplayEnabled ? "⏸️" : "▶️"}
              </button>
              <div className="speed-dropdown">
                <button className="control-btn" onClick={() => setShowSpeedControl(!showSpeedControl)}>⚡</button>
                {showSpeedControl && (
                  <div className="speed-menu">
                    <button onClick={() => changeAutoplaySpeed(3000)}>3s</button>
                    <button onClick={() => changeAutoplaySpeed(4000)}>4s</button>
                    <button onClick={() => changeAutoplaySpeed(5000)}>5s</button>
                    <button onClick={() => changeAutoplaySpeed(7000)}>7s</button>
                  </div>
                )}
              </div>
            </div>
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === "carousel" ? "active" : ""}`} onClick={() => setViewMode("carousel")}>
                🎠 Carousel
              </button>
              <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                🔲 Grid
              </button>
            </div>
          </div>
        </div>

        {/* Media Display */}
        {filteredMedia.length === 0 ? (
          <div className="no-results">
            <p>No media found in this category.</p>
          </div>
        ) : viewMode === "carousel" ? (
          renderCarousel()
        ) : (
          renderGridView()
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="media-modal" onClick={closeModal}>
          <div className="modal-backdrop"></div>
          <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <button className="modal-prev" onClick={handlePrevMedia}>‹</button>
            <button className="modal-next" onClick={handleNextMedia}>›</button>
            {selectedMedia.type === "image" ? (
              <img src={selectedMedia.url} alt={selectedMedia.title} className="modal-media" />
            ) : (
              <video controls autoPlay className="modal-media" src={selectedMedia.url}>
                Your browser does not support the video tag.
              </video>
            )}
            <div className="modal-caption">
              <div className="modal-badge">{selectedMedia.type === "image" ? "📷 Photo" : "🎥 Video"}</div>
              <h3>{selectedMedia.title}</h3>
              <p>{selectedMedia.description}</p>
              <div className="modal-counter">
                {selectedIndex + 1} / {filteredMedia.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}