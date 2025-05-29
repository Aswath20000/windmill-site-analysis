const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getGeminiAssessment(data) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You're an expert in renewable energy systems. Given the following wind site analysis parameters, assess whether a wind turbine can be installed. If not, explain why. If yes, provide a concise suggestion.

Use the following criteria to assess if a wind turbine can be installed:
- If average wind speed < 4.5 m/s → Not viable
- If wind consistency < 50% → Not viable
- If site is in protected area, forest, or if there are more than 4 Amenities consider it a city→ Not viable
- If grid distance > 20 km → Not viable

Otherwise → Viable

Parameters:
- Latitude: ${data.latitude}
- Longitude: ${data.longitude}
- Wind Speed: ${data.averageSpeed} m/s
- Consistency: ${data.consistency}%
- Elevation: ${data.elevation} m
- Grid Distance: ${data.gridDistance}
- Environmental Constraints: 
  - Protected Areas: ${data.environmentalConstraint.protectedAreas}
  - Forest: ${data.environmentalConstraint.forest}
  - Urban Proximity: ${data.environmentalConstraint.urbanProximity}
  - Amenities: ${data.environmentalConstraint.amenities}

Respond in 5-6 lines.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

module.exports = getGeminiAssessment;
