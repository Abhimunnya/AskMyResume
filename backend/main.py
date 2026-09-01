
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, ValidationError
from pypdf import PdfReader

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

model = "openai/gpt-oss-120b"
app = FastAPI()

# Allow your frontend (running on a different port/domain) to call this API.
# "*" is fine for local dev; restrict this to your actual frontend URL once deployed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Schemas ----------

class Experience(BaseModel):
    company: str | None = None
    role: str | None = None
    duration: str | None = None
    description: str | None = None
    skills_used: list[str] = []

class Resume(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    total_experience_years: float | None = None
    skills: list[str] = []
    experiences: list[Experience] = []
    education: list[str] = []
    projects: list[str] = []
    certifications: list[str] = []

resume_schema = Resume.model_json_schema()

class ChatRequest(BaseModel):
    question: str


# ---------- Core logic ----------

def ask_candidate(question: str, resume: Resume):
    system_prompt = f"""
You are an AI assistant representing a job candidate.

Below is everything you know about the candidate.

{resume.model_dump_json(indent=2)}

Rules:

1. Answer only using this information.
2. Never hallucinate.
3. If information is unavailable, say
"I don't have enough information to answer that."
4. Be professional.
5. Answer as if HR is interviewing this candidate.
"""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
        )
    except Exception as e:
        # Any network/API-level failure from Groq lands here.
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {e}")

    return response.choices[0].message.content


def parse_resume(resume_text: str) -> Resume:
    system_prompt = f"""
    You are an expert resume parser.

    Extract information from the resume based on its meaning,
    not only based on exact section headings.

    Different resumes may use different headings.

    For example:
    - Experience
    - Professional Experience
    - Work History
    - Employment
    - Internships

    These may all contain relevant experience.

    Skills may also appear in the skills section, work experience,
    internships or projects.

    Return ONLY valid JSON matching this schema:

    {resume_schema}

    Important rules:

    1. Do not invent information.
    2. If a value is not available, return null.
    3. If a list has no information, return an empty list.
    4. Include internships inside experiences.
    5. Extract skills mentioned across the entire resume.
    """
    user_prompt = f"""
    Parse the following resume:

    {resume_text}
    """

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )
    raw_output = response.choices[0].message.content

    try:
        data = json.loads(raw_output)
        return Resume(**data)
    except (json.JSONDecodeError, ValidationError) as e:
        # The LLM returned something that isn't valid JSON, or valid JSON
        # that doesn't match our Resume schema (wrong types, etc).
        raise ValueError(f"Failed to parse resume into structured data: {e}")


def read_pdf(file_path: Path) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text


# ---------- Startup: parse the resume ONCE ----------

RESUME_PATH = Path("Abhimunnya_Dey_Resume(Updated)_Latex.pdf")
cached_resume: Resume | None = None
resume_load_error: str | None = None

@app.on_event("startup")
def load_resume_on_startup():
    global cached_resume, resume_load_error
    try:
        resume_text = read_pdf(RESUME_PATH)
        cached_resume = parse_resume(resume_text)
        print("Resume parsed and cached successfully.")
    except Exception as e:
        resume_load_error = str(e)
        print(f"Failed to load resume at startup: {resume_load_error}")


# ---------- Routes ----------

@app.get("/")
def home():
    return {"message": "This is home page"}


@app.post("/chat")
def chat(request: ChatRequest):
    if cached_resume is None:
        raise HTTPException(
            status_code=500,
            detail=f"Resume is not loaded: {resume_load_error}",
        )

    answer = ask_candidate(request.question, cached_resume)
    return {"answer": answer}









































# import json
# import os
# from pathlib import Path

# from dotenv import load_dotenv
# from fastapi import FastAPI
# from groq import Groq
# from pydantic import BaseModel
# from pypdf import PdfReader

# load_dotenv()

# client = Groq(
#     api_key=os.getenv("GROQ_API_KEY")
# )

# model = "openai/gpt-oss-120b"
# app=FastAPI()



# #parse resume
# class Experience(BaseModel):
#     company: str | None = None
#     role: str | None = None
#     duration: str | None = None
#     description: str | None = None
#     skills_used: list[str] = []

# class Resume(BaseModel):
#     name: str | None = None
#     email: str | None = None
#     phone: str | None = None

#     total_experience_years: float | None = None

#     skills: list[str] = []
#     experiences: list[Experience] = []
#     education: list[str] = []
#     projects: list[str] = []
#     certifications: list[str] = []
# resume_schema = Resume.model_json_schema()

# class ChatRequest(BaseModel):
#     question: str

# def ask_candidate(question: str, resume: Resume):

#     system_prompt = f"""
# You are an AI assistant representing a job candidate.

# Below is everything you know about the candidate.

# {resume.model_dump_json(indent=2)}

# Rules:

# 1. Answer only using this information.

# 2. Never hallucinate.

# 3. If information is unavailable,
# say

# "I don't have enough information to answer that."

# 4. Be professional.

# 5. Answer as if HR is interviewing this candidate.
# """

#     response = client.chat.completions.create(

#         model=model,

#         messages=[

#             {
#                 "role":"system",
#                 "content":system_prompt
#             },

#             {
#                 "role":"user",
#                 "content":question
#             }

#         ]

#     )

#     return response.choices[0].message.content

# def parse_resume(resume_text):
#     system_prompt = f"""
#     You are an expert resume parser.

#     Extract information from the resume based on its meaning,
#     not only based on exact section headings.

#     Different resumes may use different headings.

#     For example:
#     - Experience
#     - Professional Experience
#     - Work History
#     - Employment
#     - Internships

#     These may all contain relevant experience.

#     Skills may also appear in the skills section, work experience,
#     internships or projects.

#     Return ONLY valid JSON matching this schema:

#     {resume_schema}

#     Important rules:

#     1. Do not invent information.
#     2. If a value is not available, return null.
#     3. If a list has no information, return an empty list.
#     4. Include internships inside experiences.
#     5. Extract skills mentioned across the entire resume.
#     """
#     user_prompt = f"""
#     Parse the following resume:

#     {resume_text}
#     """
#     message_system={
#         "role" : "system",
#         "content" : system_prompt
#     }
#     message_user={
#         "role" : "user",
#         "content" : user_prompt
#     }
#     messages=[message_system, message_user]
#     response_format={
#         "type": "json_object"
#     }
#     response=client.chat.completions.create(model=model, messages=messages, response_format=response_format)
#     raw_output = response.choices[0].message.content
#     data = json.loads(raw_output)
#     resume = Resume(**data)
#     return resume

# #pdf extraction
# def read_pdf(file_path: Path):

#     reader = PdfReader(file_path)

#     text = ""

#     for page in reader.pages:

#         page_text = page.extract_text()

#         if page_text:
#             text += page_text + "\n"

#     return text

# @app.get("/")
# def home():
#     # resume_text=read_pdf(Path("my_resume.pdf"))
#     # resume=parse_resume(resume_text)
#     return {
#         "message" : "This is home page"
#     }
# # chatgpt.cpom
# #chatgot.com/aceeddferre5e


# @app.post("/chat")
# def chat(request: ChatRequest):
#     resume_text=read_pdf(Path("Abhimunnya_Dey_Resume.pdf"))
#     resume=parse_resume(resume_text)
#     answer=ask_candidate(request.question, resume)
#     return {
#         "answer": answer
#     }




# youtube.com
# youtube.com/padho_with_pratyush
# youtube.com/padho_with_pratyush/videos
# youtube.com/padho_with_pratyush/playlists