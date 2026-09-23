"""
inference/parts_detector.py
Wraps the newly trained vehicle-part segmentation model (models/parts/best.pt).
Normalizes output per Section 11 of the requirements doc.

Returns full-resolution binary masks (numpy arrays) rather than encoded strings,
since the fusion layer needs to do pixel-level overlap math directly. Convert
to a serializable format (e.g. RLE or base64 PNG) only at the API boundary,
not inside this module.
"""
import numpy as np
from ultralytics import YOLO

PART_CONFIDENCE_THRESHOLD = 0.35


class PartsDetector:
    def __init__(self, model_path, confidence_threshold=PART_CONFIDENCE_THRESHOLD):
        self.model = YOLO(model_path)
        self.confidence_threshold = confidence_threshold
        self.model_version = "parts-v1"  # Section 34 traceability requirement

    def detect(self, image_path):
        """
        Returns a list of normalized part detections (Section 11 schema):
        [{"part_id": 1, "part": "front_bumper", "confidence": 0.94, "mask": <np.ndarray bool>}, ...]
        Returns [] if no part is detected (e.g. poor image quality, Section 30).
        """
        results = self.model(image_path, verbose=False)[0]
        detections = []

        if results.masks is None:
            return detections  # no segmentation masks produced at all

        img_h, img_w = results.orig_shape

        for i, (box, mask_data) in enumerate(zip(results.boxes, results.masks.data)):
            conf = float(box.conf[0])
            if conf < self.confidence_threshold:
                continue
            cls_id = int(box.cls[0])
            part_name = self.model.names[cls_id]

            # mask_data is a tensor at model input resolution; resize to original image size
            mask_np = mask_data.cpu().numpy().astype(np.uint8)
            if mask_np.shape != (img_h, img_w):
                import cv2
                mask_np = cv2.resize(mask_np, (img_w, img_h), interpolation=cv2.INTER_NEAREST)
            binary_mask = mask_np.astype(bool)

            detections.append({
                "part_id": i + 1,
                "part": part_name,
                "confidence": round(conf, 3),
                "mask": binary_mask,  # numpy bool array, shape (img_h, img_w)
            })

        return detections
