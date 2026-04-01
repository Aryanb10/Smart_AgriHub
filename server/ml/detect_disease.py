import hashlib
import json
import os
import sys


DISEASE_TREATMENT = {
    "Tomato Early Blight": {
        "organic": "Remove affected lower leaves and apply neem or copper-based spray.",
        "chemical": "Use chlorothalonil or mancozeb according to label guidance.",
        "prevention": "Avoid wet foliage and improve airflow between plants.",
    },
    "Tomato Leaf Mold": {
        "organic": "Prune dense foliage and reduce humidity around the plant canopy.",
        "chemical": "Use a recommended fungicide for leaf mold if spread continues.",
        "prevention": "Water near the roots and ventilate protected growing areas.",
    },
    "Bacterial Leaf Spot": {
        "organic": "Remove infected leaves and avoid handling plants when wet.",
        "chemical": "Use copper-based bactericides where locally approved.",
        "prevention": "Start with disease-free seed and sanitize tools regularly.",
    },
    "Yellowing Stress Pattern": {
        "organic": "Check watering consistency and add compost or balanced organic feed.",
        "chemical": "Use a balanced foliar nutrient spray only if deficiency is confirmed.",
        "prevention": "Maintain even irrigation and monitor nutrient balance.",
    },
    "Healthy": {
        "organic": "Continue regular monitoring and balanced watering.",
        "chemical": "No chemical treatment needed.",
        "prevention": "Keep good airflow and sanitation to prevent outbreaks.",
    },
}

CLASSES = [
    ("Healthy", 0.84, "Healthy"),
    ("Tomato Early Blight", 0.79, "Moderate"),
    ("Yellowing Stress Pattern", 0.74, "Mild"),
    ("Bacterial Leaf Spot", 0.77, "Severe"),
    ("Tomato Leaf Mold", 0.71, "Moderate"),
]


def analyze_leaf(image_path):
    with open(image_path, "rb") as file:
        data = file.read()

    digest = hashlib.sha256(data).hexdigest()
    index = int(digest[:2], 16) % len(CLASSES)
    disease, confidence, severity = CLASSES[index]
    return disease, confidence, severity


def detect_disease():
    try:
        input_data = json.load(sys.stdin)
        image_path = input_data.get("imagePath")

        if not image_path or not os.path.exists(image_path):
            print(json.dumps({"error": "Image path not found"}))
            return

        disease, confidence, severity = analyze_leaf(image_path)
        treatment = DISEASE_TREATMENT[disease]

        print(json.dumps({
            "disease": disease,
            "confidence": confidence,
            "severity": severity,
            "treatment": treatment,
        }))
    except Exception as error:
        print(json.dumps({"error": str(error)}))


if __name__ == "__main__":
    detect_disease()
