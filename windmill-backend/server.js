const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { PythonShell } = require('python-shell');

const app = express();
app.use(cors());
app.use(express.json());

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
    res.status(500).json({ error: 'Wind data fetch failed' });
  }
});

app.post('/api/site-analysis', async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    const wind = await axios.get('http://localhost:5001/api/wind', {
      params: { lat: latitude, lon: longitude }
    });
    const windSpeeds = wind.data.hourly?.wind_speed_10m || [];
    const averageSpeed = windSpeeds.length > 0
      ? parseFloat((windSpeeds.reduce((sum, s) => sum + s, 0) / windSpeeds.length).toFixed(1))
      : 8.2;
    const consistency = 78; // mock value
    res.json({
      latitude,
      longitude,
      averageSpeed,
      consistency,
      viability: averageSpeed > 7.5 ? 'High' : 'Low'
    });
  } catch (err) {
    res.status(500).json({ error: 'Site analysis failed' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
