import cv2
import mediapipe as mp

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, enable_segmentation=False)

def analyze_pose(image):
    try:
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)

        if not results.pose_landmarks:
            return {
                "motion_score": 0.0,
                "fall_detected": False
            }

        # basic heuristic (you can improve later)
        motion_score = 0.5

        return {
            "motion_score": motion_score,
            "fall_detected": False
        }

    except Exception as e:
        print("MediaPipe error:", e)
        return {
            "motion_score": 0.0,
            "fall_detected": False
        }