import React from 'react';
import './SiteResults.css';

function SiteResults({ data, onBack }) {
  return (
    <div className="site-results">
      <h3>Site Analysis Results</h3>
      <div className="result-grid">
        <div className="result-item">
          <span>Latitude</span>
          <p>{data.latitude}</p>
        </div>
        <div className="result-item">
          <span>Longitude</span>
          <p>{data.longitude}</p>
        </div>
        <div className="result-item">
          <span>Wind Speed</span>
          <p>{data.averageSpeed} m/s</p>
        </div>
        <div className="result-item">
          <span>Consistency</span>
          <p>{data.consistency}%</p>
        </div>
        <div className="result-item">
          <span>Viability</span>
          <p>{data.viability}</p>
        </div>
      </div>
      <button onClick={onBack}>New Search</button>
    </div>
  );
}

export default SiteResults;
