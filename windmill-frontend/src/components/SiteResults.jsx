import React from 'react';
import './SiteResults.css';

function SiteResults({ data, onBack }) {
  const renderEnvironmentalConstraint = () => {
    const env = data.environmentalConstraint;
    if (!env) return 'No data';

    return (
      <ul>
        {env.protectedAreas && (
          <li>
            <strong>Protected Areas:</strong>{' '}
            {Array.isArray(env.protectedAreas)
              ? env.protectedAreas.join(', ')
              : env.protectedAreas}
          </li>
        )}
        {env.urbanProximity && (
          <li>
            <strong>Urban Proximity:</strong> {env.urbanProximity}
          </li>
        )}
        {env.amenities && (
          <li>
            <strong>Amenities:</strong> {env.amenities}
          </li>
        )}
      </ul>
    );
  };

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
        <div className="result-card">
          <p className="label">Elevation</p>
          <p>{data.elevation} m</p>
        </div>
        <div className="result-card">
          <p className="label">Grid Distance</p>
          <p>{data.gridDistance}</p>
        </div>
        <div className="result-card wide">
          <p className="label">Environmental Constraint</p>
          {renderEnvironmentalConstraint()}
        </div>
        <div className="result-card wide">
          <p className="label">AI Assessment</p>
          <p>{data.geminiConclusion}</p>
        </div>
      </div>

      <button className="back-btn" onClick={onBack}>New Search</button>
    </div>
  );
}

export default SiteResults;
