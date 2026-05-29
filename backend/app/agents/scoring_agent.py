import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy_key"))

def generate_candidate_score(resume_text: str, job_description: str):
    """
    Compares the resume text against the job description and generates a match score
    along with reasoning.
    """
    prompt = f"""
    You are an expert ATS (Applicant Tracking System) and AI Recruiter. 
    Compare the candidate's resume with the job description and provide a match score out of 100.
    
    Job Description:
    {job_description}

    Resume:
    {resume_text}
    
    Format your response EXACTLY as a valid JSON object. Do not include markdown formatting like ```json.
    
    Required JSON structure:
    {{
        "match_score": 85,
        "matching_skills": ["skill1", "skill2"],
        "missing_skills": ["skill3"],
        "recommendation": "Interview"
    }}
    """

    try:
        # Mocked response for local testing without a real key
        if os.getenv("OPENAI_API_KEY") is None or "dummy" in os.getenv("OPENAI_API_KEY", "dummy"):
            return {
                "match_score": 82,
                "matching_skills": ["Python", "FastAPI"],
                "missing_skills": ["AWS", "Docker"],
                "recommendation": "Interview"
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
        print(f"Error scoring candidate with LLM: {e}")
        return None
