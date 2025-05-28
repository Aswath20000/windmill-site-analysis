import React, { useState } from 'react';
import CoordinateForm from './components/CoordinateForm';
import MapSelector from './components/MapSelector';
import SiteResults from './components/SiteResults';
import "./App.css";

function App() {
  const [location, setLocation] = useState(null);
  const [siteData, setSiteData] = useState(null);
  const [view, setView] = useState('form');

  const handleAnalyze = async (lat, lon, radius) => {
    setLocation({ lat, lon, radius });
    setView('loading');
    try {
      const res = await fetch('http://localhost:5001/api/site-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon })
      });
      const data = await res.json();
      setSiteData(data);
      setView('result');
    } catch {
      alert('API failed');
      setView('form');
    }
  };

  return (
    <div className="container">
      <h1 className="title">Wind Farm Site Selection</h1>
      {view === 'form' && (
        <div className="card-layout">
          <CoordinateForm onAnalyze={handleAnalyze} onOpenMap={() => setView('map')} />
          <div className="card">
            <h3>📍 Select from Map</h3>
            <p>
              Click the button below to open an interactive map where you can draw your area of interest.
            </p>
            <button className="secondary" onClick={() => setView('map')}>
              Open Map Selector
            </button>
          </div>
        </div>
      )}
      {view === 'map' && <MapSelector onSelect={(lat, lon) => handleAnalyze(lat, lon, 10)} />}
      {view === 'result' && siteData && (
  <>
    {console.log("✅ Received siteData:", siteData)}
    <SiteResults data={siteData} onBack={() => setView('form')} />
  </>
)}

      {view === 'loading' && <p className="loading">Analyzing...</p>}
    </div>
  );
}

export default App;
