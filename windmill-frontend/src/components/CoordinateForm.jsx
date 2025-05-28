import React, { useState } from 'react';
import './CoordinateForm.css';

function CoordinateForm({ onAnalyze, onOpenMap }) {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [radius, setRadius] = useState('10');

  return (
    <div className="card coordinate-form">
      <h3>📌 Enter Coordinates</h3>
      <div className="form-group">
        <label>Latitude</label>
        <input type="text" value={lat} onChange={e => setLat(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Longitude</label>
        <input type="text" value={lon} onChange={e => setLon(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Search Radius (km)</label>
        <input type="text" value={radius} onChange={e => setRadius(e.target.value)} />
      </div>
      <button onClick={() => onAnalyze(lat, lon, radius)}>Analyze Location</button>
      <button className="secondary" onClick={onOpenMap}>Open Map Selector</button>
    </div>
  );
}

export default CoordinateForm;
