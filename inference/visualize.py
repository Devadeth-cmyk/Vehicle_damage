"""
inference/visualize.py
Generates annotated images showing part name, damage type, and confidence
values, per Section 23 of the requirements doc — visual evidence for
service-center and insurer reviewers.
"""
import cv2

REVIEW_COLOR = (0, 0, 255)     # red — flagged for human review
OK_COLOR = (0, 200, 0)         # green — high-confidence, no review needed
UNKNOWN_COLOR = (255, 165, 0)  # orange — unknown part


def annotate_image(image_path, fused_detections, output_path):
    """
    Draws each fused detection's bounding box, part label, damage type,
    and confidence values onto the image, and saves it to output_path.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")

    for det in fused_detections:
        x1, y1, x2, y2 = [int(v) for v in det["bbox"]]

        if det["part"] == "unknown":
            color = UNKNOWN_COLOR
        elif det.get("requires_review"):
            color = REVIEW_COLOR
        else:
            color = OK_COLOR

        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

        part_label = det["part"].replace("_", " ").upper()
        damage_label = f"{det['damage_type']} ({det['damage_confidence']:.0%})"
        review_label = " [REVIEW]" if det.get("requires_review") else ""

        line1 = f"{part_label}"
        line2 = f"{damage_label}{review_label}"

        cv2.putText(img, line1, (x1, max(y1 - 24, 12)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)
        cv2.putText(img, line2, (x1, max(y1 - 6, 26)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    cv2.imwrite(output_path, img)
    return output_path
