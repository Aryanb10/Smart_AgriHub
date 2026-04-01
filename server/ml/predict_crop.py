import json
import math
import sys


TRAINING_SAMPLES = [
    {"features": [90, 42, 43, 20.8, 82.0, 6.5, 202.9], "crop": "rice"},
    {"features": [85, 58, 41, 21.7, 80.3, 7.0, 226.6], "crop": "rice"},
    {"features": [60, 55, 44, 23.0, 80.0, 7.1, 200.0], "crop": "rice"},
    {"features": [10, 20, 30, 25.0, 50.0, 6.0, 100.0], "crop": "maize"},
    {"features": [20, 30, 40, 24.0, 45.0, 5.5, 90.0], "crop": "maize"},
    {"features": [0, 15, 25, 22.0, 60.0, 6.2, 80.0], "crop": "chickpea"},
    {"features": [100, 10, 50, 26.0, 85.0, 6.6, 50.0], "crop": "watermelon"},
]


def distance(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def predict():
    try:
        input_data = json.loads(sys.stdin.read())
        features = [
            float(input_data["nitrogen"]),
            float(input_data["phosphorus"]),
            float(input_data["potassium"]),
            float(input_data["temperature"]),
            float(input_data["humidity"]),
            float(input_data["ph"]),
            float(input_data["rainfall"]),
        ]

        closest = min(TRAINING_SAMPLES, key=lambda sample: distance(features, sample["features"]))
        print(json.dumps({"prediction": closest["crop"]}))
    except Exception as error:
        print(json.dumps({"error": str(error)}))


if __name__ == "__main__":
    predict()
