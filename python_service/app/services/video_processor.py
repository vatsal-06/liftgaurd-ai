import cv2
import base64
from . import yolo, mediapipe_model

def process_video_file(path):
    cap = cv2.VideoCapture(path)

    frames = []
    count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # 🔥 SAMPLE every 5th frame (OPTIMIZATION)
        if count % 5 == 0:
            detections = yolo.detect_people(frame)
            mp = mediapipe_model.analyze_pose(frame)

            frames.append({
                "detections": detections,
                "motion": mp
            })

        count += 1

    cap.release()

    return frames