from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
import tempfile
import base64

from app.models.yolo import detect_people
from app.models.mediapipe_model import analyze_pose
from app.services.video_processor import process_video_file

app = FastAPI()

@app.get("/healthz")
def health():
    return {"status": "ok"}

# ---------- IMAGE ----------

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    detections = detect_people(image)
    mp = analyze_pose(image)

    return {
        "summary": {
            "num_people": len(detections),
            "risk": "MEDIUM"
        },
        "metrics": mp,
        "people": [{"bbox": d} for d in detections]
    }

# ---------- VIDEO ----------

@app.post("/process-video")
async def process_video(file: UploadFile = File(...)):
    temp = tempfile.NamedTemporaryFile(delete=False)
    temp.write(await file.read())

    frames = process_video_file(temp.name)

    # For demo, just return empty video
    return {
        "summary": {"frames_processed": len(frames)},
        "annotated_video": ""
    }