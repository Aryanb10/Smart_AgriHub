import json
import sys


def classify_fertilizer(nitrogen, phosphorus, potassium):
    values = {
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
    }

    lowest = min(values, key=values.get)
    spread = max(values.values()) - min(values.values())

    if spread <= 15:
      return "Balanced 10-10-10"
    if lowest == "nitrogen":
      return "High Nitrogen (Urea)"
    if lowest == "phosphorus":
      return "High Phosphorus (DAP)"
    return "High Potassium (Potash)"


def predict():
    try:
        input_data = json.loads(sys.stdin.read())
        nitrogen = float(input_data["nitrogen"])
        phosphorus = float(input_data["phosphorus"])
        potassium = float(input_data["potassium"])

        recommendation = classify_fertilizer(nitrogen, phosphorus, potassium)
        soil = input_data.get("soilType", "Generic")
        crop = input_data.get("cropType", "Generic")

        print(json.dumps({
            "recommendation": f"{recommendation} (tailored for {crop} on {soil} soil)"
        }))
    except Exception as error:
        print(json.dumps({"error": str(error)}))


if __name__ == "__main__":
    predict()
