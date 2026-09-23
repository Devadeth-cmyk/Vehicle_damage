"""
inference/claim_analyzer.py
Orchestrates the full pipeline for a claim with one or more photographs:
image -> damage detection + parts detection -> fusion -> per-image JSON
-> aggregated claim-level JSON (Section 20-21).

Section 34 reliability requirement: a failure on one image must not
terminate processing of the entire claim.
"""
import os
import cv2
from damage_detector import DamageDetector
from parts_detector import PartsDetector
from fusion import fuse_detections
from repair_estimator import estimate_claim_repair_total

try:
    from severity_detector import SeverityDetector
except ImportError:
    SeverityDetector = None


class ClaimAnalyzer:
    def __init__(self, damage_model_path, parts_model_path, severity_model_path=None):
        # Models loaded once and reused (Section 32) — do this at app startup,
        # not per request, when wiring into a backend.
        self.damage_detector = DamageDetector(damage_model_path)
        self.parts_detector = PartsDetector(parts_model_path)

        self.severity_detector = None
        if severity_model_path and SeverityDetector is not None:
            self.severity_detector = SeverityDetector(severity_model_path)

    def analyze_image(self, image_path, vehicle_segment="economy"):
        """
        Runs the full pipeline on a single image.
        Returns a dict matching Section 29's recommended fusion JSON schema,
        or a controlled error status (Section 30) rather than raising.
        Includes a per-image repair cost estimate alongside the detections.
        """
        image_name = os.path.basename(image_path)

        if not os.path.exists(image_path):
            return {"image": image_name, "status": "INVALID_IMAGE", "detections": []}

        img = cv2.imread(image_path)
        if img is None:
            return {"image": image_name, "status": "INVALID_IMAGE", "detections": []}

        img_h, img_w = img.shape[:2]

        try:
            severity_detections = None
            if self.severity_detector is not None:
                severity_detections = self.severity_detector.detect(image_path)
            damage_detections = self.damage_detector.detect(image_path, severity_detections=severity_detections)
        except Exception as e:
            return {"image": image_name, "status": "DAMAGE_MODEL_ERROR", "error": str(e), "detections": []}

        try:
            part_detections = self.parts_detector.detect(image_path)
        except Exception as e:
            return {"image": image_name, "status": "PARTS_MODEL_ERROR", "error": str(e), "detections": []}

        if not damage_detections:
            return {
                "image": image_name,
                "status": "completed",
                "detections": [],
                "repair_estimate": estimate_claim_repair_total([], vehicle_segment=vehicle_segment),
            }

        fused = fuse_detections(damage_detections, part_detections, img_h, img_w)
        repair_estimate = estimate_claim_repair_total(fused, vehicle_segment=vehicle_segment)

        return {
            "image": image_name,
            "status": "completed",
            "detections": fused,
            "repair_estimate": repair_estimate,
        }

    def analyze_claim(self, claim_id, image_paths, vehicle_segment="economy"):
        """
        Processes every photograph submitted for a claim (Section 20-21).
        A failure on one image is recorded but does not stop the others.
        Returns a claim-level repair estimate aggregated across ALL images,
        in addition to each image's own detections and per-image estimate.

        Known limitation: if the same physical damage appears in multiple
        photos (e.g. two angles of the same dent), it is currently counted
        once per photo it appears in, which can overstate the claim-level
        total. Deduplicating damage across images would need cross-image
        matching (e.g. by part + damage_type + rough position), which is
        not yet implemented — flag this explicitly in your report.
        """
        images_result = []
        all_detections_for_claim = []

        for image_path in image_paths:
            try:
                result = self.analyze_image(image_path, vehicle_segment=vehicle_segment)
                all_detections_for_claim.extend(result.get("detections", []))
            except Exception as e:
                result = {
                    "image": os.path.basename(image_path),
                    "status": "PROCESSING_ERROR",
                    "error": str(e),
                    "detections": [],
                }
            images_result.append(result)

        claim_repair_estimate = estimate_claim_repair_total(
            all_detections_for_claim, vehicle_segment=vehicle_segment
        )

        return {
            "claim_id": claim_id,
            "damage_model_version": self.damage_detector.model_version,
            "parts_model_version": self.parts_detector.model_version,
            "images": images_result,
            "claim_repair_estimate": claim_repair_estimate,
        }
