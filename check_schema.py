import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv("urbanpulse-backend/.env")
db_url = os.getenv("DATABASE_URL")
if not db_url: load_dotenv(".env"); db_url = os.getenv("DATABASE_URL")

engine = create_engine(db_url)
with engine.connect() as conn:
    print(f"Connecting to {db_url}...")
    try:
        query = text("SELECT column_name FROM information_schema.columns WHERE table_name = 'environmental_anomalies'")
        result = conn.execute(query)
        cols = [r[0] for r in result]
        print("Table Columns:", cols)
    except Exception as e:
        print(f"❌ Error during column check: {e}")
