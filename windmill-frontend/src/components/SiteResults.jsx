import React from 'react';
import './SiteResults.css';

function SiteResults({ data, onBack }) {
  return (
    <div className="site-results">
      <h2>Site Analysis Results</h2>

      <div className="result-grid">
        <div className="result-card">
          <p className="label">Latitude</p>
          <p>{data.latitude}</p>
        </div>
        <div className="result-card">
          <p className="label">Longitude</p>
          <p>{data.longitude}</p>
        </div>
        <div className="result-card">
          <p className="label">Wind Speed</p>
          <p>{data.averageSpeed} m/s</p>
        </div>
        <div className="result-card">
          <p className="label">Consistency</p>
          <p>{data.consistency} %</p>
        </div>
        <div className="result-card wide">
          <p className="label">Viability</p>
          <p>{data.viability}</p>
        </div>
      </div>

      <button className="back-btn" onClick={onBack}>New Search</button>
    </div>
  );
}

export default SiteResults;
