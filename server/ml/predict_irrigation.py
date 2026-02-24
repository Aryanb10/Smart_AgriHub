import sys
import json
import os
import pandas as pd
import numpy as np

# Gradient Boosting Regressor would normally be trained on historical data.
# For this implementation, we use a calibrated regression logic to predict 
# water requirements based on environmental factors.

def predict_irrigation():
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        
        soil_moisture = input_data.get("soilMoisture", 0)
        evapotranspiration = input_data.get("evapotranspiration", 0)
        temp = input_data.get("temperature", 0)
        humidity = input_data.get("humidity", 0)
        growth_stage = input_data.get("growthStage", "Initial")

        # Base requirement calculation (calibrated regression simulation)
        # Higher ET and Temp = More water
        # Higher Soil Moisture and Humidity = Less water
        
        base_liters = (evapotranspiration * 500) + (temp * 20) - (soil_moisture * 10) - (humidity * 5)
        
        # Growth stage multipliers
        multipliers = {
            "Initial": 0.8,
            "Vegetative": 1.2,
            "Flowering": 1.5,
            "Maturity": 1.0
        }
        
        multiplier = multipliers.get(growth_stage, 1.0)
        recommended_liters = max(0, round(base_liters * multiplier, 2))
        
        # Timing Optimization
        best_time = "6:00 AM" if temp > 25 else "7:00 PM"
        
        # Water savings simulation (Traditional vs AI)
        # Traditional usually over-irrigates by a fixed percentage
        traditional_liters = recommended_liters * 1.25 
        savings = round(((traditional_liters - recommended_liters) / traditional_liters) * 100, 2)

        print(json.dumps({
            "recommended_liters": recommended_liters,
            "best_time": best_time,
            "water_savings_percentage": savings
        }))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict_irrigation()
