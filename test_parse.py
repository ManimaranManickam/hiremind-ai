import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.utils.file_parser import extract_text_from_file
from app.agents.resume_agent import analyze_resume

try:
    print("Writing a dummy pdf...")
    with open("dummy.pdf", "w") as f:
        f.write("hello world")
except Exception as e:
    print(e)

try:
    res = analyze_resume("dummy.pdf")
    print(res)
except Exception as e:
    print(f"Error: {e}")

