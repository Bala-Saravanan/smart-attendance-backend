from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import cv2
import numpy as np
import mediapipe as mp
from pymongo import MongoClient
import json

app = FastAPI()

mp_face_mesh = mp.solutions.face_mesh

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["test"]
users = db["users"]


@app.post("/register-face")
async def register_face(studentData: str = Form(...), file: UploadFile = File(...)):
    # Read uploaded image
    image_data = await file.read()
    np_img = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    try:
        student_data = json.loads(studentData)  # parse string to dict
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in details")

    print("DEBUG student_data:", student_data)
    print("DEBUG file:", file.filename)

    # Extract facial landmarks
    with mp_face_mesh.FaceMesh(static_image_mode=True) as face_mesh:
        results = face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

        if not results.multi_face_landmarks:
            return {"status": "error", "message": "No face detected"}

        # Take the first face landmarks
        landmarks = results.multi_face_landmarks[0]
        encoding = [(lm.x, lm.y, lm.z) for lm in landmarks.landmark]

        # Save encoding in MongoDB
        # print("DEBUG student_data:", student_data)

        users.update_one(
            {"email": student_data["email"]},
            {"$set": {"faceEncoding": encoding}},
            upsert=True,
        )

        return {"status": "success", "message": "Face registered", "encoding": encoding}


# TODO:
# multiple faces from single photos
# verify teacher
