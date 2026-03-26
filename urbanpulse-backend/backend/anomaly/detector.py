import pandas as pd  # type: ignore
from sklearn.ensemble import IsolationForest  # type: ignore


def compute_stats(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df["rolling_avg_aqi"] = df["aqi"].shift(1).rolling(5, min_periods=1).mean()
    df["std_dev"] = df["aqi"].shift(1).rolling(5, min_periods=1).std().fillna(0)

    z_scores = []
    for i in range(len(df)):
        std = max(float(df["std_dev"].iloc[i]), 5.0)
        mean = df["rolling_avg_aqi"].iloc[i]
        val = float(df["aqi"].iloc[i])

        if pd.isna(mean):
            z = 0.0
        else:
            z = (val - float(mean)) / std
        z_scores.append(z)

    df["z_score"] = z_scores
    return df


def compute_ml(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    required_cols = ["aqi", "temperature", "humidity", "feels_like", "wind_speed"]
    features = df[required_cols].copy()

    if len(df) > 2:
        train = features.iloc[:-1]
        test = features.iloc[-1:]
        model = IsolationForest(contamination=0.1, random_state=42)
        model.fit(train)
        score = float(model.decision_function(test)[0])
        flag = int(model.predict(test)[0])
        df["ml_score"] = 0.0
        df["ml_flag"] = 1
        df.loc[df.index[-1], "ml_score"] = score
        df.loc[df.index[-1], "ml_flag"] = flag
    else:
        df["ml_score"] = 0.0
        df["ml_flag"] = 1
    return df


def get_detection_type(z: float, ml_flag: int, ml_score: float) -> str:
    z_flag = abs(z) > 0.5
    ml_flag_bool = ml_flag == -1
    if z_flag and ml_flag_bool: return "both"
    if z_flag: return "statistical"
    if ml_flag_bool: return "ml"
    return "none"


def get_severity(z: float) -> str:
    z = abs(z)
    if z > 4: return "critical"
    if z > 2.5: return "high"
    if z > 1.5: return "medium"
    return "low"


def generate_insight(aqi: float, wind_speed: float, humidity: float, z_score: float) -> str:
    if aqi > 200 and wind_speed < 2:
        return "Critical accumulation of particulates due to extremely stagnant air conditions."
    if aqi > 150 and humidity > 70:
        return "High atmospheric moisture is currently compounding particulate density."
    if aqi > 100 and wind_speed > 5:
        return "Elevated pollutants are actively being dispersed by high wind currents."
    
    if abs(z_score) > 2.5:
        direction = "surge" if z_score > 0 else "drop"
        return f"Statistically significant {direction} in pollution levels compared to recent baseline."
    
    if z_score > 0.5:
        return "Minor elevation in local air toxicity. Routine variance or mild environmental shift."
        
    if z_score < -0.5:
        return "Unexpected improvement in air quality. Likely a temporary atmospheric clearance."

    return "Micro-fluctuations detected by the ML isolation forest algorithm."


def generate_cause(aqi: float, wind_speed: float, humidity: float, z_score: float) -> str:
    if aqi > 200 and wind_speed < 2:
        return "Stagnant Air Conditions"
    if aqi > 150 and humidity > 70:
        return "Pollutant Trapping by Moisture"
    if aqi > 100 and wind_speed > 5:
        return "Wind-Driven Dispersal"
        
    if abs(z_score) > 2.5:
        return "Sudden Environmental Shift"
        
    if z_score > 0.5:
        return "Minor Particulate Accumulation"
        
    if z_score < -0.5:
        return "Atmospheric Clearance"
        
    return "Algorithmic Micro-Variance"


def get_atmospheric_response(severity: str, insight: str):
    mapping = {
        "critical": {
            "action": "ISSUE EVACUATION ADVISORY & ACTIVATE FILTRATION",
            "actor": "MUNICIPAL SAFETY COMMAND"
        },
        "high": {
            "action": "ADVISE PROTECTIVE GEAR FOR HIGH-RISK GROUPS",
            "actor": "HEALTH AUTHORITY"
        },
        "medium": {
            "action": "MONITOR SENSOR DATA FOR TREND PERSISTENCE",
            "actor": "NETWORK SUPERVISOR"
        },
        "low": {
            "action": "CONTINUE ROUTINE DATA ARCHIVING",
            "actor": "SYSTEM AUTOMATION"
        }
    }
    return mapping.get(severity, {
        "action": "STABLE MONITORING SUSTAINED",
        "actor": "AUTONOMOUS SYSTEM"
    })


def detect_anomaly(df: pd.DataFrame):
    if len(df) < 1: return None
    df = compute_stats(df)
    df = compute_ml(df)
    latest = df.iloc[-1]
    z = float(latest["z_score"])
    ml_score = float(latest["ml_score"])
    ml_flag = int(latest["ml_flag"])
    detection = get_detection_type(z, ml_flag, ml_score)
    if detection == "none": return None

    baseline = latest["rolling_avg_aqi"]
    baseline = float(baseline) if not pd.isna(baseline) else None

    severity = get_severity(z)
    insight = generate_insight(
        aqi=float(latest["aqi"]),
        wind_speed=float(latest.get("wind_speed", 0)),
        humidity=float(latest.get("humidity", 50)),
        z_score=z
    )
    cause = generate_cause(
        aqi=float(latest["aqi"]),
        wind_speed=float(latest.get("wind_speed", 0)),
        humidity=float(latest.get("humidity", 50)),
        z_score=z
    )

    resp = get_atmospheric_response(severity, insight)

    return {
        "metric_name": "AQI",
        "value": float(latest["aqi"]),
        "baseline": baseline,
        "z_score": float(z),
        "ml_score": float(ml_score),
        "detection_type": detection,
        "severity": severity,
        "source_timestamp": int(latest["source_timestamp"]),
        "insight": insight,
        "probable_cause": cause,
        "recommended_action": resp["action"],
        "target_actor": resp["actor"],
    }