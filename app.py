from fastapi import FastAPI
import joblib
import numpy as np
import pandas as pd
import sys
import os

# Workaround for pickled model saved with typo
sys.modules['mport numpy as np'] = np
setattr(np, 'import pandas as pd', pd)
setattr(np, 'import pandas as df', pd)

app = FastAPI()

model = None

try:
    print("🚀 Starting app...")
    print("📂 Root files:", os.listdir())

    if os.path.exists("model/model.pkl"):
        model = joblib.load("model/model.pkl")
        print("✅ Model loaded")
    else:
        print("❌ model/model.pkl NOT FOUND")

except Exception as e:
    print("❌ Error loading model:", str(e))


@app.get("/")
def home():
    return {
        "message": "ML API running",
        "model_loaded": model is not None
    }


@app.post("/predict")
def predict(data: list):
    if model is None:
        return {"error": "Model not loaded"}

    arr = np.array(data)
    result = model.predict(arr).tolist()

    return {"prediction": result}
