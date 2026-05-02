import "./About.css";

export default function About() {
  const handleDownload = () => {
    // Create a link element
    const link = document.createElement('a');
    link.href = '/files/Activities.pdf'; // path to your PDF in public folder
    link.download = 'activity.pdf'; // downloaded filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPDF = () => {
    window.open('/files/Activities.pdf', '_blank');
  };

  return (
    <div className="about-page">
      <div className="container">
        <h1>About Us</h1>
        <div className="about-content">
          <p>Ma Indrawti Devi Nari Shakti Foundation is a community-based NGO dedicated to children's education, women empowerment, and rural development.</p>
          <p>Registered under the Societies Registration Act, we have been serving the Mandhana region of Bhiwani, Haryana since 2015.</p>
          
          <h2>Our Vision</h2>
          <p>To create a self-reliant and empowered society where every individual has access to education, health, and equal opportunities.</p>
          
          <h2>Our Mission</h2>
          <p>Empower marginalized communities through sustainable programs in education, vocational training, and healthcare.</p>
          
          {/* Download Button Section */}
          <div className="about-actions">
            <button onClick={handleDownload} className="download-btn">
              📄 Download Activity Report
            </button>
            <button onClick={handleOpenPDF} className="view-btn">
              👁️ View Report (open now)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}