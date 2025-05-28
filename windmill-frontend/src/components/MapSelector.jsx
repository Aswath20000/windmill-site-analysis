import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './MapSelector.css';
import 'leaflet/dist/leaflet.css'; // REQUIRED for map tiles

// Custom green marker icon
const greenIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    }
  });

  return position ? <Marker position={position} icon={greenIcon} /> : null;
}

function MapSelector({ onSelect }) {
  const [position, setPosition] = useState(null);

  return (
    <div className="map-selector-wrapper">
      <div className="map-container">
        <MapContainer center={[20.0, 77.0]} zoom={4} className="leaflet-container">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LocationPicker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      {position && (
        <button className="confirm-btn" onClick={() => onSelect(position.lat, position.lng)}>
          Analyze Selected Area
        </button>
      )}
    </div>
  );
}

export default MapSelector;
