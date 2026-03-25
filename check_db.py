import sqlite3
import os

db_path = "urbanpulse-backend/atmosiq.db"
if not os.path.exists(db_path):
    db_path = "atmosiq.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    # Check table schema
    cursor.execute("PRAGMA table_info(environmental_anomalies)")
    cols = cursor.fetchall()
    print("Columns:", [c[1] for c in cols])
    
    cursor.execute("SELECT count(*) FROM environmental_anomalies")
    count = cursor.fetchone()[0]
    print(f"Total Anomalies: {count}")
    
    if count > 0:
        cursor.execute("SELECT * FROM environmental_anomalies ORDER BY created_at DESC LIMIT 5")
        rows = cursor.fetchall()
        for row in rows:
            print(row)
    conn.close()
else:
    print(f"DB not found at {db_path}")
