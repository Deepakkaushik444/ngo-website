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
          <p>Ma Indrawti Devi Nari Shakti Foundation का vision मुख्य रूप से एक ऐसे समाज का निर्माण करना है जहाँ:<br/>

               महिलाएँ आत्मनिर्भर और सशक्त हों <br/>

               हर बच्चे को शिक्षा और अच्छे संस्कार मिलें <br/>

               ग्रामीण क्षेत्रों का सामाजिक और शैक्षिक विकास हो <br/>

               योग, संस्कृति और नैतिक मूल्यों को बढ़ावा मिले <br/>

               जरूरतमंद लोगों को सम्मानपूर्वक सहायता प्राप्त हो <br/>

               समाज में समानता, जागरूकता और सेवा भावना विकसित हो <br/>

          </p>
          <h2>Our Mission</h2>
          <p>महिलाओं को शिक्षा, कौशल और जागरूकता के माध्यम से सशक्त बनाना<br/>

            गरीब एवं जरूरतमंद बच्चों को शिक्षा सहायता प्रदान करना<br/>

            ग्रामीण क्षेत्रों में सामाजिक और शैक्षिक विकास को बढ़ावा देना<br/>

            योग, स्वास्थ्य और नैतिक मूल्यों के प्रति जागरूकता फैलाना<br/>

            समाज के कमजोर वर्गों को सहयोग और आत्मनिर्भरता के अवसर देना<br/>

            सांस्कृतिक एवं सामाजिक कार्यक्रमों के माध्यम से सकारात्मक परिवर्तन लाना<br/>

            सेवा, समानता और मानवता की भावना को मजबूत करना<br/>

</p>
                         
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