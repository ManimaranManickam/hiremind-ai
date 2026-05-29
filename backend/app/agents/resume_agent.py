import os
import json
from openai import OpenAI
from app.utils.file_parser import extract_text_from_file

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy_key"))

def analyze_resume(file_path: str):
    """
    Extracts text from a resume and uses an LLM to parse out skills, experience,
    and generate an ATS score.
    """
    try:
        text = extract_text_from_file(file_path)
    except Exception as e:
        print(f"Error parsing file: {e}")
        return None

    prompt = f"""
    You are an expert AI Technical Recruiter. Analyze the following resume text and extract key information.
    Format your response EXACTLY as a valid JSON object. Do not include markdown formatting like ```json.
    
    Required JSON structure:
    {{
        "parsed_skills": ["skill1", "skill2"],
        "experience_summary": "A 2 sentence summary of the candidate's experience.",
        "ats_score": 85.5,
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1"]
    }}

    Resume Text:
    {text}
    """

    try:
        # We use a mocked response if the dummy key is present (for local testing without a real key)
        if os.getenv("OPENAI_API_KEY") is None or "dummy" in os.getenv("OPENAI_API_KEY", "dummy"):
            return {
                "parsed_skills": ["Python", "React", "FastAPI", "SQL"],
                "experience_summary": "Experienced full-stack developer with a strong background in building scalable web applications.",
                "ats_score": 88.5,
                "strengths": ["Strong backend skills", "Good project experience"],
                "weaknesses": ["Lacks cloud architecture experience"]
            }

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful AI recruiting assistant. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        
        result_text = response.choices[0].message.content
        return json.loads(result_text)
    except Exception as e:
        print(f"Error analyzing resume with LLM: {e}")
        return None
