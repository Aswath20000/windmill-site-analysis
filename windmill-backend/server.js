const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { PythonShell } = require('python-shell');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to fetch wind data from Open-Meteo API
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

// Endpoint to perform site analysis and predict viability
app.post('/api/site-analysis', async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    // Fetch wind data
    const wind = await axios.get('http://localhost:5001/api/wind', {
      params: { lat: latitude, lon: longitude }
    });

    const windSpeeds = wind.data.hourly?.wind_speed_10m || [];
    const averageSpeed = windSpeeds.length > 0
      ? parseFloat((windSpeeds.reduce((sum, s) => sum + s, 0) / windSpeeds.length).toFixed(1))
      : 8.2; // fallback average

    const stdDev = Math.sqrt(
      windSpeeds.reduce((acc, val) => acc + Math.pow(val - averageSpeed, 2), 0) / windSpeeds.length
);
    const consistency = Math.max(0, Math.min(100, Math.round((1 - stdDev / averageSpeed) * 100)));

    const input = { wind_speed: averageSpeed, consistency };

    // Use PythonShell in stream mode
    const shell = new PythonShell('predict_viability.py', {
      mode: 'json',
      pythonOptions: ['-u']
    });

    shell.send(input);

    shell.on('message', (message) => {
      const viabilityScore = message.predicted_viability;
      res.json({
        latitude,
        longitude,
        averageSpeed,
        consistency,
        viability: `${viabilityScore}%`
      });
    });

    shell.end((err) => {
      if (err) {
        console.error('PythonShell error:', err);
        res.status(500).json({ error: 'Prediction failed' });
      }
    });

  } catch (err) {
    console.error('Site analysis failed:', err.message);
    res.status(500).json({ error: 'Site analysis failed' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
