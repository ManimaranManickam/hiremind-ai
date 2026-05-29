from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# 1. Login
r = client.post("/api/auth/login", data={"username": "candidate@hiremind.ai", "password": "candidate123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

r2 = client.get("/api/resumes/1", headers=headers)
print("Status code:", r2.status_code)
print("Response:", r2.text)
