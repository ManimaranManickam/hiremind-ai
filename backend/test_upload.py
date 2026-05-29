import requests

# 1. Login to get token
login_data = {"username": "candidate@hiremind.ai", "password": "candidate123"}
r = requests.post("http://localhost:8000/api/auth/login", data=login_data)
if r.status_code != 200:
    print("Login failed:", r.text)
    exit()

token = r.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# 2. Upload file
with open("uploads/resumes/3_Kumar_A_MCA.pdf", "rb") as f:
    r2 = requests.post("http://localhost:8000/api/resumes/upload", files={"file": f}, headers=headers)
print("Upload status:", r2.status_code)
print("Upload response:", r2.text)
