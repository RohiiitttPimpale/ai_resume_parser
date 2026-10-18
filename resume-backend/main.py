import joblib
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from resume_parser import clean, extract_info, extract_text

app = FastAPI(title="AI Resume Parser API")

# Development: allow every origin. Before submission, replace "*" with your front-end URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the files saved by train.py (loaded once when the server starts)
model = joblib.load("model/model.pkl")
vectorizer = joblib.load("model/vectorizer.pkl")

MAX_SIZE = 5 * 1024 * 1024  # 5 MB, same limit as the front end


@app.get("/health")
def health():
    return {"status": "ok", "categories": [str(c) for c in model.classes_]}


@app.post("/parse")
async def parse(file: UploadFile = File(...)):
    filename = file.filename or ""
    if not filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF or DOCX files are allowed")

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File is larger than 5 MB")

    try:
        text = extract_text(data, filename)
    except Exception:
        raise HTTPException(status_code=422, detail="Could not read this file. It may be corrupted")

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found. Scanned or image-only resumes are not supported",
        )

    # Branch 1: rule-based and spaCy extraction
    info = extract_info(text)

    # Branch 2: trained model predicts the job category
    proba = model.predict_proba(vectorizer.transform([clean(text)]))[0]
    best = int(proba.argmax())
    info["jobCategory"] = str(model.classes_[best])
    info["confidence"] = round(float(proba[best]) * 100, 1)

    return info


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
