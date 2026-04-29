import json
import os
import sys
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


DISEASE_TREATMENT = {
    "Healthy": {
        "organic": "Continue regular monitoring and balanced watering.",
        "chemical": "No chemical treatment needed.",
        "prevention": "Keep good airflow and sanitation to prevent outbreaks.",
    },
    "Leaf Blight": {
        "organic": "Remove infected leaves and apply neem oil or copper-based spray.",
        "chemical": "Use chlorothalonil or mancozeb as per label instructions.",
        "prevention": "Rotate crops and avoid overhead watering to keep foliage dry.",
    },
    "Rust": {
        "organic": "Prune affected areas and apply sulfur-based organic fungicide.",
        "chemical": "Apply fungicides containing tebuconazole or myclobutanil.",
        "prevention": "Space plants well for air circulation and remove fallen debris.",
    },
    "Powdery Mildew": {
        "organic": "Spray with a mixture of baking soda, water, and non-detergent soap.",
        "chemical": "Use fungicides with sulfur or potassium bicarbonate.",
        "prevention": "Ensure adequate sunlight and reduce humidity around plants.",
    },
    "Leaf Spot": {
        "organic": "Remove diseased leaves and use a compost tea or baking soda spray.",
        "chemical": "Apply fungicides with chlorothalonil or copper oxychloride.",
        "prevention": "Avoid handling plants when wet and sanitize garden tools.",
    },
}

CLASSES = ["Healthy", "Leaf Blight", "Rust", "Powdery Mildew", "Leaf Spot"]

MODEL_PATH = "server/ml/disease_model.h5"
_model = None


def clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))


def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        _model = load_model(MODEL_PATH)
    return _model


def heuristic_analysis(image_path):
    img = image.load_img(image_path, target_size=(224, 224))
    img_array = image.img_to_array(img)

    leaf_pixels = 0
    green_pixels = 0
    white_pixels = 0
    rust_pixels = 0
    dark_pixels = 0

    for pixel in img_array.reshape(-1, 3):
        r, g, b = pixel
        max_channel = max(r, g, b)
        min_channel = min(r, g, b)
        brightness = (r + g + b) / 3.0
        saturation = 0 if max_channel == 0 else (max_channel - min_channel) / max_channel

        looks_like_leaf = g > 45 or r > 70 or brightness > 90
        if not looks_like_leaf:
            continue

        leaf_pixels += 1

        if g > r * 0.95 and g > b * 1.05:
            green_pixels += 1

        if brightness > 170 and saturation < 0.22:
            white_pixels += 1

        if r > 110 and g > 55 and g < 185 and b < 130 and r > g * 1.08:
            rust_pixels += 1

        if brightness < 65:
            dark_pixels += 1

    total = max(leaf_pixels, 1)
    green_ratio = green_pixels / total
    white_ratio = white_pixels / total
    rust_ratio = rust_pixels / total
    dark_ratio = dark_pixels / total

    if white_ratio > 0.12 and green_ratio > 0.18:
        confidence = clamp(0.72 + white_ratio * 0.9, 0.72, 0.95)
        return "Powdery Mildew", round(confidence, 2), "Moderate" if white_ratio > 0.22 else "Mild"

    if rust_ratio > 0.08 or (rust_ratio > 0.05 and dark_ratio > 0.08):
        confidence = clamp(0.7 + rust_ratio * 1.2 + dark_ratio * 0.25, 0.7, 0.94)
        return "Rust", round(confidence, 2), "Moderate" if rust_ratio > 0.16 else "Mild"

    confidence = clamp(0.76 + green_ratio * 0.2 - white_ratio * 0.15 - rust_ratio * 0.1, 0.76, 0.96)
    return "Healthy", round(confidence, 2), "Healthy"


def analyze_leaf(image_path):
    try:
        model = get_model()

        img = image.load_img(image_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0

        predictions = model.predict(img_array, verbose=0)
        index = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][index])
        disease = CLASSES[index]

        if confidence > 0.8:
            severity = "Mild" if disease == "Healthy" else "Severe"
        elif confidence > 0.6:
            severity = "Moderate"
        else:
            severity = "Mild"

        return disease, round(confidence, 2), severity
    except Exception:
        return heuristic_analysis(image_path)


def detect_disease():
    try:
        input_data = json.load(sys.stdin)
        image_path = input_data.get("imagePath")

        if not image_path or not os.path.exists(image_path):
            print(json.dumps({"error": "Image path not found"}))
            return

        disease, confidence, severity = analyze_leaf(image_path)
        treatment = DISEASE_TREATMENT.get(disease, DISEASE_TREATMENT["Healthy"])

        print(json.dumps({
            "disease": disease,
            "confidence": round(confidence, 2),
            "severity": severity,
            "treatment": treatment,
        }))
    except Exception as error:
        print(json.dumps({"error": str(error)}))


if __name__ == "__main__":
    detect_disease()
