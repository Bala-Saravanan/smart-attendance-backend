# from fastapi import FastAPI, UploadFile, File
# import cv2
# import numpy as np
# import mediapipe as mp
# from pymongo import MongoClient

# app = FastAPI()
# mp_face_mesh = mp.solutions.face_mesh

# # MongoDB connection
# client = MongoClient("mongodb://localhost:27017/")
# db = client["test"]
# users = db["users"]


# def calculate_similarity(encoding1, encoding2):
#     # Simple Euclidean distance for now
#     if len(encoding1) != len(encoding2):
#         return float("inf")
#     dist = np.mean(
#         [
#             np.linalg.norm(np.array(e1) - np.array(e2))
#             for e1, e2 in zip(encoding1, encoding2)
#         ]
#     )
#     return dist


# @app.post("/recognize-face")
# async def recognize_face(file: UploadFile = File(...)):
#     # Read uploaded image
#     image_data = await file.read()
#     np_img = np.frombuffer(image_data, np.uint8)
#     img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

#     with mp_face_mesh.FaceMesh(static_image_mode=True) as face_mesh:
#         results = face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

#         if not results.multi_face_landmarks:
#             return {"status": "error", "message": "No face detected"}

#         input_encoding = [
#             (lm.x, lm.y, lm.z) for lm in results.multi_face_landmarks[0].landmark
#         ]

#         # Compare with DB
#         best_match = None
#         best_dist = float("inf")
#         for user in users.find({"faceEncoding": {"$exists": True}}):
#             db_encoding = user["faceEncoding"]
#             dist = calculate_similarity(input_encoding, db_encoding)
#             if dist < best_dist:
#                 best_match = user
#                 best_dist = dist

#         # print(best_match, best_dist)
#         if best_match and best_dist < 0.15:  # threshold (tune for accuracy)
#             return {
#                 "status": "success",
#                 "studentId": str(best_match["_id"]),
#                 "confidence": 1 - best_dist,
#             }

#         return {"status": "error", "message": "No match found"}

# backend/src/services/faceRecognition.py
from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
from pymongo import MongoClient
import mediapipe as mp

app = FastAPI()

mp_face_mesh = mp.solutions.face_mesh

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["test"]
users = db["users"]  # assume each user document has 'email' and 'faceEncoding'


def calculate_similarity(encoding1, encoding2):
    # Euclidean distance between landmarks
    if len(encoding1) != len(encoding2):
        return float("inf")
    dist = np.mean(
        [
            np.linalg.norm(np.array(e1) - np.array(e2))
            for e1, e2 in zip(encoding1, encoding2)
        ]
    )
    return dist


@app.post("/recognize-face")
async def recognize_face(file: UploadFile = File(...)):
    # Read uploaded image
    image_data = await file.read()
    np_img = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    recognized_students = []

    with mp_face_mesh.FaceMesh(static_image_mode=True) as face_mesh:
        results = face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

        if not results.multi_face_landmarks:
            return {"status": "error", "message": "No faces detected"}

        for face_landmarks in results.multi_face_landmarks:
            input_encoding = [(lm.x, lm.y, lm.z) for lm in face_landmarks.landmark]

            # Compare with DB
            best_match = None
            best_dist = float("inf")
            for user in users.find({"faceEncoding": {"$exists": True}}):
                db_encoding = user["faceEncoding"]
                dist = calculate_similarity(input_encoding, db_encoding)
                if dist < best_dist:
                    best_match = user
                    best_dist = dist

            # threshold can be tuned
            if best_match and best_dist < 0.05:  # example threshold
                recognized_students.append(
                    {
                        "studentId": str(best_match["_id"]),
                        "confidence": round(1 - best_dist, 2),
                    }
                )

    if recognized_students:
        return {"status": "success", "students": recognized_students}
    else:
        return {"status": "error", "message": "No match found"}
