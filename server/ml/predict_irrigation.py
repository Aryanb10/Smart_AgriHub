import sys
import json
import os
import requests

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

def estimate_evapotranspiration(temp, humidity):
    """
    Estimate Reference Evapotranspiration (ET0) from temperature and humidity.
    Uses a simplified Hargreaves-style formula:
    ET0 = 0.0135 * (T + 17.8) * (1 - RH/100) * solar_factor
    Where solar_factor is an approximation based on temperature.
    Result is in mm/day.
    """
    solar_factor = max(2.0, temp * 0.3)
    et0 = 0.0135 * (temp + 17.8) * (1 - humidity / 100) * solar_factor
    return round(max(0, et0), 2)

def get_weather_data(api_key, city):
    try:
        url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=8)
        data = response.json()

        if response.status_code != 200:
            return None

        current = data['list'][0]
        temp = current['main']['temp']
        humidity = current['main']['humidity']

        rain_sum = 0
        for i in range(min(8, len(data['list']))):
            block = data['list'][i]
            if 'rain' in block:
                rain_sum += block['rain'].get('3h', 0)

        et0 = estimate_evapotranspiration(temp, humidity)

        return {
            "temperature": temp,
            "humidity": humidity,
            "rainfall_forecast": round(rain_sum, 2),
            "evapotranspiration": et0,
            "description": current['weather'][0]['description']
        }
    except Exception:
        return None

def predict_irrigation():
    try:
        input_data = json.load(sys.stdin)

        soil_moisture = input_data.get("soilMoisture", 30)
        growth_stage = input_data.get("growthStage", "Vegetative")
        location = input_data.get("location", "New York")
        crop = input_data.get("crop", "Tomato")

        # Manual overrides — only used if weather API fails
        manual_temp = input_data.get("temperature")
        manual_humidity = input_data.get("humidity")

        api_key = os.environ.get("OPENWEATHER_API_KEY")
        weather = None
        if api_key and location:
            weather = get_weather_data(api_key, location)

        # Always prefer live weather; fall back to manual only if API fails
        if weather:
            temp = weather['temperature']
            humidity = weather['humidity']
            rainfall_forecast = weather['rainfall_forecast']
            evapotranspiration = weather['evapotranspiration']
            weather_source = "live"
        else:
            temp = manual_temp if manual_temp is not None else 25
            humidity = manual_humidity if manual_humidity is not None else 60
            rainfall_forecast = 0
            evapotranspiration = estimate_evapotranspiration(temp, humidity)
            weather_source = "manual"

        crop_multiplier = CROP_FACTORS.get(crop, 1.0)

        multipliers = {
            "Initial": 0.8,
            "Vegetative": 1.2,
            "Flowering": 1.5,
            "Maturity": 1.0
        }
        stage_multiplier = multipliers.get(growth_stage, 1.0)

        base_liters = (evapotranspiration * 500) + (temp * 20) - (soil_moisture * 10) - (humidity * 5)
        rain_offset = rainfall_forecast * 1000
        recommended_liters = (base_liters * crop_multiplier * stage_multiplier) - rain_offset
        final_liters = max(0, round(recommended_liters, 2))

        best_time = "6:00 AM" if temp > 25 else "7:00 PM"
        advice_note = f"Tailored for {crop} at {growth_stage} stage."

        if rainfall_forecast > 5:
            advice_note += " Heavy rain expected — skip irrigation today."
            final_liters = 0
        elif rainfall_forecast > 0:
            advice_note += f" Reduced by {round(rainfall_forecast, 1)}mm forecasted rain."

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
                "evapotranspiration": evapotranspiration,
                "location": location,
                "description": weather['description'] if weather else "Manual fallback",
                "source": weather_source
            },
            "advice_note": advice_note,
            "crop": crop
        }))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict_irrigation()
