import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt
import joblib
import numpy as np
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# Load the Excel file
df = pd.read_excel("labeled_wind_data_updated.xlsx")

# Show unique values to confirm mapping will work
print("Wind Quality values:", df['Wind Quality'].unique())
print("Consistency Quality values:", df['Consistency Quality'].unique())

# Map quality categories to numeric scores
wind_quality_map = {'Low': 0, 'Average': 1, 'High': 2}
consistency_quality_map = {'Poor': 0, 'Average': 1, 'Good': 2}

df['wind_quality_score'] = df['Wind Quality'].map(wind_quality_map)
df['consistency_quality_score'] = df['Consistency Quality'].map(consistency_quality_map)

# Compute viability score as a percentage
df['viability_score'] = (
    df['wind speed at 100m (m/s)'] * 5 +
    df['consistency (%)'] * 0.5
).clip(0, 100)


# Drop rows with NaNs in target or features
df = df.dropna(subset=['viability_score', 'wind speed at 100m (m/s)', 'consistency (%)'])

# Define features and target
X = df[['wind speed at 100m (m/s)', 'consistency (%)']]
y = df['viability_score']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train Random Forest model
rf = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
    n_jobs=-1  # Use all available CPU cores
)
rf.fit(X_train, y_train)

# Make predictions
y_pred = rf.predict(X_test)

# Evaluation metrics (manually calculate RMSE)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print(f"RMSE: {rmse:.3f}")
print(f"R² Score: {r2:.3f}")

# Plotting
plt.figure(figsize=(8, 6))
plt.scatter(y_test, y_pred, alpha=0.6, edgecolor='k')
plt.xlabel("Actual Viability Score")
plt.ylabel("Predicted Viability Score")
plt.title("Actual vs Predicted Viability Score")
plt.grid(True)
plt.tight_layout()
plt.show()

# Save the model
joblib.dump(rf, 'viability_random_forest_model.pkl')
print("Model saved as viability_random_forest_model.pkl")
