import cv2
import sys
import numpy as np
import base64
import json

# Load pre-trained face detection model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def process_frame(frame_data):
    # Decode base64 image
    frame_bytes = base64.b64decode(frame_data)
    frame_array = np.frombuffer(frame_bytes, dtype=np.uint8)
    frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)

    # Convert to grayscale for face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    # Prepare result
    result = {
        "faces": len(faces),
        "face_locations": [{"x": x, "y": y, "width": w, "height": h} for (x, y, w, h) in faces]
    }

    # Return JSON result
    print(json.dumps(result))

if __name__ == "__main__":
    frame_data = sys.argv[1]
    process_frame(frame_data)