"""
inference/severity_detector.py
Wraps the learned severity detection model (models/severity/best.pt),
trained on Roboflow's car_damage_severity dataset (minor/moderate/severe).
"""
from ultralytics import YOLO

SEVERITY_CONFIDENCE_THRESHOLD = 0.35


class SeverityDetector:
    def __init__(self, model_path, confidence_threshold=SEVERITY_CONFIDENCE_THRESHOLD):
        self.model = YOLO(model_path)
        self.confidence_threshold = confidence_threshold
        self.model_version = "severity-v1"

    def detect(self, image_path):
        """
        Returns a list of severity detections:
        [{"severity": "moderate", "confidence": 0.82, "bbox": [x1,y1,x2,y2]}, ...]
        """
        results = self.model(image_path, verbose=False)[0]
        detections = []

        for box in results.boxes:
            conf = float(box.conf[0])
            if conf < self.confidence_threshold:
                continue
            cls_id = int(box.cls[0])
            severity_label = self.model.names[cls_id]
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "severity": severity_label.capitalize(),  # normalize to Minor/Moderate/Severe
                "confidence": round(conf, 3),
                "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
            })

        return detections
