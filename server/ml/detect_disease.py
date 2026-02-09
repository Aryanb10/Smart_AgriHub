import sys
import json
import random

# For MVP, we will simulate detection.
# In a real production app, we would load a TensorFlow/PyTorch model here.
# loading = "tensorflow.keras.models.load_model('model.h5')"

def detect():
    try:
        # We don't actually process the image in this mock script
        # path = sys.argv[1] 
        
        diseases = [
            "Healthy",
            "Leaf Blight",
            "Rust",
            "Powdery Mildew",
            "Leaf Spot"
        ]
        
        # Random simulation
        detected = random.choice(diseases)
        confidence = round(random.uniform(0.7, 0.99), 2)
        
        print(json.dumps({
            "disease": detected,
            "confidence": confidence
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    detect()
