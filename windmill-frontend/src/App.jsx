import React, { useState, useRef, useEffect } from 'react';
import CoordinateForm from './components/CoordinateForm';
import MapSelector from './components/MapSelector';
import SiteResults from './components/SiteResults';
import "./App.css";
import windVideo from './wind.mp4'; // Update path to your MP4 file

function App() {
  const [location, setLocation] = useState(null);
  const [siteData, setSiteData] = useState(null);
  const [view, setView] = useState('form');
  const [loadingMessage, setLoadingMessage] = useState('Analyzing location...');
  const videoRef = useRef(null);

  // Handle video looping
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // Slow down the video
    }
  }, []);

  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleAnalyze = async (lat, lon, radius) => {
    setLocation({ lat, lon, radius });
    setView('loading');
    
    // Progressive loading messages
    const messages = [
      'Connecting to weather API...',
      'Fetching wind data...',
      'Analyzing terrain...',
      'Checking environmental factors...',
      'Generating report...'
    ];
    
    messages.forEach((msg, i) => {
      setTimeout(() => setLoadingMessage(msg), i * 1500);
    });
    
    try {
      const res = await fetch('http://localhost:5001/api/site-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon })
      });
      
      if (!res.ok) throw new Error('API request failed');
      
      const data = await res.json();
      setSiteData(data);
      setView('result');
    } catch (error) {
      console.error('API Error:', error);
      setLoadingMessage('Analysis failed. Please try again.');
      setTimeout(() => setView('form'), 2000);
    }
  };

  return (
    <div className="app-container">
      {/* MP4 Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        onEnded={handleVideoEnd}
        className="wind-background"
      >
        <source src={windVideo} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
      
      <div className="content-wrapper">
        <header className="app-header">
          <h1 className="app-title">🌬️ Wind Farm Site Analyzer</h1>
          <p className="app-subtitle">Identify optimal locations for wind energy production</p>
        </header>
        
        {view === 'form' && (
          <div className="card-layout">
            <CoordinateForm 
              onAnalyze={handleAnalyze} 
              onOpenMap={() => setView('map')} 
            />
            
            <div className="card info-card">
              <div className="card-icon">🗺️</div>
              <h3>Map Selection</h3>
              <p>
                Click below to visually select your area of interest on our interactive map.
                The system will analyze wind patterns, terrain elevation, and environmental constraints.
              </p>
              <button 
                className="map-selector-btn" 
                onClick={() => setView('map')}
              >
                Open Map Tool
              </button>
            </div>
          </div>
        )}

        {view === 'map' && (
          <MapSelector 
            onSelect={(lat, lon) => handleAnalyze(lat, lon, 10)} 
            onClose={() => setView('form')}
          />
        )}

        {view === 'result' && siteData && (
          <SiteResults 
            data={siteData} 
            onBack={() => setView('form')} 
          />
        )}

        {view === 'loading' && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="wind-animation">
                <div className="wind-particle"></div>
                <div className="wind-particle"></div>
                <div className="wind-particle"></div>
              </div>
              <h3 className="loading-title">Site Analysis in Progress</h3>
              <p className="loading-message">{loadingMessage}</p>
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;