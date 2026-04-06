from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
import sys
import os

# Standard ML loading approach

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    """
    Expects a list of lists or a single list representing features.
    If the input is just [temp, vib, pres], we'll compute ratios/means for the model.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        arr = np.array(data)
        # If user sends raw 3 features, we might need to expand them to 7.
        # For now, assume the user sends the correct 7 features for the model.
        if arr.ndim == 1:
            arr = arr.reshape(1, -1)
        
        result = model.predict(arr).tolist()
        return {"prediction": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/data")
def get_sensor_data(limit: int = 50):
    """
    Generates synthetic real-time sensor data for the dashboard.
    Simulates a time series with anomalies.
    """
    np.random.seed(os.getpid() + int(pd.Timestamp.now().timestamp()))
    time_points = np.arange(limit)
    
    # 1. Generate core sensors (Temperature, Vibration, Pressure)
    temp = 50 + 5 * np.sin(time_points / 10) + np.random.normal(0, 1.5, limit)
    vib = 20 + 3 * np.cos(time_points / 8) + np.random.normal(0, 0.8, limit)
    pres = 30 + 4 * np.sin(time_points / 12) + np.random.normal(0, 1.2, limit)
    
    # 2. Inject random anomalies for visualization
    if np.random.random() > 0.7:
        idx = np.random.randint(0, limit)
        temp[idx] += 25
        vib[idx] += 15
        
    df = pd.DataFrame({
        "temperature": temp,
        "vibration": vib,
        "pressure": pres
    })
    
    # 3. Feature engineering (same as train.py)
    df["temp_vib_ratio"] = df["temperature"] / (df["vibration"] + 1e-5)
    df["pressure_change"] = df["pressure"].diff().fillna(0)
    df["rolling_temp_mean"] = df["temperature"].rolling(window=5).mean().fillna(method="bfill")
    df["rolling_vibration_std"] = df["vibration"].rolling(window=5).std().fillna(method="bfill")
    
    # 4. Predict using the model
    if model is not None:
        features = df.values
        # IsolationForest returns -1 for anomalies, 1 for normal
        preds = model.predict(features)
        df["anomaly"] = [1 if p == -1 else 0 for p in preds]
    else:
        df["anomaly"] = 0

    # 5. Add timestamps and return
    now = pd.Timestamp.now()
    records = []
    for i, row in df.iterrows():
        records.append({
            "timestamp": (now - pd.Timedelta(seconds=(limit - i))).isoformat(),
            "temperature": float(row["temperature"]),
            "vibration": float(row["vibration"]),
            "pressure": float(row["pressure"]),
            "anomaly": int(row["anomaly"])
        })
        
    return {
        "status": "success",
        "model_loaded": model is not None,
        "data": records
    }
