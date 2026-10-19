# AI Resume Parser 📄✨

An AI-powered full-stack web application that parses resumes in PDF and DOCX formats, extracting structured details (Candidate Profile, Skills, Work Experience, Education) and predicting the candidate's job category using Machine Learning and NLP.

---

## 🌟 Key Features

- **Multi-Format Document Parsing:** Supports PDF and DOCX documents with automated text extraction.
- **Rule & NLP Extraction:** Employs **spaCy** NER and regex rules to accurately identify candidate names, emails, phone numbers, and formatted degree/institute details.
- **Section-Aware Processing:** Intelligently separates educational qualifications from work experience, handling undergraduate degrees and date ranges cleanly.
- **ML Job Classification:** Predicts the best-fitting job category across 24 domains (e.g., Engineering, Data Science, Healthcare, Finance) with a confidence score.
- **Futuristic Sci-Fi UI:** Dark glassmorphism theme, Orbitron typography, neon accents, interactive JSON inspection, and toast notifications.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`resume-frontend`)
- **Framework:** React 19 + TypeScript + Vite
- **Routing & State:** TanStack Start / TanStack Router + TanStack Query
- **Styling & Components:** TailwindCSS v4, shadcn/ui, Radix UI primitives, Lucide icons
- **Feedback:** Sonner toast alerts

### Backend (`resume-backend`)
- **API Framework:** FastAPI + Uvicorn (ASGI)
- **NLP & Parsing:** spaCy (`en_core_web_sm`), pdfplumber, python-docx
- **Machine Learning:** Scikit-Learn TF-IDF Vectorizer + Multinomial Classification Model, Joblib

---

## 📁 Repository Structure

```text
ai_resume_parser/
├── resume-backend/          # FastAPI Backend & ML Model
│   ├── data/                # Training datasets (Resume.csv)
│   ├── model/               # Serialized model.pkl and vectorizer.pkl
│   ├── main.py              # FastAPI server entrypoint & endpoints
│   ├── resume_parser.py     # Rule-based NLP extraction logic
│   └── train.py             # Model training script
│
├── resume-frontend/         # React + Vite Frontend
│   ├── src/                 # Application source code
│   │   ├── api/             # API client functions (parseResume.ts)
│   │   ├── components/      # UI & resume components (UploadCard, cards.tsx)
│   │   └── routes/          # TanStack router routes
│   ├── package.json         # Node dependencies & scripts
│   └── vite.config.ts       # Vite build configuration
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

---

### 2. Backend Setup (`resume-backend`)

1. Navigate to the backend directory:
   ```bash
   cd resume-backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Download the spaCy English language model:
   ```bash
   python -m spacy download en_core_web_sm
   ```

4. Run the backend API server:
   ```bash
   python main.py
   ```
   The backend will be live at `http://127.0.0.1:8000`. You can inspect the interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.

---

### 3. Frontend Setup (`resume-frontend`)

1. Navigate to the frontend directory:
   ```bash
   cd resume-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173/`.

---

## 📡 API Reference

### Health Check
- **Endpoint:** `GET /health`
- **Response:**
  ```json
  {
    "status": "ok",
    "categories": ["ENGINEERING", "INFORMATION-TECHNOLOGY", ...]
  }
  ```

### Parse Resume
- **Endpoint:** `POST /parse`
- **Content-Type:** `multipart/form-data`
- **Body:** `file` (PDF or DOCX, max 5 MB)
- **Response:**
  ```json
  {
    "name": "Rohit Pimpale",
    "email": "pimpalerohit26@gmail.com",
    "phone": "1010101010",
    "skills": ["C++", "Docker", "Machine Learning", "Python", "SQL", "TypeScript"],
    "experience": [],
    "education": [
      {
        "degree": "Bachelor of Engineering in Computer Engineering, CGPA: 10/10",
        "institute": "Smt. Indira Gandhi College of Engineering",
        "year": "2024 – 2028"
      }
    ],
    "jobCategory": "ENGINEERING",
    "confidence": 37.3
  }
  ```

---

## 📄 License
This project is open source and available under the MIT License.
