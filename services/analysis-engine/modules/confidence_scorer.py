def combine_scores(signals: list[dict]) -> float:
    if not signals:
        return 0.0
        
    weights = {
        'pearson_cross_correlation': 0.5,
        'traffic_shape_cosine': 0.3,
        'descriptor_pattern_fft': 0.2
    }
    
    combined_score = 0.0
    total_weight = 0.0
    
    for signal in signals:
        method = signal.get("method")
        sub_score = signal.get("sub_score", 0.0)
        
        if method in weights:
            weight = weights[method]
            combined_score += sub_score * weight
            total_weight += weight
            
    if total_weight > 0:
        combined_score = combined_score / total_weight
        
    combined_score = max(0.0, min(1.0, combined_score))
    
    # Enforce epistemic humility - never return > 0.95
    combined_score = min(0.95, combined_score)
    
    return combined_score
