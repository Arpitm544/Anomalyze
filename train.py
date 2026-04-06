import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

np.random.seed(42)
n_samples = 3000
time = np.arange(n_samples)

temperature = 50 + 5 * np.sin(time / 50) + np.random.normal(0, 2, n_samples)
vibration = 20 + 3 * np.sin(time / 30) + np.random.normal(0, 1, n_samples)
pressure = 30 + 4 * np.sin(time / 40) + np.random.normal(0, 1.5, n_samples)

df = pd.DataFrame({
    "temperature": temperature,
    "vibration": vibration,
    "pressure": pressure
})

# 2. Inject anomalies (realistic)
n_anomalies = 150
indices = np.random.choice(n_samples, n_anomalies, replace=False)

df.loc[indices[:50], "temperature"] += np.random.uniform(20, 40, 50)

df.loc[indices[50:100], "vibration"] += np.random.uniform(10, 20, 50)

df.loc[indices[100:], "pressure"] -= np.random.uniform(10, 20, 50)


df["temp_vib_ratio"] = df["temperature"] / (df["vibration"] + 1e-5)
df["pressure_change"] = df["pressure"].diff().fillna(0)
df["rolling_temp_mean"] = df["temperature"].rolling(window=10).mean().fillna(method="bfill")
df["rolling_vibration_std"] = df["vibration"].rolling(window=10).std().fillna(method="bfill")

features = df.values

model = IsolationForest(
    contamination=0.05,
    n_estimators=300,
    max_samples="auto",
    random_state=42
)

model.fit(features)

scores = model.decision_function(features)

df["anomaly_score"] = scores
df["anomaly"] = df["anomaly_score"].apply(lambda x: 1 if x < 0 else 0)


joblib.dump(model, "model.pkl")

df.to_csv("sample_data.csv", index=False)

print("model trained successfully")
print(df.head())
