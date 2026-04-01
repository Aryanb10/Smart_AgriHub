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


def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        _model = load_model(MODEL_PATH)
    return _model


def analyze_leaf(image_path):
    model = get_model()
    
    # Preprocess image
    img = image.load_img(image_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0  # Normalize
    
    # Predict
    predictions = model.predict(img_array, verbose=0)
    index = np.argmax(predictions[0])
    confidence = float(predictions[0][index])
    disease = CLASSES[index]
    
    # Severity assessment (simulated based on confidence for now, as per second asset)
    if confidence > 0.8:
        severity = "Mild" if disease == "Healthy" else "Severe"
    elif confidence > 0.6:
        severity = "Moderate"
    else:
        severity = "Mild"
        
    return disease, confidence, severity


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
