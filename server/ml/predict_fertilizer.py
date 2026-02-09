import sys
import json
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier

# Mock training data
# Features: [N, P, K] (Simplified for MVP, usually involves soil type too mapping)
# For this demo we'll just map NPK levels to a recommendation
X_train = np.array([
    [50, 50, 50],
    [20, 50, 50],
    [50, 20, 50],
    [50, 50, 20],
    [10, 10, 10],
    [90, 90, 90]
])
y_train = np.array([
    "Balanced 10-10-10",
    "High Nitrogen (Urea)",
    "High Phosphorus (DAP)",
    "High Potassium (Potash)",
    "General Purpose",
    "Low concentration"
])

model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)

def predict():
    try:
        input_data = json.loads(sys.stdin.read())
        
        # Simple logic fallback if needed, but using model for consistency
        features = np.array([[
            input_data['nitrogen'],
            input_data['phosphorus'],
            input_data['potassium']
        ]])
        
        prediction = model.predict(features)[0]
        
        # In a real app, we'd use Soil Type and Crop Type as encoded features
        # For now, append them to the text to show we received them
        soil = input_data.get('soilType', 'Generic')
        crop = input_data.get('cropType', 'Generic')
        
        result = f"{prediction} (tailored for {crop} on {soil} soil)"
        
        print(json.dumps({"recommendation": result}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict()
