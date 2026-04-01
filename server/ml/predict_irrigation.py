import json
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import urlopen


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
    "Orange": 1.3,
}


def estimate_evapotranspiration(temp, humidity):
    solar_factor = max(2.0, temp * 0.3)
    et0 = 0.0135 * (temp + 17.8) * (1 - humidity / 100) * solar_factor
    return round(max(0, et0), 2)


def fetch_json(url):
    with urlopen(url, timeout=8) as response:
        return json.loads(response.read().decode("utf-8"))


def get_coordinates(location):
    url = (
        "https://geocoding-api.open-meteo.com/v1/search"
        f"?name={quote(location)}&count=1&language=en&format=json"
    )
    data = fetch_json(url)
    results = data.get("results") or []
    if not results:
        return None
    return results[0]


def get_weather_data(location):
    try:
        place = get_coordinates(location)
        if not place:
            return None

        latitude = place["latitude"]
        longitude = place["longitude"]
        resolved_name = place["name"]
        country = place.get("country", "")

        weather_url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={latitude}&longitude={longitude}"
            "&current=temperature_2m,relative_humidity_2m,weather_code"
            "&daily=precipitation_sum"
            "&timezone=auto&forecast_days=1"
        )
        data = fetch_json(weather_url)
        current = data.get("current", {})
        daily = data.get("daily", {})

        temp = float(current.get("temperature_2m"))
        humidity = float(current.get("relative_humidity_2m"))
        rainfall_forecast = float((daily.get("precipitation_sum") or [0])[0])
        et0 = estimate_evapotranspiration(temp, humidity)

        return {
            "temperature": round(temp, 2),
            "humidity": round(humidity, 2),
            "rainfall_forecast": round(rainfall_forecast, 2),
            "evapotranspiration": et0,
            "description": weather_code_to_text(current.get("weather_code")),
            "location": f"{resolved_name}, {country}".strip(", "),
        }
    except (HTTPError, URLError, TimeoutError, ValueError, KeyError, TypeError):
        return None


def weather_code_to_text(code):
    mapping = {
        0: "clear sky",
        1: "mainly clear",
        2: "partly cloudy",
        3: "overcast",
        45: "fog",
        48: "depositing rime fog",
        51: "light drizzle",
        53: "moderate drizzle",
        55: "dense drizzle",
        61: "slight rain",
        63: "moderate rain",
        65: "heavy rain",
        71: "slight snow",
        73: "moderate snow",
        75: "heavy snow",
        80: "rain showers",
        81: "heavy rain showers",
        82: "violent rain showers",
        95: "thunderstorm",
    }
    return mapping.get(code, "weather data")


def predict_irrigation():
    try:
        input_data = json.load(sys.stdin)

        soil_moisture = input_data.get("soilMoisture", 30)
        growth_stage = input_data.get("growthStage", "Vegetative")
        location = input_data.get("location", "")
        crop = input_data.get("crop", "Tomato")

        manual_temp = input_data.get("temperature")
        manual_humidity = input_data.get("humidity")

        weather = get_weather_data(location) if location else None

        if weather:
            temp = weather["temperature"]
            humidity = weather["humidity"]
            rainfall_forecast = weather["rainfall_forecast"]
            evapotranspiration = weather["evapotranspiration"]
            weather_source = "live"
            weather_description = weather["description"]
            weather_location = weather["location"]
        else:
            temp = manual_temp if manual_temp is not None else 25
            humidity = manual_humidity if manual_humidity is not None else 60
            rainfall_forecast = 0
            evapotranspiration = estimate_evapotranspiration(temp, humidity)
            weather_source = "manual"
            weather_description = (
                "Manual fallback"
                if manual_temp is not None or manual_humidity is not None
                else "Fallback estimate"
            )
            weather_location = location or "Local estimate"

        crop_multiplier = CROP_FACTORS.get(crop, 1.0)
        stage_multiplier = {
            "Initial": 0.8,
            "Vegetative": 1.2,
            "Flowering": 1.5,
            "Maturity": 1.0,
        }.get(growth_stage, 1.0)

        base_liters = (
            (evapotranspiration * 500)
            + (temp * 20)
            - (soil_moisture * 10)
            - (humidity * 5)
        )
        rain_offset = rainfall_forecast * 1000
        recommended_liters = (base_liters * crop_multiplier * stage_multiplier) - rain_offset
        final_liters = max(0, round(recommended_liters, 2))

        best_time = "6:00 AM" if temp > 25 else "7:00 PM"
        advice_note = f"Tailored for {crop} at {growth_stage} stage."

        if weather_source == "live":
            advice_note += f" Live weather used for {weather_location}."
        elif manual_temp is None and manual_humidity is None:
            advice_note += " Live weather unavailable, using safe local fallback estimates."
        else:
            advice_note += " Live weather unavailable, using your fallback values."

        if rainfall_forecast > 5:
            advice_note += " Heavy rain expected, skip irrigation today."
            final_liters = 0
        elif rainfall_forecast > 0:
            advice_note += f" Reduced by {round(rainfall_forecast, 1)}mm forecasted rain."

        traditional_liters = (base_liters * crop_multiplier * stage_multiplier) * 1.25
        savings = round(
            ((traditional_liters - final_liters) / (traditional_liters if traditional_liters > 0 else 1)) * 100,
            2,
        )

        print(
            json.dumps(
                {
                    "recommended_liters": final_liters,
                    "best_time": best_time,
                    "water_savings_percentage": max(0, min(100, savings)),
                    "live_weather": {
                        "temp": temp,
                        "humidity": humidity,
                        "rain_forecast": rainfall_forecast,
                        "evapotranspiration": evapotranspiration,
                        "location": weather_location,
                        "description": weather_description,
                        "source": weather_source,
                    },
                    "advice_note": advice_note,
                    "crop": crop,
                }
            )
        )
    except Exception as error:
        print(json.dumps({"error": str(error)}))


if __name__ == "__main__":
    predict_irrigation()
