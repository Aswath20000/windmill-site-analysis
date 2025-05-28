import joblib
import numpy as np

# Load the trained model
model = joblib.load('viability_random_forest_model.pkl')

# Example input: [wind speed at 100m (m/s), consistency (%)]
# You can modify this with your own values
input_data = np.array([[2.6, 45]])  # Replace with your test values

# Predict viability score
predicted_score = model.predict(input_data)

print(f"Input: {input_data[0]}")
print(f"Predicted Viability Score: {predicted_score[0]:.2f}")
