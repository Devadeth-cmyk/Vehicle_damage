"""
inference/damage_detector.py
Wraps the existing CARDD-trained damage model (models/damage/best.pt).
Normalizes output per Section 10 of the requirements doc.

The model is loaded once and reused (Section 32 note: do not reload .pt
files per request).
"""
from ultralytics import YOLO
from severity_estimator import estimate_severity, resolve_severity

DAMAGE_CONFIDENCE_THRESHOLD = 0.35


class DamageDetector:
    def __init__(self, model_path, confidence_threshold=DAMAGE_CONFIDENCE_THRESHOLD):
        self.model = YOLO(model_path)
        self.confidence_threshold = confidence_threshold
        self.model_version = "cardd-v1"  # Section 34 traceability requirement

    def detect(self, image_path, severity_detections=None):
        """
        Returns a list of normalized damage detections (Section 10 schema):
        [{"damage_id": 1, "damage_type": "dent", "bbox": [x1,y1,x2,y2],
          "confidence": 0.91, "severity": "Moderate",
          "severity_source": "model" | "heuristic"}, ...]
        Returns [] if no damage is detected (Section 30 error handling).

        severity_detections: optional list from SeverityDetector.detect() for
        this same image. If provided, the learned severity model is preferred
        (via box-IoU matching); otherwise the heuristic is used for every
        detection.
        """
        results = self.model(image_path, verbose=False)[0]
        img_h, img_w = results.orig_shape
        img_area = img_h * img_w
        detections = []

        for i, box in enumerate(results.boxes):
            conf = float(box.conf[0])
            if conf < self.confidence_threshold:
                continue
            cls_id = int(box.cls[0])
            damage_type = self.model.names[cls_id]
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            bbox = [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)]

            if severity_detections:
                sev_result = resolve_severity(damage_type, bbox, img_area, severity_detections)
                severity = sev_result["severity"]
                severity_source = sev_result["source"]
            else:
                severity = estimate_severity(damage_type, bbox=bbox, img_area=img_area)
                severity_source = "heuristic"

            detections.append({
                "damage_id": i + 1,
                "damage_type": damage_type,
                "bbox": bbox,
                "confidence": round(conf, 3),
                "severity": severity,
                "severity_source": severity_source,
            })

        return detections
