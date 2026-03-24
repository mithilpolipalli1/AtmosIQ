import random
from datetime import datetime

CITIES = ["Hyderabad", "Mumbai", "Delhi", "Bangalore"]

WEATHER_CONDITIONS = ["Clear", "Haze", "Clouds", "Rain", "Mist", "Smoke", "Thunderstorm"]

def get_fake_weather(city):
    temp = round(random.uniform(20, 45), 2)
    return {
        "city": city,
        "temperature_c": temp,
        "feels_like_c": round(temp + random.uniform(-2, 2), 2),
        "humidity": random.randint(30, 90),
        "weather": random.choice(WEATHER_CONDITIONS),
        "weather_description": random.choice(WEATHER_CONDITIONS).lower(),
        "wind_speed": round(random.uniform(0, 15), 2),
        "timestamp": int(datetime.now().timestamp())
    }

def get_fake_aqi(city):
    return {
        "city": city,
        "aqi": random.randint(1, 5),
        "components": {
            "co": round(random.uniform(200, 1200), 2),
            "no": round(random.uniform(0, 50), 2),
            "no2": round(random.uniform(5, 80), 2),
            "o3": round(random.uniform(10, 180), 2),
            "so2": round(random.uniform(1, 20), 2),
            "pm2_5": round(random.uniform(10, 150), 2),
            "pm10": round(random.uniform(15, 200), 2),
            "nh3": round(random.uniform(1, 50), 2)
        },
        "timestamp": int(datetime.now().timestamp())
    }

def get_fake_analysis(city):
    """
    Simulated ML + statistical analysis layer.
    Will be replaced by Nayanika's real ML output later.
    """
    aqi_value = random.randint(10, 150)
    mean = round(random.uniform(30, 80), 2)
    std = round(random.uniform(5, 20), 2)
    z = round((aqi_value - mean) / std, 2)
    ml_score = round(random.uniform(0, 1), 4)

    if abs(z) > 2 or ml_score > 0.75:
        severity = "HIGH"
    elif abs(z) > 1 or ml_score > 0.4:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    return {
        "city": city,
        "current_aqi": aqi_value,
        "rolling_mean": mean,
        "rolling_std": std,
        "z_score": z,
        "ml_score": ml_score,
        "severity": severity,
        "anomaly_detected": abs(z) > 2 or ml_score > 0.75,
        "timestamp": int(datetime.now().timestamp())
    }

def get_full_city_data(city):
    weather = get_fake_weather(city)
    aqi = get_fake_aqi(city)
    analysis = get_fake_analysis(city)

    # Fill missing fields with placeholder message
    for key in ["temperature_c", "humidity", "wind_speed", "feels_like_c"]:
        if key not in weather:
            weather[key] = "DATA UNAVAILABLE"

    return {
        "weather": weather,
        "air_quality": aqi,
        "analysis": analysis
    }