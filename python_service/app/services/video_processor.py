# File: app/services/video_processor.py

import cv2
from app.models.yolo import detect_people
from app.models.mediapipe_model import analyze_pose


def process_video_file(path):
    cap = cv2.VideoCapture(path)

    frames = []
    count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # 🔥 optimize (every 5th frame)
        if count % 5 == 0:
            frame = cv2.resize(frame, (640, 480))

            detections = detect_people(frame)
            mp = analyze_pose(frame)

            frames.append({
                "detections": detections,
                "motion": mp
            })

        count += 1

    cap.release()

    return frames