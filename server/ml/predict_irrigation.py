import sys
import json
import os
import requests

def get_weather_data(api_key, city="London"):
    """
    Fetches live weather data from OpenWeatherMap API.
    In a real app, 'city' would be dynamic from user profile or input.
    """
    try:
        # We'll use a default city if none provided, but real app should use lat/lon or city from input
        url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
        response = requests.get(url)
        data = response.json()
        
        if response.status_code != 200:
            return None
            
        # Extract relevant info from the forecast (first 3-hour block)
        current = data['list'][0]
        temp = current['main']['temp']
        humidity = current['main']['humidity']
        
        # Check for rain in next 24 hours (8 blocks of 3h)
        rain_sum = 0
        for i in range(8):
            block = data['list'][i]
            if 'rain' in block:
                rain_sum += block['rain'].get('3h', 0)
        
        return {
            "temperature": temp,
            "humidity": humidity,
            "rainfall_forecast": rain_sum,
            "description": current['weather'][0]['description']
        }
    except Exception as e:
        return None

def predict_irrigation():
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        
        soil_moisture = input_data.get("soilMoisture", 0)
        evapotranspiration = input_data.get("evapotranspiration", 0)
        growth_stage = input_data.get("growthStage", "Initial")
        location = input_data.get("location", "New York") # User can now provide location
        
        api_key = os.environ.get("OPENWEATHER_API_KEY")
        weather = None
        if api_key:
            weather = get_weather_data(api_key, location)
            
        # If we got live weather, use it. Otherwise use provided/default values
        temp = weather['temperature'] if weather else input_data.get("temperature", 25)
        humidity = weather['humidity'] if weather else input_data.get("humidity", 60)
        rainfall_forecast = weather['rainfall_forecast'] if weather else 0
        
        # Base requirement calculation (calibrated regression simulation)
        # Higher ET and Temp = More water
        # Higher Soil Moisture, Humidity, and Rainfall = Less water
        
        base_liters = (evapotranspiration * 500) + (temp * 20) - (soil_moisture * 10) - (humidity * 5)
        
        # Account for rainfall (subtract predicted rain from requirement)
        # 1mm of rain on 1 acre is approx 4000 liters, but we'll use a conservative factor
        rain_offset = rainfall_forecast * 1000 
        recommended_liters = base_liters - rain_offset
        
        # Growth stage multipliers
        multipliers = {
            "Initial": 0.8,
            "Vegetative": 1.2,
            "Flowering": 1.5,
            "Maturity": 1.0
        }
        
        multiplier = multipliers.get(growth_stage, 1.0)
        final_liters = max(0, round(recommended_liters * multiplier, 2))
        
        # Timing Optimization based on weather
        # Avoid irrigating if heavy rain is expected
        best_time = "6:00 AM" if temp > 25 else "7:00 PM"
        advice_note = ""
        if rainfall_forecast > 5:
            advice_note = "Significant rainfall expected. Consider skipping irrigation."
            final_liters = 0 # Recommendation becomes 0 if it's going to rain a lot
        elif rainfall_forecast > 0:
            advice_note = f"Light rain ({rainfall_forecast}mm) expected. Adjusted water requirement."

        # Water savings simulation (Traditional vs AI)
        traditional_liters = (base_liters * multiplier) * 1.25 
        savings = round(((traditional_liters - final_liters) / (traditional_liters if traditional_liters > 0 else 1)) * 100, 2)

        print(json.dumps({
            "recommended_liters": final_liters,
            "best_time": best_time,
            "water_savings_percentage": max(0, savings),
            "live_weather": {
                "temp": temp,
                "humidity": humidity,
                "rain_forecast": rainfall_forecast,
                "location": location,
                "description": weather['description'] if weather else "Manual input"
            },
            "advice_note": advice_note
        }))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict_irrigation()
