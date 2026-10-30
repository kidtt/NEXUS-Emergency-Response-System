import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# --------------------------------------------------
# 1. LOAD DATASET
# --------------------------------------------------

data = pd.read_csv("data/incidents.csv")

print("\n🚨 NEXUS ML")
print("Dataset loaded successfully")
print(f"Records: {len(data)}")


# --------------------------------------------------
# 2. FEATURES AND TARGET
# --------------------------------------------------

X = data.drop("outcome", axis=1)
y = data["outcome"]


# --------------------------------------------------
# 3. CATEGORICAL / NUMERICAL FEATURES
# --------------------------------------------------

categorical_features = [
    "incident_type",
    "severity",
    "location_name"
]

numerical_features = [
    "incident_hour",
    "day_of_week",
    "incident_month"
]


# --------------------------------------------------
# 4. PREPROCESSING
# --------------------------------------------------

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        )
    ],
    remainder="passthrough"
)


# --------------------------------------------------
# 5. MACHINE LEARNING MODEL
# --------------------------------------------------

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)


# --------------------------------------------------
# 6. COMPLETE ML PIPELINE
# --------------------------------------------------

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# --------------------------------------------------
# 7. SPLIT DATA
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)


# --------------------------------------------------
# 8. TRAIN MODEL
# --------------------------------------------------

print("\n🧠 Training NEXUS ML model...")

pipeline.fit(
    X_train,
    y_train
)


# --------------------------------------------------
# 9. EVALUATE MODEL
# --------------------------------------------------

predictions = pipeline.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n📊 MODEL RESULTS")
print("-------------------------")
print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# --------------------------------------------------
# 10. SAVE MODEL
# --------------------------------------------------

import joblib

joblib.dump(
    pipeline,
    "models/nexus_emergency_model.pkl"
)

print("\n✅ Model saved successfully!")
print(
    "models/nexus_emergency_model.pkl"
)