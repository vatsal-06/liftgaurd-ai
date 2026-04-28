from ultralytics import YOLO

model = YOLO("yolov8n.pt")

def detect_people(image):
    results = model(image)[0]

    detections = []
    for box in results.boxes.xyxy:
        x1, y1, x2, y2 = box.tolist()
        detections.append({
            "x": x1,
            "y": y1,
            "w": x2 - x1,
            "h": y2 - y1
        })

    return detections