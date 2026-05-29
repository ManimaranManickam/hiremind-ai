import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy_key"))
USE_MOCK = os.getenv("OPENAI_API_KEY") is None or "dummy" in os.getenv("OPENAI_API_KEY", "dummy")


def generate_interview_questions(job_title: str, job_description: str, candidate_skills: list = None, num_questions: int = 5):
    """
    Generates tailored interview questions based on the job and candidate profile.
    """
    skills_str = ", ".join(candidate_skills) if candidate_skills else "general skills"

    if USE_MOCK:
        return [
            f"Round 1 (Aptitude): A company is evaluating two software solutions. Solution A costs $10,000 upfront and $500/month. Solution B costs $0 upfront but $1,000/month. How many months until Solution A becomes the cheaper option?",
            f"Round 2 (Coding/Technical): You are designing a high-traffic web application for {job_title}. Walk me through how you would design the caching layer to minimize database load.",
            f"Round 3 (HR/Behavioral): You mentioned experience with {skills_str} on your resume. Can you describe a specific time you used these skills to overcome a difficult challenge?"
        ]

    prompt = f"""
    You are an expert technical interviewer conducting a 3-round interview.
    Generate EXACTLY 3 insightful interview questions for a candidate applying to the role: {job_title}.

    Round 1 must be an Aptitude or Logical reasoning question.
    Round 2 must be a Technical/Coding question relevant to {job_title} and Job Description: {job_description}.
    Round 3 must be a Final HR/Behavioral question specifically referencing the Candidate Skills: {skills_str}.

    Return ONLY a valid JSON array of 3 question strings. No markdown, no explanation.
    Example: ["Aptitude Question?", "Coding Question?", "HR Question?"]
    """
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert technical interviewer. Return only a valid JSON array of 3 strings."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error generating questions: {e}")
        return [
            f"Aptitude: A train travels 60 miles in 1.5 hours. What is its average speed in miles per hour?",
            f"Technical: For a {job_title} role, how would you optimize a slow-performing database query?",
            f"HR: Based on your skills in {skills_str}, describe a time you had to learn a new technology quickly."
        ]


def analyze_interview_transcript(transcript: str, job_requirements: str):
    """
    Analyzes an interview transcript using an LLM to score the candidate.
    """
    prompt = f"""
    You are an expert Technical Interviewer. Analyze the following interview transcript
    and evaluate the candidate against the job requirements.

    Job Requirements: {job_requirements}
    Interview Transcript: {transcript}

    Format your response EXACTLY as a valid JSON object. Do not include markdown.

    Required JSON structure:
    {{
        "communication_score": 8.5,
        "technical_score": 7.0,
        "cultural_fit_score": 9.0,
        "overall_score": 8.2,
        "overall_recommendation": "Strong Hire",
        "key_strengths": ["Clear communicator", "Strong problem-solving"],
        "areas_to_improve": ["Could elaborate more on technical depth"],
        "feedback": "Detailed feedback on candidate performance."
    }}
    """
    try:
        if USE_MOCK:
            return {
                "communication_score": 8.5,
                "technical_score": 7.5,
                "cultural_fit_score": 9.0,
                "overall_score": 8.3,
                "overall_recommendation": "Strong Hire",
                "key_strengths": [
                    "Excellent communication skills — answers were clear and structured",
                    "Demonstrated strong problem-solving mindset with real examples",
                    "Shows genuine enthusiasm for the role and company mission"
                ],
                "areas_to_improve": [
                    "Could provide more depth on specific technical implementations",
                    "Consider quantifying achievements with concrete metrics"
                ],
                "feedback": "The candidate presented themselves confidently and communicated ideas clearly. They showed strong cultural alignment and relevant experience. Technical knowledge is solid, though deeper implementation examples would strengthen their profile. Overall a recommended hire."
            }

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI interviewer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error analyzing interview: {e}")
        return None
