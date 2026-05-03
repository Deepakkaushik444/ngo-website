import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import "./Gallery.css";

// Helper: Generate Cloudinary thumbnail from video URL
const getCloudinaryThumbnail = (videoUrl) => {
  if (!videoUrl) return null;
  if (videoUrl.includes("cloudinary.com/video/upload")) {
    return videoUrl.replace("/video/upload/", "/video/upload/so_0,w_800,h_600,c_fill/");
  }
  return null;
};

const DEFAULT_VIDEO_POSTER = "https://via.placeholder.com/800x600/2c3e50/ffffff?text=Video+Preview";

export default function Gallery() {
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    const fetchAllMedia = async () => {
      try {
        setLoading(true);

        // 1. Fetch videos from /api/posts
        const videoRes = await fetch("https://ngo-website-wzab.onrender.com/api/posts");
        if (!videoRes.ok) throw new Error("Failed to fetch videos");
        const videosData = await videoRes.json();

        const galleryVideos = videosData.map((video) => ({
          type: "video",
          url: video.videoUrl,
          title: video.title || "Untitled",
          description: video.description || "",
          poster: getCloudinaryThumbnail(video.videoUrl) || video.thumbnail || DEFAULT_VIDEO_POSTER,
        }));

        // 2. Fetch images from /api/images
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
          } else {
            console.warn("Images API not available, using no images");
          }
        } catch (imgErr) {
          console.warn("Could not fetch images:", imgErr);
          // Continue without images
        }

        // 3. Combine: images first, then videos (or any order you prefer)
        const combined = [...galleryImages, ...galleryVideos];
        setGalleryMedia(combined);
        setError(null);
      } catch (err) {
        console.error("Error loading gallery:", err);
        setError("Could not load media. Please try again later.");
        setGalleryMedia([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMedia();
  }, []);

  const openModal = (media) => setSelectedMedia(media);
  const closeModal = () => setSelectedMedia(null);

  if (loading) {
    return (
      <div className="gallery-page">
        <div className="container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="loading-spinner" style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <p>Loading moments that matter...</p>
        </div>
      </div>
    );
  }

  if (error && galleryMedia.length === 0) {
    return (
      <div className="gallery-page">
        <div className="container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <p style={{ color: "#e74c3c" }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (galleryMedia.length === 0) {
    return (
      <div className="gallery-page">
        <div className="container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <p>No content available yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <div className="container">
        <h1>Moments That Matter</h1>
        <p className="gallery-subtitle">Our journey through images and videos</p>

        {/* Swiper Carousel with Coverflow effect */}
        <Swiper
          modules={[Pagination, Navigation, Autoplay, EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          navigation
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 40 },
          }}
          className="gallery-swiper"
        >
          {galleryMedia.map((media, index) => (
            <SwiperSlide key={index}>
              <div className="gallery-card" onClick={() => openModal(media)}>
                {media.type === "image" ? (
                  <img src={media.url} alt={media.title} />
                ) : (
                  <div className="video-thumb">
                    <img src={media.poster} alt={media.title} />
                    <div className="play-icon">▶</div>
                  </div>
                )}
                <div className="gallery-card-overlay">
                  <h3>{media.title}</h3>
                  <p>{media.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Modal Lightbox */}
      {selectedMedia && (
        <div className="media-modal" onClick={closeModal}>
          <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            {selectedMedia.type === "image" ? (
              <img src={selectedMedia.url} alt={selectedMedia.title} className="modal-media" />
            ) : (
              <video controls autoPlay className="modal-media" poster={selectedMedia.poster}>
                <source src={selectedMedia.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <div className="modal-caption">
              <h3>{selectedMedia.title}</h3>
              <p>{selectedMedia.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}