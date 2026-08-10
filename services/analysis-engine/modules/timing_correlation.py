import numpy as np
from scipy import signal

def compute_timing_correlation(entry_timestamps: list[float], exit_timestamps: list[float]) -> dict:
    if not entry_timestamps or not exit_timestamps:
        return {"sub_score": 0.0, "feature_vector": [], "method": "pearson_cross_correlation"}

    # Normalize timestamps to relative intervals (inter-arrival times)
    entry_diffs = np.diff(sorted(entry_timestamps))
    exit_diffs = np.diff(sorted(exit_timestamps))
    
    if len(entry_diffs) < 2 or len(exit_diffs) < 2:
        return {"sub_score": 0.0, "feature_vector": [], "method": "pearson_cross_correlation"}
        
    # Normalize the signals
    e1 = entry_diffs - np.mean(entry_diffs)
    e2 = exit_diffs - np.mean(exit_diffs)
    
    std1 = np.std(entry_diffs)
    std2 = np.std(exit_diffs)
    
    if std1 == 0 or std2 == 0:
        return {"sub_score": 0.0, "feature_vector": [], "method": "pearson_cross_correlation"}
        
    e1 = e1 / (std1 * len(e1))
    e2 = e2 / std2
    
    # Compute cross-correlation
    corr = signal.correlate(e1, e2, mode='full')
    max_corr = np.max(corr)
    
    # Clamp to [0-1] range roughly
    sub_score = max(0.0, min(1.0, float(max_corr)))
    
    return {
        "sub_score": sub_score, 
        "feature_vector": [float(x) for x in corr[:10]],
        "method": "pearson_cross_correlation"
    }
