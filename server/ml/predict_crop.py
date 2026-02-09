import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Mock training data for demonstration (normally loaded from CSV)
# Features: [N, P, K, Temp, Humidity, pH, Rainfall]
X_train = np.array([
    [90, 42, 43, 20.8, 82.0, 6.5, 202.9], # Rice
    [85, 58, 41, 21.7, 80.3, 7.0, 226.6], # Rice
    [60, 55, 44, 23.0, 80.0, 7.1, 200.0], # Rice
    [10, 20, 30, 25.0, 50.0, 6.0, 100.0], # Maize
    [20, 30, 40, 24.0, 45.0, 5.5, 90.0],  # Maize
    [0, 15, 25, 22.0, 60.0, 6.2, 80.0],   # Chickpea
    [100, 10, 50, 26.0, 85.0, 6.6, 50.0], # Watermelon
])
y_train = np.array(['rice', 'rice', 'rice', 'maize', 'maize', 'chickpea', 'watermelon'])

# Train a simple model on the fly
model = RandomForestClassifier(n_estimators=10, random_state=42)
model.fit(X_train, y_train)

def predict():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        features = np.array([[
            input_data['nitrogen'],
            input_data['phosphorus'],
            input_data['potassium'],
            input_data['temperature'],
            input_data['humidity'],
            input_data['ph'],
            input_data['rainfall']
        ]])
        
        prediction = model.predict(features)[0]
        
        print(json.dumps({"prediction": prediction}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict()
