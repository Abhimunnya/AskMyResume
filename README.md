# AskMyResume 🧠💬

**An AI-powered personal portfolio chatbot — ask it anything about me, and it answers grounded in my actual resume.**

Think of it as a ChatGPT-style interface, except the "knowledge" is a single structured profile — mine — extracted and validated from my resume using an LLM. No hallucinated answers, no made-up experience: just what's actually on paper, answered conversationally.

---

## 🚀 What it does

- Parses a resume (PDF) into clean, structured JSON using an LLM + a strict Pydantic schema
- Caches that structured profile once at server startup — no redundant re-parsing per request
- Answers visitor questions about skills, experience, education, and projects, grounded strictly in that data
- Politely declines to answer anything not actually covered in the resume, rather than guessing
- Wrapped in a ChatGPT/Claude-style chat UI: centered input on load, docks to the bottom once a conversation starts, full Markdown rendering for formatted answers

## 🏗️ How it works

```
Resume (PDF)
     │
     ▼
 pypdf text extraction
     │
     ▼
 LLM (Groq · openai/gpt-oss-120b) + Pydantic schema
     │
     ▼
 Structured Resume object (cached at startup)
     │
     ▼
 Visitor question ──► LLM (grounded in cached resume) ──► Answer
```

The resume is parsed **once**, when the FastAPI server starts — not on every question — so repeated visitors get fast, cheap responses instead of triggering a fresh parse each time.

## 🛠️ Tech stack

**Backend**
- FastAPI + Uvicorn
- Groq API (`openai/gpt-oss-120b`) for LLM calls
- Pydantic for schema validation and structured LLM output
- pypdf for PDF text extraction
- uv for Python dependency management

**Frontend**
- React + Vite
- Tailwind CSS v4
- react-markdown + @tailwindcss/typography for rendered chat responses

## 💻 Running it locally

**Backend**
```bash
cd backend
uv sync
# create a .env file with GROQ_API_KEY=your_key_here
uv run uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend/hiremeai
npm install
npm run dev
```

The frontend expects the backend running at `http://127.0.0.1:8000`.

## 📸 Preview

*(Add a screenshot or short demo GIF of the chat UI here)*

## 🎯 Why I built this

Most portfolio sites are static — a wall of text a recruiter has to skim. This one lets them just *ask*. It's also a genuine excuse to build a full slice of an AI product end-to-end: structured LLM output, schema validation, a real backend, and a polished frontend — not just a prompt-in-a-notebook demo.

---

*Built by Abhimunnya Dey*
