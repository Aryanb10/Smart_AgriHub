import sys
import json
import os
import requests

# Crop-specific water requirement factors (Liters per Acre base multiplier)
CROP_FACTORS = {
    "Rice": 1.5,
    "Wheat": 1.1,
    "Maize": 1.2,
    "Cotton": 1.3,
    "Sugarcane": 1.8,
    "Tomato": 1.0,
    "Potato": 0.9,
    "Groundnut": 0.8,
    "Apple": 1.2,
    "Grapes": 1.1,
    "Orange": 1.3
}

def get_weather_data(api_key, city="London"):
    try:
        url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
        response = requests.get(url)
        data = response.json()
        
        if response.status_code != 200:
            return None
            
        current = data['list'][0]
        temp = current['main']['temp']
        humidity = current['main']['humidity']
        
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
        input_data = json.load(sys.stdin)
        
        soil_moisture = input_data.get("soilMoisture", 30)
        evapotranspiration = input_data.get("evapotranspiration", 5)
        growth_stage = input_data.get("growthStage", "Vegetative")
        location = input_data.get("location", "New York")
        crop = input_data.get("crop", "Tomato") # New crop field
        
        api_key = os.environ.get("OPENWEATHER_API_KEY")
        weather = None
        if api_key:
            weather = get_weather_data(api_key, location)
            
        temp = weather['temperature'] if weather else input_data.get("temperature", 25)
        humidity = weather['humidity'] if weather else input_data.get("humidity", 60)
        rainfall_forecast = weather['rainfall_forecast'] if weather else 0
        
        # Base requirement calculation
        base_liters = (evapotranspiration * 500) + (temp * 20) - (soil_moisture * 10) - (humidity * 5)
        
        # Crop specific multiplier
        crop_multiplier = CROP_FACTORS.get(crop, 1.0)
        
        # Rainfall offset (1mm ~ 1000 liters conservative)
        rain_offset = rainfall_forecast * 1000 
        
        # Growth stage multipliers
        multipliers = {
            "Initial": 0.8,
            "Vegetative": 1.2,
            "Flowering": 1.5,
            "Maturity": 1.0
        }
        stage_multiplier = multipliers.get(growth_stage, 1.0)
        
        recommended_liters = (base_liters * crop_multiplier * stage_multiplier) - rain_offset
        final_liters = max(0, round(recommended_liters, 2))
        
        best_time = "6:00 AM" if temp > 25 else "7:00 PM"
        advice_note = f"Tailored for {crop} at {growth_stage} stage. "
        
        if rainfall_forecast > 5:
            advice_note += "Heavy rain expected. Skip irrigation."
            final_liters = 0 
        elif rainfall_forecast > 0:
            advice_note += f"Adjusted for {rainfall_forecast}mm forecasted rain."

        traditional_liters = (base_liters * crop_multiplier * stage_multiplier) * 1.25 
        savings = round(((traditional_liters - final_liters) / (traditional_liters if traditional_liters > 0 else 1)) * 100, 2)

        print(json.dumps({
            "recommended_liters": final_liters,
            "best_time": best_time,
            "water_savings_percentage": max(0, min(100, savings)),
            "live_weather": {
                "temp": temp,
                "humidity": humidity,
                "rain_forecast": rainfall_forecast,
                "location": location,
                "description": weather['description'] if weather else "Manual input"
            },
            "advice_note": advice_note,
            "crop": crop
        }))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict_irrigation()
