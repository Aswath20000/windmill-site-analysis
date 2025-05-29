import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapSelector.css';

// India's approximate center coordinates
const INDIA_CENTER = [20.5937, 78.9629];
const INDIA_ZOOM_LEVEL = 5;

// Custom green marker icon
const greenIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function LocationPicker({ position, setPosition }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    }
  });

  return position ? <Marker position={position} icon={greenIcon} /> : null;
}

function MapSelector({ onSelect, onClose }) {
  const [position, setPosition] = useState(null);

  return (
    <div className="map-selector-modal">
      <div className="map-header">
        <h2>Select Location in India</h2>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
      
      <div className="map-container">
        <MapContainer 
          center={INDIA_CENTER} 
          zoom={INDIA_ZOOM_LEVEL} 
          className="leaflet-container"
          minZoom={4}
          maxBounds={[
            [6.0, 68.0], // Southwest coordinates (approx. bounds of India)
            [36.0, 98.0]  // Northeast coordinates (approx. bounds of India)
          ]}
          maxBoundsViscosity={1.0} // Strict bounds
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationPicker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      
      <div className="map-footer">
        {position && (
          <div className="coordinates-display">
            <span>Lat: {position.lat.toFixed(4)}</span>
            <span>Lng: {position.lng.toFixed(4)}</span>
          </div>
        )}
        <button 
          className={`confirm-btn ${!position ? 'disabled' : ''}`}
          onClick={() => position && onSelect(position.lat, position.lng)}
          disabled={!position}
        >
          Analyze Selected Location
        </button>
      </div>
    </div>
  );
}

export default MapSelector;