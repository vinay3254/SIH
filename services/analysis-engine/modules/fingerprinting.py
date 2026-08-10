import numpy as np
from scipy.spatial.distance import cosine

def compute_traffic_fingerprint(packet_sizes: list[int]) -> dict:
    if not packet_sizes:
        return {"sub_score": 0.0, "feature_vector": [], "method": "traffic_shape_cosine"}
        
    sizes = np.array(packet_sizes)
    
    # Statistical fingerprint
    mean_val = np.mean(sizes)
    std_dev = np.std(sizes)
    median_val = np.median(sizes)
    
    q75, q25 = np.percentile(sizes, [75 ,25])
    iqr = q75 - q25
    
    # Burst ratio simulation (e.g. number of packets > mean + 1 std)
    burst_ratio = np.sum(sizes > (mean_val + std_dev)) / len(sizes) if len(sizes) > 0 else 0
    
    feature_vector = [float(mean_val), float(std_dev), float(median_val), float(iqr), float(burst_ratio)]
    
    # Mock known traffic shape signature
    known_signature = [500.0, 200.0, 450.0, 300.0, 0.15]
    
    if np.all(np.array(feature_vector) == 0) or np.all(np.array(known_signature) == 0):
        similarity = 0.0
    else:
        # cosine distance returns 0 for identical, 1 for orthogonal
        similarity = 1 - cosine(feature_vector, known_signature)
        
    sub_score = max(0.0, min(1.0, float(similarity)))
    
    return {
        "sub_score": sub_score,
        "feature_vector": feature_vector,
        "method": "traffic_shape_cosine"
    }
