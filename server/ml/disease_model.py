import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
import os

def create_model():
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    predictions = Dense(5, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Freeze base model layers
    for layer in base_model.layers:
        layer.trainable = False
        
    model.compile(optimizer='adam', loss='categorical_cross_entropy', metrics=['accuracy'])
    return model

if __name__ == "__main__":
    model_path = "server/ml/disease_model.h5"
    if not os.path.exists(model_path):
        print("Initializing and saving new model...")
        model = create_model()
        model.save(model_path)
        print(f"Model saved to {model_path}")
    else:
        print("Model already exists.")
