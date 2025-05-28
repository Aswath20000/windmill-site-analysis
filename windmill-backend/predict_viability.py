# predict_viability.py
import sys
import json
import joblib
import numpy as np

for line in sys.stdin:
    input_data = json.loads(line)
    wind_speed = input_data['wind_speed']
    consistency = input_data['consistency']

    # Load model
    model = joblib.load('viability_random_forest_model.pkl')

    # Predict
    features = np.array([[wind_speed, consistency]])
    prediction = model.predict(features)[0]

    # Output prediction
    print(json.dumps({'predicted_viability': round(prediction, 2)}))
    sys.stdout.flush()
    break  # only one prediction expected
