import mediapipe as mp

mp_pose = mp.solutions.pose

pose = mp_pose.Pose()

def analyze_pose(image):
    results = pose.process(image)

    if not results.pose_landmarks:
        return {"motion_score": 0.0, "fall_detected": False}

    # simple heuristic
    motion_score = 0.5
    fall_detected = False

    return {
        "motion_score": motion_score,
        "fall_detected": fall_detected
    }