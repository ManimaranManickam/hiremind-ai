import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy_key"))

def generate_hr_insights(candidates_data: list):
    """
    Generates HR analytics and insights based on a list of candidate data.
    """
    prompt = f"""
    You are an AI HR Analyst. Analyze the following aggregate candidate data and provide insights.
    
    Candidates Data:
    {json.dumps(candidates_data)}
    
    Format your response EXACTLY as a valid JSON object. Do not include markdown formatting like ```json.
    
    Required JSON structure:
    {{
        "total_candidates": 5,
        "average_score": 75.5,
        "top_skills_pool": ["skill1", "skill2"],
        "hiring_recommendation": "Focus on sourcing more candidates with Docker experience."
    }}
    """

    try:
        # Mocked response for local testing without a real key
        if os.getenv("OPENAI_API_KEY") is None or "dummy" in os.getenv("OPENAI_API_KEY", "dummy"):
            return {
                "total_candidates": len(candidates_data) if candidates_data else 0,
                "average_score": 80.0,
                "top_skills_pool": ["Python", "React", "SQL"],
                "hiring_recommendation": "The current candidate pool is strong in backend development but lacks frontend expertise."
            }

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI HR Analyst. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        result_text = response.choices[0].message.content
        return json.loads(result_text)
    except Exception as e:
        print(f"Error generating HR insights with LLM: {e}")
        return None
