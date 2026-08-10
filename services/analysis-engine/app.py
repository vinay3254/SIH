from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid
import time
from modules.timing_correlation import compute_timing_correlation
from modules.fingerprinting import compute_traffic_fingerprint
from modules.metadata_analysis import compute_metadata_signals
from modules.confidence_scorer import combine_scores

app = Flask(__name__)
CORS(app)

# In-memory job store for prototype
jobs = {}

@app.route('/healthz', methods=['GET'])
def healthz():
    return jsonify({"status": "ok", "service": "analysis-engine"})

@app.route('/api/v1/analysis/correlate', methods=['POST'])
def correlate():
    data = request.json or {}
    job_id = str(uuid.uuid4())
    
    # Store initial job status
    jobs[job_id] = {
        "status": "processing",
        "created_at": time.time(),
        "results": None
    }
    
    # Extract data for processing
    entry_timestamps = data.get('entry_timestamps', [])
    exit_timestamps = data.get('exit_timestamps', [])
    packet_sizes = data.get('packet_sizes', [])
    descriptor_timestamps = data.get('descriptor_timestamps', [])
    guard_nodes = data.get('guard_nodes', [])
    
    # Simulate processing synchronously for prototype simplicity
    try:
        signals = []
        if entry_timestamps and exit_timestamps:
            signals.append(compute_timing_correlation(entry_timestamps, exit_timestamps))
        
        if packet_sizes:
            signals.append(compute_traffic_fingerprint(packet_sizes))
            
        if descriptor_timestamps or guard_nodes:
            signals.append(compute_metadata_signals(descriptor_timestamps, guard_nodes))
            
        confidence_score = combine_scores(signals) if signals else 0.0
        
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["results"] = {
            "candidates": [
                {
                    "id": "candidate_1",
                    "confidence_score": confidence_score,
                    "contributing_signals": signals
                }
            ]
        }
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)

    return jsonify({"jobId": job_id}), 202

@app.route('/api/v1/analysis/<job_id>/status', methods=['GET'])
def get_job_status(job_id):
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    return jsonify({"jobId": job_id, "status": jobs[job_id]["status"]})

@app.route('/api/v1/analysis/<job_id>/results', methods=['GET'])
def get_job_results(job_id):
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
        
    if jobs[job_id]["status"] != "completed":
        return jsonify({"error": "Job not completed yet", "status": jobs[job_id]["status"]}), 400
        
    return jsonify(jobs[job_id]["results"])

@app.route('/api/v1/analysis/jobs/activity', methods=['GET'])
def get_job_activity():
    # Return 14-day job activity data
    import datetime
    today = datetime.date.today()
    activity = []
    for i in range(14):
        day = today - datetime.timedelta(days=13-i)
        activity.append({
            "date": day.isoformat(),
            "count": (i * 10) % 25 + 5
        })
    return jsonify(activity)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004)
