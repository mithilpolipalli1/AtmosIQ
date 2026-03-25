"""Migration: Rename industrial 'zone' to metropolitan 'city' in anomalies table."""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load env from the backend directory
load_dotenv("urbanpulse-backend/.env")
db_url = os.getenv("DATABASE_URL")

if not db_url:
    # try direct path
    load_dotenv(".env")
    db_url = os.getenv("DATABASE_URL")

if not db_url:
    print("❌ DATABASE_URL not found")
    exit(1)

engine = create_engine(db_url)

with engine.connect() as conn:
    print(f"Connecting to {db_url}...")
    try:
        # Check if 'zone' column exists
        conn.execute(text("ALTER TABLE environmental_anomalies RENAME COLUMN zone TO city"))
        conn.commit()
        print("✅ Migration complete: 'zone' column renamed to 'city'")
    except Exception as e:
        if "does not exist" in str(e).lower() or "missing" in str(e).lower():
            print("ℹ️ Column 'zone' not found. It might already be renamed or the table doesn't exist.")
        else:
            print(f"❌ Error during migration: {e}")
