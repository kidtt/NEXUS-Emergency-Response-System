import sys
import json
import joblib
import pandas as pd

from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "models" / "nexus_emergency_model.pkl"

model = joblib.load(MODEL_PATH)

# Receive JSON safely from command line
input_data = json.loads(sys.stdin.read())

incident = pd.DataFrame([input_data])

prediction = model.predict(incident)[0]

probabilities = model.predict_proba(incident)[0]

classes = model.classes_

probability_map = {
    class_name: float(probability)
    for class_name, probability
    in zip(classes, probabilities)
}

confidence = max(probability_map.values())

result = {
    "prediction": prediction,
    "confidence": round(confidence * 100, 2),
    "probabilities": probability_map
}

print(json.dumps(result))