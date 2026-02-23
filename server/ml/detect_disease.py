import sys
import json
import os
import numpy as np
from PIL import Image

# Suppress tensorflow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import tensorflow as tf

# Model and Classes configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), "disease_model.h5")
CLASSES = ["Healthy", "Leaf Blight", "Rust", "Powdery Mildew", "Leaf Spot"]

# Load model once
_model = None

def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        _model = tf.keras.models.load_model(MODEL_PATH)
    return _model

def preprocess_image(image_path):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img).astype('float32') / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def detect():
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        image_path = input_data.get("imagePath")
        
        if not image_path or not os.path.exists(image_path):
            print(json.dumps({"error": f"Image path invalid: {image_path}"}))
            return

        model = get_model()
        processed_img = preprocess_image(image_path)
        
        predictions = model.predict(processed_img, verbose=0)
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        
        print(json.dumps({
            "disease": CLASSES[class_idx],
            "confidence": round(confidence, 2)
        }))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    detect()
