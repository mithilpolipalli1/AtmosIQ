from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
from worker.tasks import ingest_data, run_anomaly_detection
from datetime import datetime

scheduler = BlockingScheduler()

def job_listener(event):
    if event.exception:
        print(f"\n❌ [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Job FAILED: {event.job_id}")
        print(f"   Error: {event.exception}")
    else:
        print(f"\n✅ [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Job SUCCESS: {event.job_id}")

scheduler.add_listener(job_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)

scheduler.add_job(
    ingest_data,
    'interval',
    minutes=15,
    id='ingestion_job',
    name='Live Data Ingestion'
)

scheduler.add_job(
    run_anomaly_detection,
    'interval',
    minutes=15,
    id='anomaly_job',
    name='Anomaly Detection'
)

def start():
    print("="*50)
    print("  UrbanPulse Worker Started")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("  Ingestion     → every 15 minutes")
    print("  Anomaly Check → every 15 minutes")
    print("="*50)

    # Run once immediately on startup
    print("\n⚡ Running initial cycle on startup...")
    ingest_data()
    run_anomaly_detection()

    scheduler.start()