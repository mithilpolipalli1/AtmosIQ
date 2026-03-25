"""Initialize the environmental anomalies table. Drop it if it's missing columns."""
import os
from sqlalchemy import create_engine, text
from backend.database.session import Base
from backend.models.environmental_anomaly import EnvironmentalAnomaly
from dotenv import load_dotenv

load_dotenv("urbanpulse-backend/.env")
db_url = os.getenv("DATABASE_URL")
if not db_url: load_dotenv(".env"); db_url = os.getenv("DATABASE_URL")

if not db_url:
    print("❌ DATABASE_URL not found")
    exit(1)

engine = create_engine(db_url)

print(f"Connecting to {db_url}...")
with engine.connect() as conn:
    # 1. DROP THE OLD TABLE (transient data)
    print("Dropping old environmental_anomalies table...")
    conn.execute(text("DROP TABLE IF EXISTS environmental_anomalies CASCADE"))
    conn.commit()

# 2. CREATE ALL TABLES FRESH
print("Recreating all tables from scratch...")
Base.metadata.create_all(engine)
print("✅ Success: Tables re-initialized from metropolitan models.")
