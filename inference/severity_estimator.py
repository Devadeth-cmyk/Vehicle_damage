"""
inference/severity_estimator.py
Estimates damage severity (Minor / Moderate / Severe).

CarDD has no ground-truth severity labels, so severity here is a project-defined
heuristic, not a learned output — this must be stated explicitly in the report
as a known scoping decision, not presented as a validated model prediction.

Base mapping (by damage type alone):
    scratch        -> Minor
    dent           -> Moderate
    crack          -> Moderate
    lamp broken    -> Moderate
    glass shatter  -> Severe
    tire flat      -> Severe

Optional refinement: if the damaged area covers an unusually large fraction of
the image, the severity is escalated one level (Minor->Moderate, Moderate->Severe).
This is an explainable, rule-based adjustment — not a black-box score — and can
be disabled by passing use_area_escalation=False.
"""
BASE_SEVERITY_MAP = {
    "scratch": "Minor",
    "dent": "Moderate",
    "crack": "Moderate",
    "lamp broken": "Moderate",
    "glass shatter": "Severe",
    "tire flat": "Severe",
}

# If the damage bounding box covers more than this fraction of the image,
# escalate severity by one level. Tuned conservatively — adjust based on
# testing against real sample images.
AREA_ESCALATION_THRESHOLD = 0.30

_SEVERITY_ORDER = ["Minor", "Moderate", "Severe"]


def _escalate(severity_label):
    idx = _SEVERITY_ORDER.index(severity_label)
    return _SEVERITY_ORDER[min(idx + 1, len(_SEVERITY_ORDER) - 1)]


def estimate_severity(damage_type, bbox=None, img_area=None, use_area_escalation=True):
    """
    Returns a severity label: "Minor", "Moderate", or "Severe".
    Falls back to "Moderate" for any damage_type not in the base map
    (rather than raising or silently defaulting to Minor, which would
    understate an unrecognized damage type).
    """
    base_severity = BASE_SEVERITY_MAP.get(damage_type, "Moderate")

    if not use_area_escalation or bbox is None or not img_area:
        return base_severity

    x1, y1, x2, y2 = bbox
    box_area = max(0.0, (x2 - x1)) * max(0.0, (y2 - y1))
    area_ratio = box_area / img_area if img_area > 0 else 0.0

    if area_ratio >= AREA_ESCALATION_THRESHOLD:
        return _escalate(base_severity)

    return base_severity


IOU_MATCH_THRESHOLD = 0.30  # minimum box IoU to trust the learned model's severity over the heuristic


def _box_iou(box_a, box_b):
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b

    inter_x1, inter_y1 = max(ax1, bx1), max(ay1, by1)
    inter_x2, inter_y2 = min(ax2, bx2), min(ay2, by2)

    inter_area = max(0.0, inter_x2 - inter_x1) * max(0.0, inter_y2 - inter_y1)
    area_a = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
    area_b = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
    union = area_a + area_b - inter_area

    return inter_area / union if union > 0 else 0.0


def resolve_severity(damage_type, damage_bbox, img_area, severity_detections,
                      iou_threshold=IOU_MATCH_THRESHOLD, use_area_escalation=True):
    """
    Picks the best available severity for one damage detection:
    1. If a learned severity-model detection overlaps this damage box above
       iou_threshold, use that model's prediction (the learned signal).
    2. Otherwise, fall back to the project-defined heuristic.

    Always returns a dict: {"severity": <label>, "source": "model" | "heuristic",
                             "confidence": <float or None>}
    so the caller (and your report) can clearly see which path produced each value.
    """
    best_match, best_iou = None, 0.0
    for sev_det in severity_detections:
        iou = _box_iou(damage_bbox, sev_det["bbox"])
        if iou > best_iou:
            best_match, best_iou = sev_det, iou

    if best_match is not None and best_iou >= iou_threshold:
        return {
            "severity": best_match["severity"],
            "source": "model",
            "confidence": best_match["confidence"],
            "iou": round(best_iou, 3),
        }

    heuristic_result = estimate_severity(
        damage_type, bbox=damage_bbox, img_area=img_area, use_area_escalation=use_area_escalation
    )
    return {
        "severity": heuristic_result,
        "source": "heuristic",
        "confidence": None,
        "iou": round(best_iou, 3) if best_match else 0.0,
    }
