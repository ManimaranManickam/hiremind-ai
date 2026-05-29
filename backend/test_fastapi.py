from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# 1. Login
r = client.post("/api/auth/login", data={"username": "candidate@hiremind.ai", "password": "candidate123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Upload
with open("uploads/resumes/3_Kumar_A_MCA.pdf", "rb") as f:
    r2 = client.post("/api/resumes/upload", files={"file": ("3_Kumar_A_MCA.pdf", f, "application/pdf")}, headers=headers)

print("Status code:", r2.status_code)
print("Response:", r2.text)
if r2.status_code == 500:
    import traceback
    try:
        pass # The traceback will be printed by fastapi to stderr
    except:
        pass
