import numpy as np

def compute_metadata_signals(descriptor_timestamps: list[float], guard_nodes: list[str]) -> dict:
    feature_vector = []
    sub_score = 0.0
    
    if descriptor_timestamps and len(descriptor_timestamps) > 2:
        hist, _ = np.histogram(descriptor_timestamps, bins=24)
        fft_result = np.fft.fft(hist)
        magnitudes = np.abs(fft_result)[1:len(fft_result)//2]
        if len(magnitudes) > 0:
            max_mag = np.max(magnitudes)
            feature_vector.extend([float(x) for x in magnitudes[:5]])
            periodicity_score = min(1.0, float(max_mag) / (np.sum(hist) + 1))
            sub_score += periodicity_score * 0.5
            
    if guard_nodes:
        unique_guards = len(set(guard_nodes))
        if unique_guards < 2:
            guard_anomaly_score = 0.8
        else:
            guard_anomaly_score = 0.1
            
        feature_vector.append(float(unique_guards))
        sub_score += guard_anomaly_score * 0.5
        
    sub_score = max(0.0, min(1.0, sub_score))
        
    return {
        "sub_score": sub_score,
        "feature_vector": feature_vector,
        "method": "descriptor_pattern_fft"
    }
