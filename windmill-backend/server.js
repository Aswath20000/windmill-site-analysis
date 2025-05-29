// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const haversine = require('haversine-distance');
require('dotenv').config();
const getGeminiAssessment = require('./utiles/geminiAssessment');

const app = express();
app.use(cors());
app.use(express.json());

// Wind Data Endpoint
app.get('/api/wind', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const result = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'wind_speed_10m',
        forecast_days: 7,
        timezone: 'auto'
      }
    });
    res.json(result.data);
  } catch (err) {
    console.error('Wind API Error:', err.message);
    res.status(500).json({ error: 'Wind data fetch failed' });
  }
});

// Site Analysis and Prediction
app.post('/api/site-analysis', async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    // 1. Wind Data
    const wind = await axios.get('http://localhost:5001/api/wind', {
      params: { lat: latitude, lon: longitude }
    });
    const windSpeeds = wind.data.hourly?.wind_speed_10m || [];
    const averageSpeed = windSpeeds.length > 0
      ? parseFloat((windSpeeds.reduce((sum, s) => sum + s, 0) / windSpeeds.length).toFixed(1))
      : 8.2;
    const stdDev = Math.sqrt(windSpeeds.reduce((acc, val) => acc + Math.pow(val - averageSpeed, 2), 0) / windSpeeds.length);
    const consistency = Math.max(0, Math.min(100, Math.round((1 - stdDev / averageSpeed) * 100)));

    // 2. Elevation
    const terrainRes = await axios.get('https://api.open-meteo.com/v1/elevation', {
      params: { latitude, longitude }
    });
    const elevation = terrainRes.data.elevation ?? 'N/A';

    // 3. Grid Distance
    const gridQuery = `
      [out:json];
      (
        way["power"="line"](around:20000,${latitude},${longitude});
        node["power"="line"](around:80000,${latitude},${longitude});
      );
      out center;`;
    const gridRes = await axios.post('https://overpass-api.de/api/interpreter', gridQuery, {
      headers: { 'Content-Type': 'text/plain' }
    });
    let gridDistance = 'N/A';

    if (gridRes.data.elements.length > 0) {
      const element = gridRes.data.elements.find(el =>
        (el.lat && el.lon) || (el.center?.lat && el.center?.lon)
      );

      if (element) {
        const nodeLat = element.lat ?? element.center?.lat;
        const nodeLon = element.lon ?? element.center?.lon;

        if (typeof nodeLat === 'number' && typeof nodeLon === 'number') {
          const dist = haversine(
            { lat: latitude, lon: longitude },
            { lat: nodeLat, lon: nodeLon }
          );
          gridDistance = `${(dist / 1000).toFixed(2)} km`;
        } else {
          console.warn("⚠️ Couldn't find valid coordinates in Overpass element:", element);
        }
      }
    }

    // 4. Environmental Constraints
    const radius = 1000;
    const envQuery = `
      [out:json];
      (
        way["boundary"="protected_area"](around:1000,${latitude},${longitude});
        relation["boundary"="protected_area"](around:1000,${latitude},${longitude});
        way["leisure"="nature_reserve"](around:1000,${latitude},${longitude});
        relation["leisure"="nature_reserve"](around:1000,${latitude},${longitude});
        way["landuse"="forest"](around:1000,${latitude},${longitude});
        relation["landuse"="forest"](around:1000,${latitude},${longitude});
        way["natural"="wood"](around:1000,${latitude},${longitude});
        relation["natural"="wood"](around:1000,${latitude},${longitude});
        node["place"~"city|town|village"](around:1000,${latitude},${longitude});
        node["amenity"](around:1000,${latitude},${longitude});
      );
      out body;`;
    const envRes = await axios.post('https://overpass-api.de/api/interpreter', envQuery, {
      headers: { 'Content-Type': 'text/plain' }
    });
    const elements = envRes.data.elements;
    const protectedAreas = elements.filter(el => el.tags?.boundary === 'protected_area' || el.tags?.leisure === 'nature_reserve');
    // const forest = elements.some(el => el.tags?.landuse === 'forest');
    const urbanProximity = elements.some(el => ['village', 'town', 'city'].includes(el.tags?.place));
    const amenities = elements.filter(el => el.tags?.amenity).map(el => el.tags.amenity);

    const environmentalConstraint = {
      protectedAreas: protectedAreas.length > 0 ? `${protectedAreas.length} protected area(s)` : 'None',
      // forest: forest ? 'Near forest' : 'Not near forest',
      urbanProximity: urbanProximity ? 'Near urban settlement' : 'Remote area',
      amenities: amenities.length > 0 ? [...new Set(amenities)].join(', ') : 'None'
    };

    // 5. Predict Viability
    const input = { wind_speed: averageSpeed, consistency };
    const shell = new PythonShell('predict_viability.py', { mode: 'json', pythonOptions: ['-u'] });
    shell.send(input);

    shell.on('message', async (message) => {
      const viabilityScore = message.predicted_viability;

      // 6. Gemini AI Conclusion
      const geminiConclusion = await getGeminiAssessment({
        latitude,
        longitude,
        averageSpeed,
        consistency,
        elevation,
        gridDistance,
        environmentalConstraint
      });

      res.json({
        latitude,
        longitude,
        averageSpeed,
        consistency,
        viability: `${viabilityScore}%`,
        elevation,
        gridDistance,
        environmentalConstraint,
        geminiConclusion
      });
    });

    shell.end(err => {
      if (err) {
        console.error('PythonShell Error:', err);
        res.status(500).json({ error: 'Prediction failed' });
      }
    });
  } catch (err) {
    console.error('Site analysis failed:', err.message);
    res.status(500).json({ error: 'Site analysis failed' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
