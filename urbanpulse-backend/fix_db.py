import sys
sys.path.insert(0, '.')
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv(".env")
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)
with engine.connect() as conn:
    print("Updating anomalous insights...")
    conn.execute(text("UPDATE environmental_anomalies SET insight = 'Unexpected improvement in air quality. Likely a temporary atmospheric clearance.' WHERE z_score < -0.5 AND insight LIKE '%dominant environmental factor%';"))
    conn.execute(text("UPDATE environmental_anomalies SET insight = 'Minor elevation in local air toxicity. Routine variance or mild environmental shift.' WHERE z_score > 0.5 AND insight LIKE '%dominant environmental factor%';"))
    conn.execute(text("UPDATE environmental_anomalies SET insight = 'Micro-fluctuations detected by the ML isolation forest algorithm.' WHERE insight LIKE '%dominant environmental factor%';"))
    conn.commit()
    print("Updates committed.")
    
    result = conn.execute(text("SELECT city, src_time, insight, z_score FROM (SELECT city, to_timestamp(source_timestamp) as src_time, insight, z_score FROM environmental_anomalies WHERE city IN ('Delhi', 'Bengaluru') ORDER BY source_timestamp DESC LIMIT 10) as limited;"))
    for r in result:
        print(f"{r.city}: {r.src_time} - {r.insight} (z={r.z_score})")
