# AtmosIQ AI: Environmental Intelligence Network

AI-based multi-city environmental anomaly detection platform tracking hyper-local air quality, meteorological interference, and municipal risk factors.

## Tech Stack
- **Backend Core:** Python, FastAPI, SQLAlchemy
- **Database Architecture:** PostgreSQL
- **Frontend Presentation:** React (Vite), React-Leaflet Map, TailwindCSS (Bento UI)
- **Machine Learning / Analytics:** Pandas, Scikit-Learn (Isolation Forest)
- **Data Pipeline:** OpenWeather API Streaming

## System Explanation & Architecture

### 1. The Continuous Data Pipeline (`live_sync.py`)
AtmosIQ constantly pulls local weather state and particulate density (PM2.5, CO, NO, etc.) across 6 major Indian metropolitan hubs using OpenWeather APIs every 15 seconds. To compensate for OpenWeather's hourly cache lock, our python ingestion background worker overrides the stale timestamp with real-time clock references and injects `±15% organic variance`. This realistically mimics continuous hardware IoT data flow across Indian geographies, guaranteeing live statistical deviation points.

### 2. The Hybrid AI Anomaly Engine (`backend/anomaly/detector.py`)
The AI engine runs dynamically synchronously with ingestion. It relies on a two-pronged mathematical approach to decide if an atmospheric event is dangerous:
- **Rolling Z-Score Statistical Deviations**: It computes rolling averages and standard deviations. Any Z-Score `> 1.5` triggers a moderate anomaly, while anything `> 4.0` registers a critical health emergency.
- **Unsupervised Machine Learning**: An `IsolationForest` model acts as a secondary verification, training on the micro-fluctuations of immediate past data blocks to flag irregularities invisible to standard deviation math. 

### 3. Contextual Data Inference
Instead of generic fallback alerts, AtmosIQ cross-references raw micro-pollutants and weather conditions. High PM2.5 + High Humidity generates a "Pollutant Trapping by Moisture" insight, while High PM2.5 + High Wind signifies active pollutant dispersion, allowing city planners to read the actual structural breakdown of *why* an anomaly occurred dynamically!

### 4. Interactive Live Dashboard
The React frontend pulls this database geometry and live metric stream into an interactive Map (`MapView.jsx`). Real-time coordinate translation anchors city readouts across the map. Clicking on 'Details' slides out an interactive bento-box exposing the real-time breakdown of up to 8 live micro-pollutants tracked continuously under the hood.

## Contributors
- Akshith Varma
- Yashweer
- Nayanika
