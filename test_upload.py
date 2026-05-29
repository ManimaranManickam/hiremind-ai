import requests

# 1. Login to get token
r = requests.post("http://127.0.0.1:8000/api/auth/login", data={"username": "admin@hiremind.ai", "password": "password"})
token = r.json().get("access_token")

# 2. Upload dummy file
with open("dummy.pdf", "w") as f:
    f.write("hello world")

headers = {"Authorization": f"Bearer {token}"}
files = {"file": ("dummy.pdf", open("dummy.pdf", "rb"), "application/pdf")}
r = requests.post("http://127.0.0.1:8000/api/resumes/upload", headers=headers, files=files)
print("Upload:", r.status_code, r.text)
resume_id = r.json().get("id")

import time
time.sleep(2)

# 3. Check status
r = requests.get(f"http://127.0.0.1:8000/api/resumes/{resume_id}", headers=headers)
print("Status:", r.status_code, r.text)
