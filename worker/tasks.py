from simulator.fake_data import get_full_city_data
from datetime import datetime

CITIES = ["Hyderabad", "Mumbai", "Delhi", "Bangalore"]

def ingest_data():
    print(f"\n{'='*50}")
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] INGESTION STARTED")
    print(f"{'='*50}")

    for city in CITIES:
        try:
            data = get_full_city_data(city)

            weather = data["weather"]
            aqi = data["air_quality"]

            print(f"\n📍 {city}")
            print(f"   Weather    : {weather['weather']} | Temp: {weather['temperature_c']}°C | Feels like: {weather['feels_like_c']}°C")
            print(f"   Humidity   : {weather['humidity']}% | Wind: {weather['wind_speed']} m/s")
            print(f"   AQI Index  : {aqi['aqi']} | PM2.5: {aqi['components']['pm2_5']} | PM10: {aqi['components']['pm10']}")
            print(f"   Timestamp  : {datetime.fromtimestamp(weather['timestamp'])}")

        except Exception as e:
            print(f"   ❌ Error processing {city}: {e}")

    print(f"\n✅ Ingestion complete for all cities.")


def run_anomaly_detection():
    print(f"\n{'='*50}")
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ANOMALY DETECTION STARTED")
    print(f"{'='*50}")

    for city in CITIES:
        try:
            data = get_full_city_data(city)
            analysis = data["analysis"]

            status = "🚨 ANOMALY DETECTED" if analysis["anomaly_detected"] else "✅ Normal"

            print(f"\n📍 {city}")
            print(f"   Status     : {status}")
            print(f"   Severity   : {analysis['severity']}")
            print(f"   Z-Score    : {analysis['z_score']}")
            print(f"   ML Score   : {analysis['ml_score']}")
            print(f"   Current AQI: {analysis['current_aqi']} | Rolling Mean: {analysis['rolling_mean']}")

        except Exception as e:
            print(f"   ❌ Error processing {city}: {e}")

    print(f"\n✅ Anomaly detection complete for all cities.")